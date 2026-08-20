document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const form = document.getElementById("symptom-form");
  const symptomsInput = document.getElementById("symptoms-input");
  const ageInput = document.getElementById("age-input");
  const durationInput = document.getElementById("duration-input");
  const historyInput = document.getElementById("history-input");
  const severityRange = document.getElementById("severity-range");
  const severityVal = document.getElementById("severity-val");
  const btnClearSymptoms = document.getElementById("btn-clear-symptoms");
  
  const resultsEmpty = document.getElementById("results-empty");
  const resultsLoading = document.getElementById("results-loading");
  const resultsContent = document.getElementById("results-content");
  const loadingStage = document.getElementById("loading-stage");
  const loadingSubtext = document.getElementById("loading-subtext");
  
  const rankingsList = document.getElementById("rankings-list");
  const markdownOutput = document.getElementById("markdown-output");
  const doctorEvidenceList = document.getElementById("doctor-evidence-list");

  // Body Zone Elements
  const zoneButtons = document.querySelectorAll(".zone-btn");
  const zoneSymptomsList = document.getElementById("zone-symptoms-list");

  // View Switchers
  const btnViewPatient = document.getElementById("btn-view-patient");
  const btnViewDoctor = document.getElementById("btn-view-doctor");
  const patientViewContainer = document.getElementById("patient-view-container");
  const doctorViewContainer = document.getElementById("doctor-view-container");

  // Font Resizer for Seniors
  const btnFontNormal = document.getElementById("btn-font-normal");
  const btnFontLarge = document.getElementById("btn-font-large");

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

  // Clear Textarea Handler
  btnClearSymptoms?.addEventListener("click", () => {
    symptomsInput.value = "";
    document.querySelectorAll(".symptom-tag-btn").forEach(b => b.classList.remove("added"));
    symptomsInput.focus();
  });

  // Body Area Symptom Catalogs
  const BODY_ZONE_SYMPTOMS = {
    head: [
      "Throbbing Headache",
      "Dizziness & Lightheaded",
      "Sore Scratchy Throat",
      "Vision Shimmering / Aura",
      "Runny / Stuffy Nose",
      "Ear Ache or Ringing"
    ],
    chest: [
      "Wet Cough with Phlegm",
      "Dry Persistent Cough",
      "Tight Chest Pressure",
      "Shortness of Breath",
      "Wheezing & Whistling Breath",
      "Sharp Pain when Breathing In"
    ],
    stomach: [
      "Dull Upper Belly Ache",
      "Sharp Lower Right Pain",
      "Burning Acid Heartburn",
      "Nausea & Sick to Stomach",
      "Bloating & Discomfort",
      "Loose Stools / Diarrhea"
    ],
    joints: [
      "Stiff Morning Joints",
      "Lower Back Pain",
      "Swollen Knee or Ankle",
      "Muscle Aches & Soreness",
      "Shooting Pain down Leg",
      "Neck Stiffness"
    ],
    general: [
      "Mild Fever & Chills",
      "Unusual Fatigue & Tiredness",
      "Itchy Red Skin Rash",
      "Night Sweats",
      "Loss of Taste or Smell",
      "Unexplained Weight Loss"
    ]
  };

  // Render Symptom Tags for Active Body Zone
  function renderZoneSymptoms(zoneKey) {
    if (!zoneSymptomsList) return;
    zoneSymptomsList.innerHTML = "";
    const symptoms = BODY_ZONE_SYMPTOMS[zoneKey] || [];
    
    symptoms.forEach(sym => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "symptom-tag-btn";
      
      // Check if already in input
      if (symptomsInput.value.toLowerCase().includes(sym.toLowerCase())) {
        btn.classList.add("added");
      }
      
      btn.textContent = `+ ${sym}`;
      
      btn.addEventListener("click", () => {
        let currentText = symptomsInput.value.trim();
        if (currentText) {
          if (!currentText.toLowerCase().includes(sym.toLowerCase())) {
            symptomsInput.value = `${currentText}, ${sym}`;
            btn.classList.add("added");
          }
        } else {
          symptomsInput.value = `I am experiencing ${sym.toLowerCase()}`;
          btn.classList.add("added");
        }
      });
      
      zoneSymptomsList.appendChild(btn);
    });
  }

  // Zone Button Listeners
  zoneButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      zoneButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const zoneKey = btn.dataset.zone;
      renderZoneSymptoms(zoneKey);
    });
  });

  // Initial render with 'head'
  renderZoneSymptoms("head");

  // Severity Slider
  severityRange.addEventListener("input", (e) => {
    updateSeverityLabel(e.target.value);
  });

  function updateSeverityLabel(val) {
    let desc = "Mild";
    let cssClass = "mild";
    if (val >= 4 && val <= 6) {
      desc = "Moderate";
      cssClass = "moderate";
    } else if (val >= 7) {
      desc = "Severe / Alert";
      cssClass = "severe";
    }
    severityVal.textContent = `${val} / 10 (${desc})`;
    severityVal.className = `severity-tag ${cssClass}`;
  }

  // Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const symptoms = symptomsInput.value.trim();
    if (!symptoms) return;

    // Loading State
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
          mode: "rag",
          provider: "cliproxy"
        })
      });

      clearInterval(progressTimer);
      const data = await resp.json();

      if (!resp.ok || data.error) {
        throw new Error(data.error || "Could not complete review.");
      }

      renderResults(data);
    } catch (err) {
      clearInterval(progressTimer);
      resultsLoading.classList.add("hidden");
      resultsEmpty.classList.remove("hidden");
      alert(`Could not review symptoms: ${err.message}`);
    }
  });

  function startLoadingAnimation() {
    const stages = [
      { main: "Reviewing clinical guides...", sub: "Evaluating your symptom patterns against verified medical sources." },
      { main: "Organizing likely explanations...", sub: "Comparing against primary care and emergency triage protocols." },
      { main: "Preparing plain-English next steps...", sub: "Summarizing practical care instructions and warning signs." }
    ];
    let idx = 0;
    loadingStage.textContent = stages[0].main;
    loadingSubtext.textContent = stages[0].sub;

    return setInterval(() => {
      idx = (idx + 1) % stages.length;
      loadingStage.textContent = stages[idx].main;
      loadingSubtext.textContent = stages[idx].sub;
    }, 1800);
  }

  function renderResults(data) {
    resultsLoading.classList.add("hidden");
    resultsContent.classList.remove("hidden");

    // 1. Render Likelihood Percentage Cards
    rankingsList.innerHTML = "";
    if (data.rankings && data.rankings.length > 0) {
      data.rankings.forEach((r, idx) => {
        const card = document.createElement("div");
        card.className = "rank-card" + (idx === 0 ? " top" : "");
        
        let pillClass = "low";
        let labelText = `${r.percentage}% Possible`;
        let barColor = "#94a3b8";

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
          <div class="rank-header">
            <span class="condition-name">${idx === 0 ? '⭐ ' : ''}${r.condition}</span>
            <span class="pct-badge ${pillClass}">${labelText}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${r.percentage}%; background-color: ${barColor};"></div>
          </div>
        `;
        rankingsList.appendChild(card);
      });
    }

    // 2. Render Patient Explanation
    markdownOutput.innerHTML = data.analysis_html;

    // 3. Render Doctor Reference Notes
    const kbChunks = data.retrieved_context?.kb_chunks || [];
    if (doctorEvidenceList) {
      doctorEvidenceList.innerHTML = "";
      if (kbChunks.length === 0) {
        doctorEvidenceList.innerHTML = `<p class="evidence-desc">General primary care clinical differential applied.</p>`;
      } else {
        kbChunks.forEach(c => {
          const div = document.createElement("div");
          div.className = "evidence-item";
          div.innerHTML = `
            <div class="evidence-title">${c.condition} (${c.icd10 || 'ICD-10'})</div>
            <div class="evidence-desc"><strong>Guideline:</strong> ${c.source || 'Medical Clinical Guidelines'}</div>
            <div class="evidence-desc"><strong>Typical Presentation:</strong> ${(c.typical_symptoms || []).join(', ')}</div>
          `;
          doctorEvidenceList.appendChild(div);
        });
      }
    }
  }
});
