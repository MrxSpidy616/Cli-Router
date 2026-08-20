# 🩺 Easy Health Assistant & Clinical Decision Support (CDS) System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-green.svg)](https://flask.palletsprojects.com/)
[![Firecrawl](https://img.shields.io/badge/Firecrawl-v1%20API-orange.svg)](https://firecrawl.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An advanced **AI-Powered Clinical Decision Support (CDS)** and differential diagnosis system built with **Python + Flask**, featuring **Retrieval-Augmented Generation (RAG)**, **Long-Context Grounding**, real-time **Firecrawl v1 Web Research**, and a **Senior-Friendly Accessible UI**.

---

## 📸 UI Showcase & Test Cases

### 1. 🟢 Positive Test Case (Mild / Low-Risk Result)
*Manageable with simple home care and hydration. Reassuring, large plain-English instructions.*

![Positive Low-Risk UI Result](docs/screenshots/ui_positive_low_risk.jpg)

---

### 2. 🟡 Neutral Test Case (Moderate-Risk / Doctor Follow-Up)
*Triple differential likelihood progress cards with clear diagnostic guidance and 48-hour consultation advice.*

![Neutral Moderate-Risk UI Result](docs/screenshots/ui_neutral_moderate_risk.jpg)

---

### 3. 🔴 Negative / Critical Test Case (Emergency Red Flag Alert)
*High-contrast urgent alert banner with 1-click **"📞 Call 911 Now"** action and red-flag warning protocol.*

![Negative Emergency Red Flag UI Result](docs/screenshots/ui_negative_emergency_alert.jpg)

---

### 4. 🔥 Live Medical Web Research Modal (Firecrawl v1 Integration)
*Real-time deep medical research and live Markdown extraction powered by Firecrawl Search & Scrape API.*

![Firecrawl Live Medical Web Research UI](docs/screenshots/ui_firecrawl_web_research.jpg)

---

## 🌟 Key Capabilities

1. **Dual-Tier Output Architecture:**
   - 👤 **Section A (Plain-Language Patient Summary):** Urgency level (🟢 Mild, 🟡 Moderate, 🔴 Emergency), everyday condition names, 6th-grade reading level explanation, home care checklist, and 911 warning signs.
   - 🩺 **Section B (Detailed Clinician Reference):** Percentage differential probability table, ICD-10 diagnostic coding, pathophysiological concordance, and recommended diagnostic lab/imaging workups.
2. **Firecrawl v1 Deep Web Research:**
   - Scans reasoning streams for `[WEB_SEARCH: <url_or_topic>]` and `[FIRECRAWL_SEARCH: <query>]`.
   - Fetches and scrapes authoritative clinical literature in high-fidelity Markdown, injecting live findings back into the diagnosis loop.
3. **Dual Context Architectures (RAG vs Long-Context):**
   - **RAG Mode:** Okapi BM25 semantic retrieval with medical synonym expansion over WHO, NIH, CDC, GLOBOCAN, and the NHS Inform Scotland directory (433 conditions).
   - **Long-Context Mode:** Ingests the full medical repository into large context windows (1M+ tokens).
4. **Self-Evolving Knowledge Loop:**
   - Automatically archives evaluated cases into persistent memory (`data/evolving_knowledge.json`) to continually refine future differential calibration.
5. **Senior Accessibility:**
   - High-contrast dark theme, large 17px/20px typography, 1-click `A / A+` font resizer, and 1-click common symptom presets.

---

## 📁 Repository Structure

```
.
├── symptom-rag-analyzer/          # Master Clinical Decision Support Application
│   ├── app.py                     # Flask Web Server & REST API
│   ├── rag_engine.py              # BM25 Semantic Indexer & Synonym Expansion Engine
│   ├── web_researcher.py          # Firecrawl v1 Scraper & Search Dispatcher
│   ├── llm_client.py              # Multi-Provider Gateway (CliProxy, Gemini, OpenAI, OpenRouter)
│   ├── prompt.md                  # Master Clinical Knowledge Base & CDS Directives
│   ├── requirements.txt           # Python Dependencies
│   ├── data/
│   │   ├── knowledge_base.json    # 46 Structured Clinical Profiles + Zenodo 13338116 Dataset
│   │   ├── evolving_knowledge.json# Self-Evolving Case Memory Archive
│   │   └── research_cache/        # Cached Markdown Web Research Reports
│   ├── templates/index.html       # Accessible Single-Page Application UI
│   └── static/                    # CSS Styles & Client Controller
├── docs/screenshots/              # High-Resolution UI Mockups & Test Cases
├── index.js                       # Cloudflare Worker Backblaze B2 File Manager Router
├── wrangler.toml                  # Cloudflare Worker Deployment Configuration
└── README.md                      # Project Documentation
```

---

## 🚀 Quick Start

### 1. Installation
```bash
cd symptom-rag-analyzer
pip install -r requirements.txt
```

### 2. Configure Environment Variables (Optional)
```bash
# Firecrawl Web Research Key (Default key pre-configured)
export FIRECRAWL_API_KEY="fc-bfc1c5abb4aa4f69b0da8f12c5b444d6"

# Optional LLM Provider Overrides
export CLIPROXY_API_KEY="aravind616"
export GEMINI_API_KEY="your-gemini-key"
export OPENAI_API_KEY="your-openai-key"
```

### 3. Start Application Server
```bash
python app.py
```
Open **`http://localhost:5000`** in your browser.

---

## 🔌 API Reference

### `POST /api/analyze`
Executes symptom differential analysis with RAG retrieval and dual-layer output.

### `POST /api/research`
Conducts live web research or URL scraping via Firecrawl v1.
```bash
curl -X POST http://localhost:5000/api/research \
  -H "Content-Type: application/json" \
  -d '{"query_or_url": "NHS Inform Scotland stroke signs"}'
```

### `GET /api/health` & `GET /api/stats`
Returns system health, document counts, and Firecrawl engine status.

---

## ⚖️ Regulatory Compliance Notice
This system operates strictly under **FDA Clinical Decision Support (CDS) Guidance** and **WHO AI Health Ethics Principles**. It is intended as an informational clinical support tool and does not issue binding medical diagnoses or replace an in-person evaluation by a licensed physician.

---

## 📄 License
MIT License.