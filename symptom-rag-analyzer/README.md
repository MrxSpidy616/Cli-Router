# 🩺 Health Assistant — AI Clinical Decision Support (CDS) System

A humane, senior-friendly **AI Clinical Decision Support (CDS)** and differential diagnosis system built with **Python + Flask**, designed with **radical minimalism** following the [Claude Design Principles](../design.md). Features invisible backend **Retrieval-Augmented Generation (RAG)**, **Long-Context Grounding**, and real-time **Web Research**.

---

## 📸 Minimalist UI Showcase & Test Cases

### 1. 🌿 Minimalist Home & Input State
![Minimalist Home State](docs/screenshots/ui_minimal_home.jpg)

### 2. 🟢 Positive Test Case (Mild / Low-Risk Result)
![Positive Low-Risk UI Result](docs/screenshots/ui_positive_low_risk.jpg)

### 3. 🟡 Neutral Test Case (Moderate-Risk / Doctor Follow-Up)
![Neutral Moderate-Risk UI Result](docs/screenshots/ui_neutral_moderate_risk.jpg)

### 4. 🔴 Negative / Critical Test Case (Emergency Red Flag Alert)
![Negative Emergency Red Flag UI Result](docs/screenshots/ui_negative_emergency_alert.jpg)

---

## 🌟 Core Features

1. **Radical Minimalism & Human-Centric Design:**
   - Designed strictly following [Claude Design System Principles](../design.md) — zero developer clutter, zero technical badges, and no raw API forms exposed to patients.
   - Senior-accessible high-contrast dark theme, large 17px/21px typography, and 1-click quick symptom presets.
2. **Dual-Tier Output Architecture:**
   - 👤 **Patient Summary:** Urgency badge (🟢 Mild, 🟡 Moderate, 🔴 Emergency), everyday condition names, 6th-grade reading level explanation, and home care steps.
   - 🩺 **Clinical Notes:** Clean, discreet accordion with structured medical references and ICD-10 diagnostic coding.
3. **Invisible Background Intelligence:**
   - **RAG Mode:** Okapi BM25 semantic retrieval with medical synonym expansion over WHO, NIH, CDC, GLOBOCAN, and the NHS Inform Scotland directory (433 conditions).
   - **Real-Time Web Research:** Deep clinical literature verification executes silently under the hood.
4. **Self-Evolving Knowledge Loop:**
   - Automatically archives evaluated cases into persistent memory (`data/evolving_knowledge.json`) to continually refine future differential calibration.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables (Optional)
```bash
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

## 🔌 API Endpoints

### `POST /api/analyze`
Submits symptoms for differential ranking and dual-tier CDS output.

### `GET /api/documents`
Returns all indexed clinical guidelines and evolving cases.

### `GET /api/history`
Returns historical cases stored in the self-evolving knowledge loop.

### `GET /api/health` & `GET /api/stats`
Returns system health, document counts, and engine status.

---

## ⚖️ Regulatory Compliance Notice
This system operates strictly under **FDA Clinical Decision Support (CDS) Guidance** and **WHO AI Health Ethics Principles**. It is intended as an informational clinical support tool and does not issue binding medical diagnoses or replace an in-person evaluation by a licensed physician.

---

## 📄 License
MIT License.
