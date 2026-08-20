import json
import os
import math
import re
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
KB_FILE = os.path.join(DATA_DIR, "knowledge_base.json")
EVOLVING_FILE = os.path.join(DATA_DIR, "evolving_knowledge.json")

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
            text_corpus = f"{doc.get('condition', '')} {doc.get('system', '')} {' '.join(doc.get('typical_symptoms', []))} {' '.join(doc.get('risk_factors', []))} {' '.join(doc.get('differential_diagnoses', []))} {doc.get('authoritative_source', '')}"
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
            text_corpus = f"{case.get('patient_demographics', '')} {' '.join(case.get('presented_symptoms', []))} {diff_text} {case.get('clinical_takeaway', '')} {case.get('outcome_validation', '')}"
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
        query_tokens = tokenize(query_text)
        if not query_tokens:
            return []

        # BM25-style term frequency + inverse doc frequency scoring
        scores = []
        N = len(self.doc_index)
        for item in self.doc_index:
            score = 0.0
            doc_tokens = item["tokens"]
            doc_len = len(doc_tokens) or 1
            
            # Match token overlap
            for q in query_tokens:
                if q in item["token_set"]:
                    tf = doc_tokens.count(q) / doc_len
                    # IDF approximation
                    df = sum(1 for d in self.doc_index if q in d["token_set"])
                    idf = math.log(1 + (N - df + 0.5) / (df + 0.5))
                    score += tf * (idf + 1.0) * 10.0
                    
            # Boost matches in condition title
            title_tokens = set(tokenize(item["title"]))
            title_overlap = len(set(query_tokens) & title_tokens)
            score += title_overlap * 15.0

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
        new_case = {
            "case_id": case_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "patient_demographics": demographics or "Not specified",
            "presented_symptoms": [s.strip() for s in presented_symptoms.split(",") if s.strip()] if isinstance(presented_symptoms, str) else presented_symptoms,
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
