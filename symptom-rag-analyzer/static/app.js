document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const form = document.getElementById("symptom-form");
  const symptomsInput = document.getElementById("symptoms-input");
  const ageInput = document.getElementById("age-input");
  const durationInput = document.getElementById("duration-input");
  const historyInput = document.getElementById("history-input");
  const severityRange = document.getElementById("severity-range");
  const severityVal = document.getElementById("severity-val");
  const providerSelect = document.getElementById("provider-select");
  const modelSelect = document.getElementById("model-select");
  const baseurlInput = document.getElementById("baseurl-input");
  const apikeyOverride = document.getElementById("apikey-override");
  
  const resultsEmpty = document.getElementById("results-empty");
  const resultsLoading = document.getElementById("results-loading");
  const resultsContent = document.getElementById("results-content");
  const loadingStage = document.getElementById("loading-stage");
  const loadingSubtext = document.getElementById("loading-subtext");
  
  const rankingsList = document.getElementById("rankings-list");
  const markdownOutput = document.getElementById("markdown-output");
  const ragChunksContainer = document.getElementById("rag-chunks-container");
  const webResearchContainer = document.getElementById("web-research-container");
  const evolvingDetails = document.getElementById("evolving-case-details");
  
  const countRag = document.getElementById("count-rag");
  const countWeb = document.getElementById("count-web");
  const caseIdBadge = document.getElementById("case-id-badge");
  const badgeMode = document.getElementById("badge-mode");
  
  // Header Stats
  const statKb = document.getElementById("stat-kb-count");
  const statEvolving = document.getElementById("stat-evolving-count");
  const statResearch = document.getElementById("stat-research-count");
  const statKbTab = document.getElementById("stat-kb-tab");
  const statCasesTab = document.getElementById("stat-cases-tab");
  const statCacheTab = document.getElementById("stat-cache-tab");
  const explorerContent = document.getElementById("explorer-content");

  // Sample Presets
  const PRESETS = {
    respiratory: {
      symptoms: "Persistent productive cough with yellow-green phlegm for 6 days, low grade fever (37.9C), chest soreness when coughing, mild fatigue",
      age: "38yo Female",
      duration: "6 days",
      history: "Seasonal allergies, Non-smoker",
      severity: 5
    },
    cardiac: {
      symptoms: "Substernal pressure and tight squeezing chest pain radiating to left shoulder and jaw, cold sweat diaphoresis, shortness of breath on climbing stairs",
      age: "59yo Male",
      duration: "45 minutes, worsening",
      history: "Hypertension (10 yrs), Hyperlipidemia, Ex-smoker",
      severity: 9
    },
    abdominal: {
      symptoms: "Dull periumbilical ache that migrated to the right lower quadrant over 16 hours, sharp pain on walking, loss of appetite, nausea",
      age: "24yo Male",
      duration: "16 hours",
      history: "No significant prior history",
      severity: 7
    },
    headache: {
      symptoms: "Unilateral throbbing headache on right side, visual aura with shimmering zigzag lines, sensitivity to light (photophobia) and nausea",
      age: "31yo Female",
      duration: "8 hours",
      history: "Prior episodic headaches, Oral contraceptive use",
      severity: 6
    }
  };

  // Preset Buttons Listener
  document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      const caseKey = btn.dataset.case;
      const data = PRESETS[caseKey];
      if (data) {
        symptomsInput.value = data.symptoms;
        ageInput.value = data.age;
        durationInput.value = data.duration;
        historyInput.value = data.history;
        severityRange.value = data.severity;
        updateSeverityLabel(data.severity);
      }
    });
  });

  // Severity Slider
  severityRange.addEventListener("input", (e) => {
    updateSeverityLabel(e.target.value);
  });

  function updateSeverityLabel(val) {
    let desc = "Mild";
    if (val >= 4 && val <= 6) desc = "Moderate";
    else if (val >= 7 && val <= 8) desc = "Severe";
    else if (val >= 9) desc = "Critical / Red Flag";
    severityVal.textContent = `${val} / 10 (${desc})`;
    severityVal.style.color = val >= 7 ? "#ef4444" : (val >= 4 ? "#f59e0b" : "#10b981");
  }

  // Architecture Mode Toggle
  document.querySelectorAll("input[name='mode-select']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll(".toggle-option").forEach(opt => opt.classList.remove("selected"));
      e.target.closest(".toggle-option").classList.add("selected");
    });
  });

  // Quick Endpoint Chips
  document.querySelectorAll(".btn-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      providerSelect.value = "openai_compatible";
      if (baseurlInput) baseurlInput.value = chip.dataset.base;
      modelSelect.value = chip.dataset.model;
    });
  });

  // Provider Selection Helper
  providerSelect.addEventListener("change", (e) => {
    if (e.target.value === "gemini") {
      modelSelect.value = "gemini-3.6-flash";
    } else if (e.target.value === "openrouter") {
      modelSelect.value = "meta-llama/llama-3.3-70b-instruct:free";
    } else if (e.target.value === "openai_compatible") {
      if (!modelSelect.value || modelSelect.value.includes("gemini")) {
        modelSelect.value = "gpt-4o";
      }
    }
  });

  // Result Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;
      document.getElementById(target).classList.add("active");
    });
  });

  // Fetch initial stats & explorer data
  loadStats();
  loadKnowledgeBase();

  // Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const symptoms = symptomsInput.value.trim();
    if (!symptoms) return;

    const mode = document.querySelector("input[name='mode-select']:checked").value;
    const provider = providerSelect.value;
    const model = modelSelect.value.trim();
    const apiKey = apikeyOverride.value.trim();
    const baseUrl = baseurlInput ? baseurlInput.value.trim() : null;

    // UI Loading State
    resultsEmpty.classList.add("hidden");
    resultsContent.classList.add("hidden");
    resultsLoading.classList.remove("hidden");

    let progressTimer = startLoadingAnimation(mode);

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          age: ageInput.value.trim(),
          duration: durationInput.value.trim(),
          history: historyInput.value.trim(),
          severity: severityVal.textContent,
          mode,
          provider,
          model,
          base_url: baseUrl,
          api_key: apiKey
        })
      });

      clearInterval(progressTimer);
      const data = await resp.json();

      if (!resp.ok || data.error) {
        throw new Error(data.error || "Analysis failed");
      }

      renderResults(data);
      loadStats(); // refresh counts
    } catch (err) {
      clearInterval(progressTimer);
      resultsLoading.classList.add("hidden");
      resultsEmpty.classList.remove("hidden");
      alert(`Error during analysis: ${err.message}`);
    }
  });

  function startLoadingAnimation(mode) {
    const stages = [
      { main: "Retrieving Clinical Knowledge...", sub: mode === "rag" ? "BM25 semantic search across WHO/NIH guidelines & case memory." : "Compiling entire 1M token clinical catalog for prompt injection." },
      { main: "Evaluating Symptoms & Reasoning...", sub: "Processing clinical presentation against authoritative medical records." },
      { main: "Intercepting Web Research Triggers...", sub: "Scanning token stream for [WEB_SEARCH: url] external evidence requests." },
      { main: "Synthesizing Probability Rankings...", sub: "Calculating differential percentages and indexing case into self-evolving loop." }
    ];
    let idx = 0;
    loadingStage.textContent = stages[0].main;
    loadingSubtext.textContent = stages[0].sub;

    return setInterval(() => {
      idx = (idx + 1) % stages.length;
      loadingStage.textContent = stages[idx].main;
      loadingSubtext.textContent = stages[idx].sub;
    }, 2200);
  }

  function renderResults(data) {
    resultsLoading.classList.add("hidden");
    resultsContent.classList.remove("hidden");

    // Mode Badge
    badgeMode.textContent = data.mode_used === "rag" ? "RAG TARGETED" : "LONG-CONTEXT STUFFING";
    badgeMode.style.background = data.mode_used === "rag" ? "rgba(14, 165, 233, 0.2)" : "rgba(168, 85, 247, 0.2)";
    badgeMode.style.color = data.mode_used === "rag" ? "#38bdf8" : "#c084fc";
    badgeMode.style.borderColor = data.mode_used === "rag" ? "#38bdf8" : "#c084fc";

    // 1. Percentage Rankings
    rankingsList.innerHTML = "";
    if (data.rankings && data.rankings.length > 0) {
      data.rankings.forEach(r => {
        const item = document.createElement("div");
        item.className = "rank-item";
        
        let colorClass = "low";
        if (r.percentage >= 50) colorClass = "high";
        else if (r.percentage >= 25) colorClass = "medium";

        item.innerHTML = `
          <div class="rank-label-row">
            <span>${r.condition}</span>
            <span class="rank-pct" style="color: ${colorClass === 'high' ? '#10b981' : (colorClass === 'medium' ? '#f59e0b' : '#94a3b8')}">${r.percentage}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${colorClass}" style="width: ${r.percentage}%"></div>
          </div>
        `;
        rankingsList.appendChild(item);
      });
    }

    // 2. Full Markdown HTML
    markdownOutput.innerHTML = data.analysis_html;

    // 3. RAG Chunks
    const kbChunks = data.retrieved_context?.kb_chunks || [];
    const evolvingChunks = data.retrieved_context?.evolving_cases || [];
    const totalChunks = kbChunks.length + evolvingChunks.length;
    countRag.textContent = totalChunks;

    ragChunksContainer.innerHTML = "";
    if (totalChunks === 0) {
      ragChunksContainer.innerHTML = `<p class="helper-text">No isolated chunks retrieved (${data.mode_used} mode utilized full catalog).</p>`;
    } else {
      kbChunks.forEach(c => {
        const div = document.createElement("div");
        div.className = "chunk-card";
        div.innerHTML = `
          <div class="chunk-header">
            <span class="chunk-title">📖 ${c.condition} (${c.icd10 || 'ICD-10'})</span>
            <span class="chunk-tag">${c.system}</span>
          </div>
          <p><strong>Typical Symptoms:</strong> ${(c.typical_symptoms || []).join(', ')}</p>
          <p><strong>Source:</strong> <em>${c.source}</em></p>
        `;
        ragChunksContainer.appendChild(div);
      });

      evolvingChunks.forEach(c => {
        const div = document.createElement("div");
        div.className = "chunk-card";
        div.style.borderColor = "var(--purple)";
        div.innerHTML = `
          <div class="chunk-header">
            <span class="chunk-title" style="color:#c084fc">🧠 Prior Case: ${c.case_id} (${c.demographics})</span>
            <span class="chunk-tag" style="background:rgba(168,85,247,0.2)">Evolving Loop</span>
          </div>
          <p><strong>Presented:</strong> ${(c.presented_symptoms || []).join(', ')}</p>
          <p><strong>Clinical Takeaway:</strong> <em>${c.clinical_takeaway || c.outcome}</em></p>
        `;
        ragChunksContainer.appendChild(div);
      });
    }

    // 4. Web Research
    const webRes = data.web_research || [];
    countWeb.textContent = webRes.length;
    webResearchContainer.innerHTML = "";
    if (webRes.length === 0) {
      webResearchContainer.innerHTML = `
        <div class="callout-info">
          ℹ️ No external web research triggers were fired for this standard presentation. When a rare condition or new guideline is required, the model emits <code>[WEB_SEARCH: &lt;URL&gt;]</code> which auto-fetches and saves markdown here.
        </div>
      `;
    } else {
      webRes.forEach(w => {
        const div = document.createElement("div");
        div.className = "research-card";
        div.innerHTML = `
          <div class="research-header">
            <span class="chunk-title">🌐 ${w.url}</span>
            <span class="chunk-tag">${w.authoritative ? '✅ Verified Authority' : 'External'}</span>
          </div>
          <p><strong>Cached Markdown File:</strong> <code>${w.filename}</code> (${w.char_count} chars)</p>
          <div class="code-box">${w.markdown.substring(0, 500)}...</div>
        `;
        webResearchContainer.appendChild(div);
      });
    }

    // 5. Evolving Case Loop
    caseIdBadge.textContent = data.saved_case_id || "Saved";
    evolvingDetails.textContent = JSON.stringify({
      case_id: data.saved_case_id,
      timestamp: new Date().toISOString(),
      symptoms: symptomsInput.value.trim(),
      ranked_differentials: data.rankings,
      mode: data.mode_used,
      status: "Persisted to data/evolving_knowledge.json"
    }, null, 2);
  }

  // Stats Loader
  async function loadStats() {
    try {
      const resp = await fetch("/api/stats");
      const data = await resp.json();
      statKb.textContent = data.kb_documents_count;
      statEvolving.textContent = data.evolving_cases_count;
      statResearch.textContent = data.research_cache_count;
      statKbTab.textContent = data.kb_documents_count;
      statCasesTab.textContent = data.evolving_cases_count;
      statCacheTab.textContent = data.research_cache_count;
    } catch (e) {
      console.error(e);
    }
  }

  // Bottom Explorer Tabs
  document.getElementById("btn-show-kb").addEventListener("click", (e) => {
    setActiveSubtab(e.target);
    loadKnowledgeBase();
  });

  document.getElementById("btn-show-cases").addEventListener("click", (e) => {
    setActiveSubtab(e.target);
    loadEvolvingCases();
  });

  document.getElementById("btn-show-cache").addEventListener("click", (e) => {
    setActiveSubtab(e.target);
    loadResearchCache();
  });

  function setActiveSubtab(btn) {
    document.querySelectorAll(".btn-subtab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }

  async function loadKnowledgeBase() {
    explorerContent.innerHTML = '<div class="loading-inline">Loading Clinical Guidelines...</div>';
    try {
      const resp = await fetch("/api/documents");
      const data = await resp.json();
      const kb = data.knowledge_base || [];

      let html = '<div class="explorer-grid">';
      kb.forEach(d => {
        html += `
          <div class="kb-card">
            <h4>${d.condition} <span class="chunk-tag">${d.icd10 || ''}</span></h4>
            <p><strong>System:</strong> ${d.system}</p>
            <p><strong>Key Symptoms:</strong> ${(d.typical_symptoms || []).slice(0, 3).join(', ')}...</p>
            <p><strong>Red Flags:</strong> ${(d.red_flags || []).slice(0, 2).join(', ')}</p>
            <p><strong>Source:</strong> <em>${d.authoritative_source}</em></p>
          </div>
        `;
      });
      html += '</div>';
      explorerContent.innerHTML = html;
    } catch (e) {
      explorerContent.innerHTML = '<p class="helper-text">Failed to load knowledge base.</p>';
    }
  }

  async function loadEvolvingCases() {
    explorerContent.innerHTML = '<div class="loading-inline">Loading Evolving Case History...</div>';
    try {
      const resp = await fetch("/api/history");
      const data = await resp.json();
      const cases = data.cases || [];

      let html = '<div class="explorer-grid">';
      cases.forEach(c => {
        const topDiff = (c.differential_ranking || [])[0];
        html += `
          <div class="kb-card" style="border-color: var(--purple)">
            <h4 style="color:#c084fc">🧠 ${c.case_id}</h4>
            <p><strong>Demographics:</strong> ${c.patient_demographics}</p>
            <p><strong>Symptoms:</strong> ${(c.presented_symptoms || []).join(', ')}</p>
            <p><strong>Top Prediction:</strong> ${topDiff ? `${topDiff.condition} (${topDiff.percentage}%)` : 'Analyzed'}</p>
            <p><strong>Takeaway:</strong> <em>${c.clinical_takeaway}</em></p>
          </div>
        `;
      });
      html += '</div>';
      explorerContent.innerHTML = html;
    } catch (e) {
      explorerContent.innerHTML = '<p class="helper-text">Failed to load evolving cases.</p>';
    }
  }

  async function loadResearchCache() {
    explorerContent.innerHTML = '<div class="loading-inline">Loading Web Research Cache...</div>';
    try {
      const resp = await fetch("/api/research-cache");
      const data = await resp.json();
      const reports = data.cached_reports || [];

      if (reports.length === 0) {
        explorerContent.innerHTML = '<p class="helper-text" style="padding:1rem;">No web research reports cached yet. Run a query that triggers <code>[WEB_SEARCH: &lt;URL&gt;]</code> to populate.</p>';
        return;
      }

      let html = '<div class="explorer-grid">';
      reports.forEach(r => {
        html += `
          <div class="kb-card">
            <h4>📄 ${r.filename}</h4>
            <p><strong>Size:</strong> ${(r.size_bytes / 1024).toFixed(1)} KB</p>
            <p><a href="/api/research-cache/${r.filename}" target="_blank" style="color:var(--primary-accent)">View Markdown Document ↗</a></p>
          </div>
        `;
      });
      html += '</div>';
      explorerContent.innerHTML = html;
    } catch (e) {
      explorerContent.innerHTML = '<p class="helper-text">Failed to load research cache.</p>';
    }
  }
});
