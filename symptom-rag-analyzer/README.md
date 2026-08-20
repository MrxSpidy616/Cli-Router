# AI-Powered Symptom Analysis and Clinical Decision Support (CDS) RAG System

A web-based **Clinical Decision Support (CDS)** and differential diagnosis system built with **Python + Flask**, implementing both **Retrieval-Augmented Generation (RAG)** and **Long-Context** architectures.

---

## 🌟 Core Features

1. **Percentage-Based Differential Diagnosis:** Generates ranked probabilistic estimates for conditions (e.g., *Condition A: 65%*, *Condition B: 20%*, *Condition C: 15%*) based on symptom constellations, demographics, and clinical guidelines.
2. **Dual Context Architectures (RAG vs Long-Context):**
   - **RAG Mode:** High-efficiency BM25 semantic chunk retrieval from WHO, NIH, CDC, and ICD-10 medical knowledge bases.
   - **Long-Context Mode ("No-Stack Stack"):** Ingests the full clinical repository directly into the LLM's extended context window (1M+ tokens) for global gap analysis.
3. **Self-Evolving Knowledge Loop:** Automatically persists analyzed cases into `data/evolving_knowledge.json`. Subsequent patient evaluations retrieve both base guidelines and verified historical cases.
4. **Token-Triggered Web Research:** Scans LLM output for custom trigger tokens (e.g. `[WEB_SEARCH: <valid_url>]`). When detected, the engine fetches the external webpage, parses it into clean Markdown, stores it in `data/research_cache/`, and injects verified findings back into the reasoning loop.
5. **FDA CDS & WHO AI Ethics Compliance:** Strict non-diagnostic positioning, red-flag triaging alerts, and medical regulatory disclaimers.

---

## 📁 Directory Structure

```
symptom-rag-analyzer/
├── app.py                     # Flask web server & REST API
├── rag_engine.py              # Semantic retrieval, BM25 indexing & Evolving case store
├── web_researcher.py          # Token interceptor, HTML-to-Markdown parser & web fetcher
├── llm_client.py              # Multi-model gateway (Free OpenRouter / Gemini / Heuristics)
├── prompt.md                  # Master CDS System Prompt & Architectural Rules
├── requirements.txt           # Dependencies (Flask, requests, beautifulsoup4, markdown)
├── data/
│   ├── knowledge_base.json    # Authoritative clinical guidelines (ICD-10, symptoms, red flags)
│   ├── evolving_knowledge.json# Persistent self-evolving case archive
│   └── research_cache/        # Saved Markdown web research documents
├── templates/
│   └── index.html             # Responsive Clinical Decision Support web interface
└── static/
    ├── style.css              # Modern clinical dark UI & animated percentage progress bars
    └── app.js                 # Asynchronous client controller & case presets
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd symptom-rag-analyzer
pip install -r requirements.txt
```

### 2. Configure Model Provider (Optional)
The system runs out-of-the-box using free community models or offline clinical heuristics. To use your own API keys:

```bash
# Option A: Google Gemini
export GEMINI_API_KEY="your-gemini-key"

# Option B: OpenRouter
export OPENROUTER_API_KEY="your-openrouter-key"
```

### 3. Run the Flask Web Application
```bash
python app.py
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🔌 API Endpoints

### `POST /api/analyze`
Submits symptoms for differential ranking.
```json
{
  "symptoms": "Persistent dry cough, mild fever, chest tightness",
  "age": "42yo",
  "duration": "4 days",
  "history": "Hypertension, Non-smoker",
  "severity": "5 / 10",
  "mode": "rag",
  "provider": "auto",
  "model": "meta-llama/llama-3.3-70b-instruct:free"
}
```

### `GET /api/documents`
Returns all indexed clinical guidelines and evolving cases.

### `GET /api/history`
Returns historical cases stored in the self-evolving knowledge loop.

### `POST /api/research`
Directly converts a medical URL or query to a cached Markdown document.
