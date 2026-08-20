import os
import json
import markdown
from flask import Flask, render_template, request, jsonify, send_from_directory
from rag_engine import rag_service, KB_FILE, EVOLVING_FILE
from web_researcher import web_researcher, CACHE_DIR
from llm_client import llm_service

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config['SECRET_KEY'] = 'clinical-rag-decision-support-key'

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Clinical Decision Support RAG Analyzer",
        "firecrawl_configured": bool(web_researcher.firecrawl_api_key),
        "kb_documents_count": len(rag_service.kb_documents),
        "evolving_cases_count": len(rag_service.evolving_cases)
    })

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json() or {}
    symptoms = str(data.get("symptoms", "")).strip()
    history = str(data.get("history", "")).strip()
    age = str(data.get("age", "")).strip()
    duration = str(data.get("duration", "")).strip()
    severity = str(data.get("severity", "Moderate (5/10)")).strip()
    mode = data.get("mode", "rag")  # 'rag' or 'long_context'
    provider = data.get("provider", "cliproxy")
    model = data.get("model", "gemini-3.6-flash-high")
    base_url = data.get("base_url", "").strip() or None
    user_api_key = data.get("api_key", "").strip() or None

    if not symptoms:
        return jsonify({"error": "Please provide symptom descriptions."}), 400

    if len(symptoms) > 5000:
        return jsonify({"error": "Symptom description exceeds maximum allowed length of 5000 characters."}), 400

    # 1. Targeted or Long-Context Retrieval Phase
    if mode == "long_context":
        context_data = rag_service.build_long_context()
    else:
        context_data = rag_service.retrieve_context(symptoms, history, age, duration, top_k=4)

    # 2. LLM Reasoning + Firecrawl Web Research Interceptor
    result = llm_service.analyze_symptoms(
        symptoms=symptoms,
        history=history,
        age=age,
        duration=duration,
        severity=severity,
        provider=provider,
        model=model,
        base_url=base_url,
        rag_context=context_data,
        user_api_key=user_api_key
    )

    raw_markdown = result["analysis_markdown"]
    rankings = result["rankings"]
    web_research = result["web_research"]

    # 3. Self-Evolving Knowledge Loop Storage
    demographics = f"{age}yo" if age else "Adult"
    if history:
        demographics += f", History: {history}"
    
    saved_case = rag_service.add_evolving_case(
        presented_symptoms=symptoms,
        demographics=demographics,
        ranking=rankings,
        reasoning=raw_markdown[:400],
        outcome=f"AI CDS analysis generated with {mode.upper()} mode."
    )

    # Convert markdown to formatted HTML
    rendered_html = markdown.markdown(raw_markdown, extensions=['extra', 'tables', 'nl2br'])

    return jsonify({
        "success": True,
        "mode_used": mode,
        "provider_used": result.get("provider_used", provider),
        "rankings": rankings,
        "analysis_html": rendered_html,
        "analysis_markdown": raw_markdown,
        "retrieved_context": context_data,
        "web_research": web_research,
        "saved_case_id": saved_case.get("case_id"),
        "evolving_knowledge_total": len(rag_service.evolving_cases)
    })

@app.route("/api/documents", methods=["GET"])
def get_documents():
    return jsonify({
        "knowledge_base": rag_service.kb_documents,
        "evolving_cases": rag_service.evolving_cases
    })

@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify({
        "cases": rag_service.evolving_cases[::-1]
    })

@app.route("/api/research", methods=["POST"])
def direct_research():
    data = request.get_json() or {}
    query = data.get("query_or_url", "").strip()
    if not query:
        return jsonify({"error": "Query topic or URL is required."}), 400
    
    res = web_researcher.fetch_and_convert(query)
    return jsonify(res)

@app.route("/api/research-cache", methods=["GET"])
def list_research_cache():
    files = []
    if os.path.exists(CACHE_DIR):
        for f in sorted(os.listdir(CACHE_DIR), reverse=True):
            if f.endswith(".md"):
                fpath = os.path.join(CACHE_DIR, f)
                files.append({
                    "filename": f,
                    "size_bytes": os.path.getsize(fpath),
                    "modified_time": os.path.getmtime(fpath)
                })
    return jsonify({"cached_reports": files})

@app.route("/api/research-cache/<filename>", methods=["GET"])
def get_cached_file(filename):
    return send_from_directory(CACHE_DIR, filename, as_attachment=False)

@app.route("/api/research-cache", methods=["DELETE"])
def clear_research_cache():
    deleted_count = 0
    if os.path.exists(CACHE_DIR):
        for f in os.listdir(CACHE_DIR):
            if f.endswith(".md"):
                try:
                    os.remove(os.path.join(CACHE_DIR, f))
                    deleted_count += 1
                except Exception:
                    pass
    return jsonify({"success": True, "deleted_count": deleted_count})

@app.route("/api/stats", methods=["GET"])
def get_stats():
    cached_count = len([f for f in os.listdir(CACHE_DIR) if f.endswith(".md")]) if os.path.exists(CACHE_DIR) else 0
    return jsonify({
        "kb_documents_count": len(rag_service.kb_documents),
        "evolving_cases_count": len(rag_service.evolving_cases),
        "research_cache_count": cached_count,
        "firecrawl_configured": bool(web_researcher.firecrawl_api_key),
        "cliproxy_configured": bool(llm_service.cliproxy_api_key),
        "gemini_configured": bool(llm_service.gemini_api_key),
        "openrouter_configured": bool(llm_service.openrouter_api_key)
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error", "detail": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Clinical Decision Support RAG Server on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
