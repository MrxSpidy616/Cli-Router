import json
import os
import math
import re
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
KB_FILE = os.path.join(DATA_DIR, "knowledge_base.json")
EVOLVING_FILE = os.path.join(DATA_DIR, "evolving_knowledge.json")

# Medical synonym expansion to boost retrieval recall between laymen terms and clinical terms
MEDICAL_SYNONYMS = {
    "shortness of breath": ["dyspnea", "breathlessness", "wheezing", "hypoxia", "respiratory"],
    "breathless": ["dyspnea", "shortness of breath", "hypoxia", "wheeze"],
    "chest pain": ["angina", "myocardial", "infarction", "coronary", "ischemia", "pleurisy", "substernal"],
    "chest tightness": ["angina", "bronchospasm", "asthma", "ischemia"],
    "heart attack": ["myocardial", "infarction", "stemi", "nstemi", "coronary"],
    "high blood pressure": ["hypertension", "hypertensive", "systolic", "diastolic"],
    "belly pain": ["abdominal", "epigastric", "colic", "cramping", "peritoneal", "appendicitis", "cholecystitis"],
    "stomach pain": ["abdominal", "gastric", "epigastric", "peptic", "gastroenteritis", "cramping"],
    "tummy ache": ["abdominal", "gastroenteritis", "cramping", "colic"],
    "fever": ["pyrexia", "febrile", "temperature", "chills", "rigors"],
    "headache": ["migraine", "cephalalgia", "tension", "throbbing", "temporal"],
    "dizziness": ["vertigo", "presyncope", "lightheadedness", "ataxia"],
    "throwing up": ["vomiting", "nausea", "emesis", "gastroenteritis"],
    "vomit": ["emesis", "nausea", "gastroenteritis", "norovirus"],
    "loose stools": ["diarrhoea", "diarrhea", "enteritis", "gastroenteritis"],
    "diarrhea": ["diarrhoea", "loose stools", "enteritis", "gastroenteritis", "colitis"],
    "stroke": ["cerebrovascular", "cva", "infarction", "ischemia", "hemiplegia", "aphasia"],
    "blood clot": ["thrombosis", "embolism", "dvt", "embolus", "thrombus"],
    "itchy": ["pruritus", "urticaria", "eczema", "dermatitis"],
    "rash": ["erythema", "exanthem", "maculopapular", "dermatitis", "eczema", "urticaria"],
    "joint pain": ["arthralgia", "arthritis", "osteoarthritis", "rheumatoid", "gout"],
    "swollen leg": ["edema", "oedema", "deep vein thrombosis", "dvt", "cellulitis"],
    "cough": ["bronchitis", "pneumonia", "tussis", "sputum", "phlegm", "hemoptysis"]
}

def load_json(filepath, default_data=None):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
    return default_data if default_data is not None else []

def save_json(filepath, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def tokenize(text):
    if not text:
        return []
    # Lowercase, alphanumeric extraction
    return [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-\./]+\b', text) if len(w) > 2]

def expand_query_with_synonyms(query_text):
    """Expands query tokens with clinical and layman synonyms for higher BM25 recall."""
    tokens = tokenize(query_text)
    expanded = list(tokens)
    query_lower = query_text.lower()
    
    for phrase, syns in MEDICAL_SYNONYMS.items():
        if phrase in query_lower:
            for s in syns:
                expanded.extend(tokenize(s))
                
    return list(set(expanded))

class RAGEngine:
    def __init__(self):
        self.kb_documents = load_json(KB_FILE, [])
        self.evolving_cases = load_json(EVOLVING_FILE, [])
        self._build_index()

    def reload(self):
        self.kb_documents = load_json(KB_FILE, [])
        self.evolving_cases = load_json(EVOLVING_FILE, [])
        self._build_index()

    def _build_index(self):
        self.doc_index = []
        
        # Index baseline medical KB
        for doc in self.kb_documents:
            typical_s = " ".join(doc.get("typical_symptoms", []))
            red_f = " ".join(doc.get("red_flags", []))
            risks = " ".join(doc.get("risk_factors", []))
            diffs = " ".join(doc.get("differential_diagnoses", []))
            tests = " ".join(doc.get("recommended_tests", []))
            text_corpus = f"{doc.get('condition', '')} {doc.get('icd10', '')} {doc.get('system', '')} {typical_s} {red_f} {risks} {diffs} {tests} {doc.get('authoritative_source', '')}"
            tokens = tokenize(text_corpus)
            self.doc_index.append({
                "type": "kb",
                "id": doc.get("id"),
                "title": doc.get("condition"),
                "raw": doc,
                "tokens": tokens,
                "token_set": set(tokens)
            })
            
        # Index self-evolving cases
        for case in self.evolving_cases:
            diff_text = " ".join([d.get("condition", "") for d in case.get("differential_ranking", [])])
            symptoms_str = " ".join(case.get("presented_symptoms", [])) if isinstance(case.get("presented_symptoms"), list) else str(case.get("presented_symptoms", ""))
            text_corpus = f"{case.get('patient_demographics', '')} {symptoms_str} {diff_text} {case.get('clinical_takeaway', '')} {case.get('outcome_validation', '')}"
            tokens = tokenize(text_corpus)
            self.doc_index.append({
                "type": "evolving_case",
                "id": case.get("case_id"),
                "title": f"Prior Case: {case.get('case_id')}",
                "raw": case,
                "tokens": tokens,
                "token_set": set(tokens)
            })

    def search_similar(self, query_text, top_k=4):
        expanded_tokens = expand_query_with_synonyms(query_text)
        if not expanded_tokens:
            return []

        N = len(self.doc_index)
        if N == 0:
            return []
            
        avg_doc_len = sum(len(d["tokens"]) for d in self.doc_index) / N
        k1 = 1.5
        b = 0.75

        # Precompute Document Frequencies (DF)
        df_cache = {}
        for q in set(expanded_tokens):
            df_cache[q] = sum(1 for d in self.doc_index if q in d["token_set"])

        scores = []
        for item in self.doc_index:
            score = 0.0
            doc_tokens = item["tokens"]
            doc_len = len(doc_tokens) or 1
            token_counts = {}
            for t in doc_tokens:
                token_counts[t] = token_counts.get(t, 0) + 1
            
            # Standard Okapi BM25 term calculation
            for q in set(expanded_tokens):
                if q in item["token_set"]:
                    tf = token_counts.get(q, 0)
                    df = df_cache.get(q, 0)
                    idf = math.log((N - df + 0.5) / (df + 0.5) + 1.0)
                    term_score = idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_len / avg_doc_len)))
                    score += term_score

            # Title exact match boost
            title_tokens = set(tokenize(item["title"]))
            title_overlap = len(set(expanded_tokens) & title_tokens)
            score += title_overlap * 3.5

            if score > 0:
                scores.append((score, item))

        scores.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scores[:top_k]]

    def retrieve_context(self, symptoms, history="", age=None, duration=None, top_k=4):
        query = f"{symptoms} {history} {duration or ''}"
        matched_items = self.search_similar(query, top_k=top_k)
        
        kb_chunks = []
        evolving_chunks = []
        
        for item in matched_items:
            if item["type"] == "kb":
                d = item["raw"]
                kb_chunks.append({
                    "id": d.get("id"),
                    "condition": d.get("condition"),
                    "icd10": d.get("icd10"),
                    "system": d.get("system"),
                    "typical_symptoms": d.get("typical_symptoms"),
                    "red_flags": d.get("red_flags"),
                    "differentials": d.get("differential_diagnoses"),
                    "recommended_workup": d.get("recommended_tests"),
                    "source": d.get("authoritative_source")
                })
            elif item["type"] == "evolving_case":
                c = item["raw"]
                evolving_chunks.append({
                    "case_id": c.get("case_id"),
                    "demographics": c.get("patient_demographics"),
                    "presented_symptoms": c.get("presented_symptoms"),
                    "differential_ranking": c.get("differential_ranking"),
                    "outcome": c.get("outcome_validation"),
                    "clinical_takeaway": c.get("clinical_takeaway")
                })

        return {
            "mode": "rag_targeted",
            "kb_chunks": kb_chunks,
            "evolving_cases": evolving_chunks,
            "retrieved_count": len(matched_items)
        }

    def build_long_context(self):
        """No-stack stack: Returns the entire catalog in full detail without vector filtering."""
        return {
            "mode": "long_context_full",
            "kb_documents": self.kb_documents,
            "evolving_cases": self.evolving_cases,
            "total_documents": len(self.kb_documents) + len(self.evolving_cases)
        }

    def add_evolving_case(self, presented_symptoms, demographics, ranking, reasoning="", outcome=""):
        case_id = f"CASE-EV-{len(self.evolving_cases) + 1:03d}"
        
        # Deduplicate symptoms list
        if isinstance(presented_symptoms, str):
            symptoms_list = [s.strip() for s in presented_symptoms.split(",") if s.strip()]
        elif isinstance(presented_symptoms, list):
            symptoms_list = presented_symptoms
        else:
            symptoms_list = [str(presented_symptoms)]
            
        new_case = {
            "case_id": case_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "patient_demographics": demographics or "Not specified",
            "presented_symptoms": symptoms_list,
            "differential_ranking": ranking,
            "clinical_takeaway": reasoning[:300] if reasoning else "Analyzed via AI Clinical Decision Support.",
            "outcome_validation": outcome or "Initial clinical evaluation generated."
        }
        self.evolving_cases.append(new_case)
        save_json(EVOLVING_FILE, self.evolving_cases)
        self.reload()
        return new_case

# Global singleton
rag_service = RAGEngine()
