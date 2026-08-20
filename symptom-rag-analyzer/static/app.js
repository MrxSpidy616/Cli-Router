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

  // View Switchers
  const btnViewPatient = document.getElementById("btn-view-patient");
  const btnViewDoctor = document.getElementById("btn-view-doctor");
  const patientViewContainer = document.getElementById("patient-view-container");
  const doctorViewContainer = document.getElementById("doctor-view-container");

  // Font Resizer for Seniors
  const btnFontNormal = document.getElementById("btn-font-normal");
  const btnFontLarge = document.getElementById("btn-font-large");

  // Live Firecrawl Modal Elements
  const btnOpenResearch = document.getElementById("btn-open-research");
  const btnCloseResearch = document.getElementById("btn-close-research");
  const researchModal = document.getElementById("research-modal");
  const directResearchForm = document.getElementById("direct-research-form");
  const researchQueryInput = document.getElementById("research-query-input");
  const researchModalLoading = document.getElementById("research-modal-loading");
  const researchModalResult = document.getElementById("research-modal-result");
  const researchEngineBadge = document.getElementById("research-engine-badge");
  const researchUrlDisplay = document.getElementById("research-url-display");
  const researchMarkdownDisplay = document.getElementById("research-markdown-display");

  // Font Resizer Handlers
  btnFontNormal.addEventListener("click", () => {
    document.body.classList.remove("large-text");
    btnFontNormal.classList.add("active");
    btnFontLarge.classList.remove("active");
  });

  btnFontLarge.addEventListener("click", () => {
    document.body.classList.add("large-text");
    btnFontLarge.classList.add("active");
    btnFontNormal.classList.remove("active");
  });

  // View Toggle (Patient vs Doctor)
  btnViewPatient.addEventListener("click", () => {
    btnViewPatient.classList.add("active");
    btnViewDoctor.classList.remove("active");
    patientViewContainer.classList.remove("hidden");
    doctorViewContainer.classList.add("hidden");
  });

  btnViewDoctor.addEventListener("click", () => {
    btnViewDoctor.classList.add("active");
    btnViewPatient.classList.remove("active");
    patientViewContainer.classList.remove("hidden");
    doctorViewContainer.classList.remove("hidden");
  });

  // Firecrawl Modal Listeners
  if (btnOpenResearch && researchModal) {
    btnOpenResearch.addEventListener("click", () => {
      researchModal.classList.remove("hidden");
      setTimeout(() => researchQueryInput?.focus(), 100);
    });

    btnCloseResearch?.addEventListener("click", () => {
      researchModal.classList.add("hidden");
    });

    researchModal.addEventListener("click", (e) => {
      if (e.target === researchModal) {
        researchModal.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !researchModal.classList.contains("hidden")) {
        researchModal.classList.add("hidden");
      }
    });

    // Execute Direct Firecrawl Web Research
    directResearchForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = researchQueryInput.value.trim();
      if (!q) return;

      researchModalResult.classList.add("hidden");
      researchModalLoading.classList.remove("hidden");

      try {
        const resp = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query_or_url: q })
        });

        const data = await resp.json();
        researchModalLoading.classList.add("hidden");
        researchModalResult.classList.remove("hidden");

        if (data.success) {
          researchEngineBadge.textContent = data.engine || "Firecrawl v1";
          researchEngineBadge.className = "badge-engine " + (data.engine?.includes("Firecrawl") ? "firecrawl" : "fallback");
          researchUrlDisplay.textContent = data.url || q;
          researchMarkdownDisplay.textContent = data.markdown || "No content extracted.";
        } else {
          researchEngineBadge.textContent = "Error";
          researchEngineBadge.className = "badge-engine fallback";
          researchUrlDisplay.textContent = q;
          researchMarkdownDisplay.textContent = `Error: ${data.error || 'Failed to research topic.'}`;
        }
      } catch (err) {
        researchModalLoading.classList.add("hidden");
        researchModalResult.classList.remove("hidden");
        researchEngineBadge.textContent = "Network Error";
        researchEngineBadge.className = "badge-engine fallback";
        researchMarkdownDisplay.textContent = `Network error: ${err.message}`;
      }
    });
  }

  // Sample Presets (Everyday Words)
  const PRESETS = {
    respiratory: {
      symptoms: "I have had a deep wet cough with yellow phlegm for 5 days, a mild fever of 100.2°F, chest soreness when coughing, and feel tired.",
      age: "62 years old",
      duration: "5 days",
      history: "Seasonal allergies, Non-smoker",
      severity: 5
    },
    cardiac: {
      symptoms: "Heavy pressure and squeezing in the center of my chest that spreads to my left arm and neck, broke into a cold sweat, short of breath.",
      age: "65 years old",
      duration: "45 minutes",
      history: "High blood pressure, High cholesterol",
      severity: 9
    },
    abdominal: {
      symptoms: "Ache around belly button that moved to the lower right side, hurts when I walk, lost my appetite and feel nauseous.",
      age: "28 years old",
      duration: "1 day",
      history: "None",
      severity: 7
    },
    headache: {
      symptoms: "Pounding headache on one side of my head, seeing shimmering zigzag lights, sensitive to bright sunlight and feel sick to my stomach.",
      age: "45 years old",
      duration: "6 hours",
      history: "Occasional headaches",
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

  // Quick Endpoint Chips
  document.querySelectorAll(".btn-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      if (chip.dataset.base.includes("cliproxy")) {
        providerSelect.value = "cliproxy";
      } else {
        providerSelect.value = "openai_compatible";
      }
      if (baseurlInput) baseurlInput.value = chip.dataset.base;
      modelSelect.value = chip.dataset.model;
      if (chip.dataset.key) {
        apikeyOverride.value = chip.dataset.key;
      }
    });
  });

  // Provider Selection Helper
  providerSelect.addEventListener("change", (e) => {
    if (e.target.value === "cliproxy") {
      if (baseurlInput) baseurlInput.value = "https://cliproxyapi-zvr2.onrender.com/v1";
      modelSelect.value = "gemini-3.6-flash-high";
      apikeyOverride.value = "aravind616";
    } else if (e.target.value === "gemini") {
      modelSelect.value = "gemini-2.0-flash";
    } else if (e.target.value === "openrouter") {
      modelSelect.value = "meta-llama/llama-3.3-70b-instruct:free";
    } else if (e.target.value === "openai_compatible") {
      if (!modelSelect.value || modelSelect.value.includes("gemini")) {
        modelSelect.value = "gpt-4o";
      }
    }
  });

  // Tabs for Doctor View
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.add("active");
    });
  });

  // Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const symptoms = symptomsInput.value.trim();
    if (!symptoms) return;

    const modeRadio = document.querySelector("input[name='mode-select']:checked");
    const mode = modeRadio ? modeRadio.value : "rag";
    const provider = providerSelect.value;
    const model = modelSelect.value.trim();
    const apiKey = apikeyOverride.value.trim();
    const baseUrl = baseurlInput ? baseurlInput.value.trim() : null;

    // UI Loading State
    resultsEmpty.classList.add("hidden");
    resultsContent.classList.add("hidden");
    resultsLoading.classList.remove("hidden");

    let progressTimer = startLoadingAnimation();

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
    } catch (err) {
      clearInterval(progressTimer);
      resultsLoading.classList.add("hidden");
      resultsEmpty.classList.remove("hidden");
      alert(`Could not complete review: ${err.message}`);
    }
  });

  function startLoadingAnimation() {
    const stages = [
      { main: "Reviewing Medical Knowledge...", sub: "Checking trusted guidelines from WHO, NIH, and doctors." },
      { main: "Evaluating Symptoms & Patterns...", sub: "Looking at what is most likely causing how you feel." },
      { main: "Preparing Clear Next Steps...", sub: "Organizing simple home care steps and safety alerts." }
    ];
    let idx = 0;
    loadingStage.textContent = stages[0].main;
    loadingSubtext.textContent = stages[0].sub;

    return setInterval(() => {
      idx = (idx + 1) % stages.length;
      loadingStage.textContent = stages[idx].main;
      loadingSubtext.textContent = stages[idx].sub;
    }, 2000);
  }

  function renderResults(data) {
    resultsLoading.classList.add("hidden");
    resultsContent.classList.remove("hidden");

    // 1. Render Large, Accessible Percentage Cards
    rankingsList.innerHTML = "";
    if (data.rankings && data.rankings.length > 0) {
      data.rankings.forEach((r, idx) => {
        const card = document.createElement("div");
        card.className = "simple-rank-card" + (idx === 0 ? " top-pick" : "");
        
        let pillClass = "low";
        let labelText = `${r.percentage}% Possible`;
        let barColor = "#64748b";

        if (r.percentage >= 50) {
          pillClass = "high";
          labelText = `${r.percentage}% Most Likely`;
          barColor = "#10b981";
        } else if (r.percentage >= 25) {
          pillClass = "medium";
          labelText = `${r.percentage}% Moderate`;
          barColor = "#f59e0b";
        }

        card.innerHTML = `
          <div class="rank-title-row">
            <span class="rank-condition-name">${idx === 0 ? '⭐ ' : ''}${r.condition}</span>
            <span class="rank-pct-pill ${pillClass}">${labelText}</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${r.percentage}%; background-color: ${barColor};"></div>
          </div>
        `;
        rankingsList.appendChild(card);
      });
    }

    // 2. Render Patient-Friendly Main Explanation
    markdownOutput.innerHTML = data.analysis_html;

    // 3. Populate Doctor Tab Chunks (for Clinicians)
    const kbChunks = data.retrieved_context?.kb_chunks || [];
    const evolvingChunks = data.retrieved_context?.evolving_cases || [];
    const totalChunks = kbChunks.length + evolvingChunks.length;
    if (countRag) countRag.textContent = totalChunks;

    if (ragChunksContainer) {
      ragChunksContainer.innerHTML = "";
      if (totalChunks === 0) {
        ragChunksContainer.innerHTML = `<p class="helper-text">No isolated chunks retrieved.</p>`;
      } else {
        kbChunks.forEach(c => {
          const div = document.createElement("div");
          div.className = "chunk-card";
          div.innerHTML = `
            <div class="chunk-header">
              <span class="chunk-title">${c.condition}</span>
              <span class="rank-pct-pill low">${c.icd10 || 'ICD-10'}</span>
            </div>
            <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 0.4rem;"><strong>Source:</strong> ${c.source || 'Medical Guidelines'}</p>
            <p style="font-size: 0.88rem; color: #94a3b8;"><strong>Typical Symptoms:</strong> ${(c.typical_symptoms || []).join(', ')}</p>
          `;
          ragChunksContainer.appendChild(div);
        });
      }
    }

    // 4. Web Research Interceptor Logs (Firecrawl Powered)
    const webItems = data.web_research || [];
    if (countWeb) countWeb.textContent = webItems.length;
    if (webResearchContainer) {
      webResearchContainer.innerHTML = "";
      if (webItems.length === 0) {
        webResearchContainer.innerHTML = `<p class="helper-text">No external Firecrawl web search token was needed for this standard presentation.</p>`;
      } else {
        webItems.forEach(item => {
          const div = document.createElement("div");
          div.className = "research-card";
          const engineTag = item.engine || "Firecrawl";
          div.innerHTML = `
            <div class="research-header">
              <span class="chunk-title">🔥 Firecrawl Research: ${item.url}</span>
              <span class="rank-pct-pill ${item.success ? 'high' : 'medium'}">${engineTag}</span>
            </div>
            <div class="code-box">${item.markdown ? item.markdown.substring(0, 500) + '...' : 'No content'}</div>
          `;
          webResearchContainer.appendChild(div);
        });
      }
    }

    // 5. Evolving Case Memory
    if (evolvingDetails) {
      evolvingDetails.textContent = JSON.stringify({
        saved_case_id: data.saved_case_id,
        mode: data.mode_used,
        provider: data.provider_used,
        timestamp: new Date().toISOString()
      }, null, 2);
    }
  }
});
