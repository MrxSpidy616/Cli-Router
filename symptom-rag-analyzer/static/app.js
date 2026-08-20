document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const form = document.getElementById("symptom-form");
  const symptomsInput = document.getElementById("symptoms-input");
  const ageInput = document.getElementById("age-input");
  const durationInput = document.getElementById("duration-input");
  const historyInput = document.getElementById("history-input");
  const severityRange = document.getElementById("severity-range");
  const severityVal = document.getElementById("severity-val");
  
  const resultsEmpty = document.getElementById("results-empty");
  const resultsLoading = document.getElementById("results-loading");
  const resultsContent = document.getElementById("results-content");
  const loadingStage = document.getElementById("loading-stage");
  const loadingSubtext = document.getElementById("loading-subtext");
  
  const rankingsList = document.getElementById("rankings-list");
  const markdownOutput = document.getElementById("markdown-output");
  const doctorEvidenceList = document.getElementById("doctor-evidence-list");

  // To-Do Checklist Elements
  const todoList = document.getElementById("todo-list");
  const todoAddForm = document.getElementById("todo-add-form");
  const todoCustomInput = document.getElementById("todo-custom-input");

  // Doctor Search & Enquiry Elements
  const doctorLocationInput = document.getElementById("doctor-location-input");
  const btnSearchDoctors = document.getElementById("btn-search-doctors");
  const enquirySymptomTag = document.getElementById("enquiry-symptom-tag");
  const enquiryDurationTag = document.getElementById("enquiry-duration-tag");

  // View Switchers
  const btnViewPatient = document.getElementById("btn-view-patient");
  const btnViewDoctor = document.getElementById("btn-view-doctor");
  const patientViewContainer = document.getElementById("patient-view-container");
  const doctorViewContainer = document.getElementById("doctor-view-container");

  // Font Resizer for Seniors
  const btnFontNormal = document.getElementById("btn-font-normal");
  const btnFontLarge = document.getElementById("btn-font-large");

  // Internal state for To-Do tasks
  let activeTasks = [];

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

  // Everyday Case Presets
  const PRESETS = {
    respiratory: {
      symptoms: "Deep wet cough with yellow phlegm for 4 days, mild fever of 100°F, feeling tired and sore in the chest.",
      age: "62",
      duration: "4 days",
      history: "Seasonal allergies",
      severity: 5
    },
    cardiac: {
      symptoms: "Heavy tight pressure in the center of the chest spreading to the left arm, broke into a cold sweat, short of breath.",
      age: "65",
      duration: "45 minutes",
      history: "High blood pressure",
      severity: 9
    },
    abdominal: {
      symptoms: "Constant dull ache around belly button that moved to the lower right side, hurts when walking, feeling sick to stomach.",
      age: "28",
      duration: "1 day",
      history: "None",
      severity: 7
    },
    headache: {
      symptoms: "Pounding headache on one side of my head, seeing shimmering lights, sensitive to bright sunlight and feeling nauseous.",
      age: "45",
      duration: "6 hours",
      history: "Occasional headaches",
      severity: 6
    }
  };

  // Preset Chips Listener
  document.querySelectorAll(".chip-btn").forEach(btn => {
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

  // To-Do Checklist Management
  function initTodoList(primaryCondition, severityText) {
    // Generate smart recovery tasks based on diagnosis
    activeTasks = [
      { id: "task_1", text: "Rest and stay well-hydrated with warm broths, water, or herbal teas", tag: "Home Care", done: false },
      { id: "task_2", text: "Monitor and record temperature twice daily (morning & evening)", tag: "Monitoring", done: false },
      { id: "task_3", text: "Note down any new changes in pain, breathing, or energy levels", tag: "Tracking", done: false }
    ];

    if (severityText.includes("Severe") || severityText.includes("9") || severityText.includes("10")) {
      activeTasks.unshift({ id: "task_em", text: "Seek urgent emergency medical evaluation or call 911 immediately", tag: "🔴 Urgent", done: false });
    } else {
      activeTasks.push({ id: "task_doc", text: "Schedule a doctor consultation if symptoms do not improve within 48 hours", tag: "Medical Visit", done: false });
    }

    // Check localStorage for saved custom tasks
    const savedCustom = JSON.parse(localStorage.getItem("health_custom_todos") || "[]");
    savedCustom.forEach((t, i) => {
      activeTasks.push({ id: `custom_${i}`, text: t.text, tag: "Personal", done: t.done || false });
    });

    renderTodoList();
  }

  function renderTodoList() {
    if (!todoList) return;
    todoList.innerHTML = "";

    activeTasks.forEach((task) => {
      const itemEl = document.createElement("div");
      itemEl.className = "todo-item" + (task.done ? " completed" : "");
      
      itemEl.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${task.done ? "checked" : ""} aria-label="${task.text}">
        <span class="todo-text">${task.text}</span>
        <span class="todo-tag">${task.tag}</span>
      `;

      // Checkbox click event
      const checkbox = itemEl.querySelector(".todo-checkbox");
      const toggleDone = () => {
        task.done = !task.done;
        checkbox.checked = task.done;
        itemEl.classList.toggle("completed", task.done);
        saveCustomTodos();
      };

      itemEl.addEventListener("click", (e) => {
        if (e.target !== checkbox) toggleDone();
      });
      checkbox.addEventListener("change", toggleDone);

      todoList.appendChild(itemEl);
    });
  }

  function saveCustomTodos() {
    const customOnly = activeTasks.filter(t => t.id.startsWith("custom_")).map(t => ({ text: t.text, done: t.done }));
    localStorage.setItem("health_custom_todos", JSON.stringify(customOnly));
  }

  // Add Custom To-Do Form
  todoAddForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoCustomInput.value.trim();
    if (!text) return;

    const newTask = {
      id: `custom_${Date.now()}`,
      text: text,
      tag: "Personal",
      done: false
    };

    activeTasks.push(newTask);
    saveCustomTodos();
    renderTodoList();
    todoCustomInput.value = "";
  });

  // Nearby Doctor Search Execution
  function executeDoctorSearch(careType = "doctors or urgent care") {
    const location = doctorLocationInput.value.trim();
    let query = `${careType}`;
    if (location) {
      query += ` near ${location}`;
    } else {
      query += ` near me`;
    }
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(mapsUrl, "_blank");
  }

  btnSearchDoctors?.addEventListener("click", () => {
    executeDoctorSearch("primary care doctor clinic or urgent care");
  });

  doctorLocationInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeDoctorSearch("primary care doctor clinic or urgent care");
    }
  });

  document.querySelectorAll(".care-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const type = chip.dataset.type || "doctors";
      executeDoctorSearch(type);
    });
  });

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

      renderResults(data, symptoms, durationInput.value.trim());
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

  function renderResults(data, userSymptoms, userDuration) {
    resultsLoading.classList.add("hidden");
    resultsContent.classList.remove("hidden");

    // 1. Render Likelihood Percentage Cards
    rankingsList.innerHTML = "";
    let primaryCondition = "General Symptoms";
    if (data.rankings && data.rankings.length > 0) {
      primaryCondition = data.rankings[0].condition;
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

    // 3. Initialize Interactive To-Do List
    initTodoList(primaryCondition, severityVal.textContent);

    // 4. Update Doctor Enquiry Script with actual symptoms
    if (enquirySymptomTag) {
      const shortSnippet = userSymptoms.length > 40 ? userSymptoms.substring(0, 40) + "..." : userSymptoms;
      enquirySymptomTag.textContent = `"${shortSnippet}"`;
    }
    if (enquiryDurationTag) {
      enquiryDurationTag.textContent = userDuration || "a few days";
    }

    // 5. Render Doctor Reference Notes
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
