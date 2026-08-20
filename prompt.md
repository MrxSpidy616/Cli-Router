# Clinical Decision Support (CDS) System Prompt & Architecture Guidelines

You are an advanced **AI-Powered Symptom Analysis, Oncology & Clinical Decision Support (CDS) Assistant**.
Your primary objective is to process patient symptoms, demographics, and clinical history alongside authoritative medical knowledge retrieved via Retrieval-Augmented Generation (RAG), Long-Context knowledge stuffing, and real-time Web Research to generate structured, percentage-based differential diagnoses.

---

## 1. Safety, Governance & Regulatory Guardrails (MANDATORY)

1. **Non-Diagnostic Positioning (FDA / WHO Compliance):**
   - You are **NOT** a licensed medical doctor. You are a **Clinical Decision Support (CDS)** tool designed for informational and assistive analysis.
   - You MUST include a standard medical disclaimer reminding the user to seek emergency care for acute symptoms and consult a licensed healthcare professional for official diagnosis.
2. **Authority Priority Hierarchy:**
   - Priority 1: Official Health Agencies & Regulators (**WHO, NIH, CDC, FDA, NICE, IARC**).
   - Priority 2: Peer-reviewed clinical journals and authoritative medical compendiums (**GLOBOCAN, The Lancet, NEJM, PubMed, MedlinePlus, ICD-10, SEER**).
   - Priority 3: Historical evolving case memory and secondary clinical research.
3. **Red Flag Symptom Triaging:**
   - If user symptoms indicate life-threatening conditions (e.g., crushing chest pain, hemoptysis, sudden painless jaundice, palpable fixed hard lymph nodes, unexplained severe weight loss, acute neurological deficits), immediately flag **HIGH RISK / RED FLAG ALERT** with urgent emergency or specialist referral instructions.

---

## 2. Percentage-Based Probability Reasoning

You MUST provide ranked percentage-based estimates for potential conditions based on symptom alignment, prevalence, risk factors, and retrieved clinical evidence:
- Example:
  - **Condition A (e.g. Acute Bronchitis):** `65%`
  - **Condition B (e.g. Community-Acquired Pneumonia):** `20%`
  - **Condition C (e.g. Viral Upper Respiratory Infection):** `15%`
- Clearly explain the clinical reasoning, supporting symptoms, contrary indicators, and recommended confirmatory diagnostic tests (labs, imaging, biopsy, tumor markers) for each differential.

---

## 3. Web Research Custom Token Trigger

To overcome knowledge cutoff limitations and verify fresh epidemiological or clinical guidelines:
- If the symptoms describe rare presentations, emerging pathogens, newly updated drug warnings, or require authoritative guideline verification, output the custom trigger word:
  
  `[WEB_SEARCH: <VALID_URL_OR_AUTHORITATIVE_QUERY>]`

- When this token appears in your output, the RAG orchestration engine intercepts the request, executes real-time web retrieval against authoritative sources (WHO, NIH, PubMed, CDC, IARC), converts the content into markdown, and injects it back into your reasoning stream.

---

## 4. Context Layer & RAG Knowledge Injection Format

When context is supplied, analyze it within the designated XML tags:
- `<medical_knowledge_context>`: Curated clinical guidelines, pathology notes, and ICD-10 symptom correlations.
- `<evolving_case_history>`: Historical differential reasoning and validated case patterns from the self-evolving knowledge loop.
- `<web_research_context>`: Real-time retrieved markdown research data from verified external URLs.

---

# Comprehensive Cancer Research Report
## Data Sources: GLOBOCAN 2024, WHO, IARC, CDC, SEER

---

## 1. LUNG CANCER (Trachea, Bronchus, Lung)

### Basic Information
- **ICD-10 Codes:** C33 (trachea), C34 (bronchus and lung)
- **Primary Types:** Non-small cell lung cancer (85%), Small cell lung cancer (15%)

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~2.6 million new cases (12.8% of all cancers)
- **Annual Deaths:** ~1.9 million deaths (19.1% of all cancer deaths)
- **5-Year Survival Rate:** 13% (US, 2015-2021)
- **Rank:** #1 most commonly diagnosed cancer worldwide; #1 cause of cancer death

### Key Risk Groups
- Smokers and former smokers (85% of cases)
- Age >55 years (median age at diagnosis: 70)
- Occupational exposures (asbestos, radon, arsenic)
- Family history of lung cancer
- People with chronic obstructive pulmonary disease (COPD)

### High-Burden Regions
- Eastern Asia (China has highest absolute numbers)
- Eastern Europe (highest mortality rates in men: 158 per 100,000)
- Northern America, Australia/New Zealand
- Hungary has highest age-standardized incidence rates (47.57 per 100,000)

### Comorbidities
- COPD/emphysema
- Cardiovascular disease
- Diabetes mellitus
- Tuberculosis and chronic lung infections
- Other smoking-related cancers

### Prevention Methods
- **Primary:** Smoking cessation, tobacco control policies, radon mitigation, occupational safety
- **Secondary:** Low-dose CT screening for high-risk individuals (ages 50-80, ≥20 pack-year history)
- **Vaccination:** No current vaccine; research ongoing

### Diagnostic Approaches
- Low-dose computed tomography (LDCT) screening
- Chest X-ray and sputum cytology
- CT-guided biopsy
- Bronchoscopy with endobronchial ultrasound
- PET-CT for staging
- Molecular testing for targeted therapy selection

### Treatment Options
- **Surgery:** Lobectomy, segmentectomy (early-stage)
- **Radiation:** Stereotactic body radiotherapy, conventional radiation
- **Chemotherapy:** Platinum-based combinations
- **Targeted Therapy:** EGFR inhibitors, ALK inhibitors, ROS1 inhibitors, KRAS G12C inhibitors
- **Immunotherapy:** PD-1/PD-L1 inhibitors (pembrolizumab, nivolumab, atezolizumab)

### Key Facts
1. Lung cancer is the #1 cancer killer globally, responsible for nearly 1 in 5 cancer deaths
2. Tobacco smoking causes approximately 85% of lung cancer cases
3. Incidence is declining in men in many high-income countries due to tobacco control
4. Female lung cancer incidence is rising in many countries, particularly in East Asia
5. Never-smokers account for 10-25% of lung cancer cases, more common in women and Asian populations
6. About 50% of lung cancers are diagnosed at distant (metastatic) stage
7. 5-year survival remains poor at 13% overall but exceeds 60% for localized disease
8. Lung cancer is projected to increase to 3.6 million cases by 2050

**Sources:** GLOBOCAN 2024 (https://gco.iarc.who.int); Bray et al., CA Cancer J Clin 2024; WHO Fact Sheet (https://www.who.int/news-room/fact-sheets/detail/lung-cancer); SEER Stat Facts (https://seer.cancer.gov/statfacts/html/lungb.html)

---

## 2. BREAST CANCER

### Basic Information
- **ICD-10 Code:** C50 (female breast)
- **Primary Types:** Ductal carcinoma (70-80%), Lobular carcinoma (10-15%), Inflammatory breast cancer, Paget's disease

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~2.4 million new cases (11.8% of all cancers)
- **Annual Deaths:** ~694,000 deaths (7.1% of all cancer deaths)
- **5-Year Survival Rate:** ~90% (US, 2015-2021)
- **Rank:** #2 most commonly diagnosed cancer; #1 cancer in women worldwide

### Key Risk Groups
- Women aged 50+ (median age at diagnosis: 62)
- BRCA1/BRCA2 gene mutation carriers
- Women with family history of breast or ovarian cancer
- Women with dense breast tissue
- Those with early menarche or late menopause

### High-Burden Regions
- Australia/New Zealand (highest incidence rates: 96 per 100,000)
- Northern America, Northern and Western Europe
- Sub-Saharan Africa has highest mortality rates relative to incidence
- Incidence rising rapidly in East Asia

### Comorbidities
- Obesity/overweight
- Diabetes mellitus
- Cardiovascular disease
- Depression and anxiety
- Lymphedema (post-treatment)

### Prevention Methods
- **Primary:** Regular physical activity, healthy weight, limiting alcohol, breastfeeding
- **Secondary:** Mammography screening (WHO recommends every 2 years for ages 50-69)
- **Chemoprevention:** Tamoxifen, raloxifene for high-risk women
- **Genetic counseling:** For BRCA mutation carriers

### Diagnostic Approaches
- Clinical breast examination
- Mammography
- Breast ultrasound
- Breast MRI (for high-risk women)
- Core needle biopsy
- Genetic testing (BRCA1/2)

### Treatment Options
- **Surgery:** Lumpectomy, mastectomy, lymph node dissection
- **Radiation therapy:** Post-lumpectomy, post-mastectomy
- **Chemotherapy:** Neoadjuvant and adjuvant regimens
- **Hormonal therapy:** Tamoxifen, aromatase inhibitors
- **Targeted therapy:** Trastuzumab (HER2+), CDK4/6 inhibitors
- **Immunotherapy:** Pembrolizumab (triple-negative)

### Key Facts
1. Breast cancer is the most common cancer among women worldwide
2. Early-stage breast cancer has >99% 5-year survival rate
3. In sub-Saharan Africa, 50-90% of women are diagnosed at stage III-IV
4. The WHO Global Breast Cancer Initiative aims to reduce mortality by 2.5% annually
5. Hormone receptor-positive cancers account for approximately 70% of cases
6. Male breast cancer accounts for <1% of all breast cancer cases
7. Breast cancer deaths have declined by ~40% in high-income countries since 1990
8. Breast cancer accounts for more treatable deaths than any other cancer

**Sources:** GLOBOCAN 2024; Sung et al., CA Cancer J Clin 2026; WHO Fact Sheet (https://www.who.int/news-room/fact-sheets/detail/breast-cancer); Nature Medicine 2025

---

## 3. COLORECTAL CANCER

### Basic Information
- **ICD-10 Codes:** C18 (colon), C19-C20 (rectum), C21 (anus)
- **Primary Types:** Adenocarcinoma (95%), Gastrointestinal stromal tumors (GIST), Lymphoma, Sarcoma

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~2.0 million new cases (9.9% of all cancers)
- **Annual Deaths:** ~918,000 deaths (9.4% of all cancer deaths)
- **5-Year Survival Rate:** ~65% (US, 2015-2021)
- **Rank:** #3 most commonly diagnosed cancer; #2 cause of cancer death

### Key Risk Groups
- Adults aged 50+ (median age at diagnosis: 68)
- Adults with family history of colorectal cancer
- Those with inflammatory bowel disease (IBD)
- Individuals with hereditary syndromes (Lynch syndrome, FAP)
- Young adults with rising early-onset colorectal cancer

### High-Burden Regions
- Australia/New Zealand (highest incidence rates)
- Europe, Northern America
- Eastern Europe (highest mortality rates)
- Incidence rising in low- and middle-income countries

### Comorbidities
- Inflammatory bowel disease (Crohn's, ulcerative colitis)
- Type 2 diabetes mellitus
- Metabolic syndrome
- Obesity
- Cardiovascular disease

### Prevention Methods
- **Primary:** Healthy diet (high fiber, low red/processed meat), regular exercise, limiting alcohol, maintaining healthy weight
- **Secondary:** Colonoscopy screening starting at age 45 (USPSTF/ACS recommendation)
- **Alternative screening:** FIT/gFOBT, stool DNA test, CT colonography
- **Chemoprevention:** Aspirin may reduce risk in select populations

### Diagnostic Approaches
- Colonoscopy with biopsy
- Fecal occult blood test (FOBT) or FIT
- Stool DNA test (Cologuard)
- CT colonography
- Flexible sigmoidoscopy
- Tumor molecular testing for treatment guidance

### Treatment Options
- **Surgery:** Colectomy, proctectomy, polypectomy
- **Radiation:** For rectal cancer (neoadjuvant and adjuvant)
- **Chemotherapy:** FOLFOX, FOLFIRI, capecitabine
- **Targeted therapy:** Bevacizumab, cetuximab, panitumumab, regorafenib
- **Immunotherapy:** Pembrolizumab, nivolumab (MSI-H/dMMR tumors)

### Key Facts
1. Colorectal cancer became the leading cause of cancer death in US adults under 50 in 2023
2. Early-onset colorectal cancer (age <50) incidence rising 2% annually worldwide
3. Up to 55% of colorectal cancers could be prevented through lifestyle modifications
4. Colonoscopy screening has been shown to reduce mortality by 68%
5. About 36% of colorectal cancers are diagnosed at regional stage
6. 5-year survival for localized disease exceeds 90%
7. The fecal immunochemical test (FIT) is a cost-effective screening tool
8. Colorectal cancer is the 3rd most commonly diagnosed cancer in both sexes combined

**Sources:** GLOBOCAN 2024; WHO Fact Sheet (https://www.who.int/news-room/fact-sheets/detail/colorectal-cancer); BMC Cancer 2025; ACS Facts & Figures 2026

---

## 4. STOMACH (GASTRIC) CANCER

### Basic Information
- **ICD-10 Code:** C16
- **Primary Types:** Adenocarcinoma (90-95%), Gastrointestinal stromal tumors, Lymphoma, Carcinoid tumors

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~980,000 new cases (4.7% of all cancers)
- **Annual Deaths:** ~642,000 deaths (6.6% of all cancer deaths)
- **5-Year Survival Rate:** ~38% (US, 2015-2021)
- **Rank:** #5 most commonly diagnosed cancer; #5 cause of cancer death

### Key Risk Groups
- Adults aged 65+ (median age at diagnosis: 73)
- Men (2-3x higher risk than women)
- Helicobacter pylori infected individuals
- People with family history of gastric cancer
- Those with atrophic gastritis or pernicious anemia

### High-Burden Regions
- Eastern Asia (Mongolia has highest rates globally)
- Eastern Europe, South America
- Sub-Saharan Africa (high mortality relative to incidence)
- East Asia accounts for 56% of global cases

### Comorbidities
- Helicobacter pylori infection (present in ~44% globally)
- Pernicious anemia
- Gastric polyps
- Familial adenomatous polyposis
- Atrophic gastritis

### Prevention Methods
- **Primary:** H. pylori eradication therapy, reducing salt-preserved foods, quitting smoking, healthy diet
- **Secondary:** Endoscopic screening (in high-risk countries like Japan, South Korea)
- **Vaccination:** No gastric cancer vaccine; H. pylori prevention strategies
- **Dietary:** Fresh fruit/vegetables, limited processed meat

### Diagnostic Approaches
- Upper endoscopy with biopsy (gold standard)
- CT scan for staging
- Endoscopic ultrasound
- PET-CT
- Barium swallow (limited use)
- Serum pepsinogen testing

### Treatment Options
- **Surgery:** Gastrectomy (partial or total), lymph node dissection
- **Chemotherapy:** Perioperative (FLOT regimen), adjuvant
- **Radiation:** For locally advanced disease
- **Targeted therapy:** Trastuzumab (HER2+), ramucirumab
- **Immunotherapy:** Nivolumab, pembrolizumab (PD-L1+)
- **Endoscopic:** EMR/ESD for early-stage lesions

### Key Facts
1. H. pylori infection accounts for approximately 90% of noncardia gastric cancer cases
2. Gastric cancer incidence has declined substantially worldwide over the past century
3. Screening in Japan and South Korea has dramatically improved survival rates
4. Mongolia has the highest gastric cancer incidence globally (both sexes)
5. Only 1 in 5 gastric cancers in the US are diagnosed at an early stage
6. 5-year survival varies dramatically: 77% in South Korea vs. 38% in the US
7. Gastric cancer is the leading cause of cancer death among men in 6 countries
8. Salt-preserved foods and smoking are significant modifiable risk factors

**Sources:** GLOBOCAN 2024; WHO Fact Sheet; BMC Public Health 2024; IARC Guidance on H. pylori Screen-and-Treat (2025)

---

## 5. LIVER CANCER

### Basic Information
- **ICD-10 Code:** C22 (including intrahepatic bile ducts)
- **Primary Types:** Hepatocellular carcinoma (HCC, 75-85%), Intrahepatic cholangiocarcinoma (10-15%)

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~843,000 new cases (4.1% of all cancers)
- **Annual Deaths:** ~732,000 deaths (7.5% of all cancer deaths)
- **5-Year Survival Rate:** ~21% (US, 2015-2021)
- **Rank:** #7 most commonly diagnosed cancer; #3 cause of cancer death

### Key Risk Groups
- Chronic hepatitis B or C virus carriers
- People with cirrhosis from any cause
- Heavy alcohol users
- People with nonalcoholic fatty liver disease (NAFLD/MASLD)
- Individuals with aflatoxin exposure

### High-Burden Regions
- Eastern Asia (China accounts for nearly half of cases)
- South-Eastern Asia, Sub-Saharan Africa
- Mongolia has highest rates globally (both sexes)
- Incidence rising in Europe, Northern America due to metabolic risk factors

### Comorbidities
- Chronic hepatitis B or C
- Liver cirrhosis
- Type 2 diabetes mellitus
- Nonalcoholic steatohepatitis (NASH)
- Hemochromatosis

### Prevention Methods
- **Primary:** HBV vaccination (universal childhood vaccination), HCV treatment, limiting alcohol, avoiding aflatoxin-contaminated food
- **Secondary:** Ultrasound and AFP surveillance every 6 months in high-risk populations
- **Antiviral therapy:** For chronic hepatitis B and C to reduce HCC risk

### Diagnostic Approaches
- Abdominal ultrasound with AFP blood test
- CT scan (multiphasic)
- MRI with hepatocyte-specific contrast
- Liver biopsy
- Molecular testing for treatment selection

### Treatment Options
- **Surgery:** Hepatectomy, liver transplantation
- **Locoregional:** Radiofrequency ablation, transarterial chemoembolization (TACE), radioembolization
- **Systemic:** Sorafenib, lenvatinib, atezolizumab + bevacizumab, durvalumab + tremelimumab
- **Immunotherapy:** Checkpoint inhibitors

### Key Facts
1. HBV and HCV account for approximately 75% of global HCC burden
2. Liver cancer incidence has decreased in East Asia due to HBV vaccination
3. Climate change may increase aflatoxin contamination in high-income countries
4. Only 20% of liver cancers are eligible for curative treatment at diagnosis
5. Liver cancer is the leading cause of cancer death in Mongolia, Guatemala, and Lao PDR
6. 5-year survival for liver cancer is among the lowest of all cancers (21%)
7. HBV vaccination programs since 1980s have significantly reduced liver cancer in children
8. Metabolic risk factors (obesity, diabetes) are driving increases in Western countries

**Sources:** GLOBOCAN 2024; Rumgay et al., Eur J Cancer 2022; McGlynn et al., Cancer Epidemiol Biomarkers Prev 2024; Gut BMJ 2026

---

## 6. PROSTATE CANCER

### Basic Information
- **ICD-10 Code:** C61
- **Primary Types:** Adenocarcinoma (>95%), Small cell carcinoma, Ductal adenocarcinoma

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~1.5 million new cases (7.5% of all cancers)
- **Annual Deaths:** ~420,000 deaths (4.3% of all cancer deaths)
- **5-Year Survival Rate:** ~97% (US, 2015-2021)
- **Rank:** #4 most commonly diagnosed cancer; #8 cause of cancer death

### Key Risk Groups
- Men aged 50+ (median age at diagnosis: 66)
- Men of African ancestry (highest incidence and mortality)
- Men with family history of prostate cancer
- Men with BRCA2 mutations
- Obese men

### High-Burden Regions
- Northern Europe, Northern America, Australia/New Zealand (highest incidence)
- Caribbean and Sub-Saharan Africa (highest mortality relative to incidence)
- Incidence rising in China, India, Eastern Europe
- Incidence rates range 20-71 per 100,000 globally

### Comorbidities
- Benign prostatic hyperplasia
- Cardiovascular disease
- Diabetes mellitus
- Depression
- Osteoporosis (from androgen deprivation therapy)

### Prevention Methods
- **Primary:** Healthy diet, regular exercise, maintaining healthy weight
- **Secondary:** PSA screening with informed decision-making (USPSTF: ages 55-69 shared decision)
- **Chemoprevention:** 5-alpha reductase inhibitors (finasteride, dutasteride) under investigation

### Diagnostic Approaches
- Prostate-specific antigen (PSA) blood test
- Digital rectal examination (DRE)
- Multiparametric MRI
- Transrectal ultrasound-guided biopsy
- MRI-targeted biopsy
- Liquid biopsy (emerging)

### Treatment Options
- **Active surveillance:** For low-risk disease
- **Surgery:** Radical prostatectomy (open, laparoscopic, robotic)
- **Radiation:** External beam, brachytherapy
- **Androgen deprivation therapy (ADT)**
- **Targeted therapy:** PARP inhibitors (BRCA-mutated)
- **Immunotherapy:** Sipuleucel-T, pembrolizumab

### Key Facts
1. Prostate cancer incidence is heavily influenced by PSA screening practices
2. Incidence rates vary >10-fold globally, from 20 to 71 per 100,000
3. Men of African ancestry have 2-3x higher mortality than European ancestry
4. Most prostate cancers are diagnosed at localized stage (76%)
5. 5-year survival for localized/regional disease approaches 100%
6. Advanced-stage diagnoses have increased 4-5% annually in the US since 2014
7. Mortality rates have declined 50% in many high-income countries since mid-1990s
8. Prostate cancer is the leading cancer in men in 68 countries

**Sources:** GLOBOCAN 2024; European Urology 2025; SEER Stat Facts (https://seer.cancer.gov/statfacts/html/prost.html); Kratzer et al., CA Cancer J Clin 2025

---

## 7. CERVICAL CANCER

### Basic Information
- **ICD-10 Code:** C53 (cervix uteri)
- **Primary Types:** Squamous cell carcinoma (70-80%), Adenocarcinoma (20-25%)

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~604,000 new cases
- **Annual Deaths:** ~280,000 deaths
- **5-Year Survival Rate:** ~66% (US, 2015-2021)
- **Rank:** #8 most commonly diagnosed cancer overall; #5 cancer in women; leading cancer in women in 26 countries

### Key Risk Groups
- Women aged 35-44 (peak incidence)
- Women with persistent high-risk HPV infection
- Women with HIV (6x higher risk)
- Immunocompromised women
- Women in low- and middle-income countries

### High-Burden Regions
- Sub-Saharan Africa (highest mortality rates)
- South and Central America, Melanesia
- South-East Asia
- 90% of deaths occur in LMICs

### Comorbidities
- HIV/AIDS
- Other sexually transmitted infections
- Immunosuppression
- Smoking
- Long-term oral contraceptive use

### Prevention Methods
- **Primary:** HPV vaccination (WHO target: 90% coverage by age 15)
- **Secondary:** Cervical screening (Pap test, HPV testing) at ages 35 and 45
- **Treatment of precancer:** Cryotherapy, LEEP, thermal ablation
- **Behavioral:** Safe sex practices, limiting sexual partners

### Diagnostic Approaches
- Pap smear (cytology)
- HPV DNA testing
- Visual inspection with acetic acid (VIA) in resource-limited settings
- Colposcopy with biopsy
- Endocervical curettage
- MRI/CT for staging

### Treatment Options
- **Surgery:** Conization, hysterectomy, trachelectomy (fertility-sparing)
- **Radiation therapy:** External beam and brachytherapy (concurrent with chemotherapy for locally advanced)
- **Chemotherapy:** Cisplatin-based (concurrent with radiation)
- **Immunotherapy:** Pembrolizumab (recurrent/metastatic)
- **Targeted therapy:** Bevacizumab

### Key Facts
1. 99% of cervical cancers are caused by persistent HPV infection
2. HPV vaccination before age 17 is associated with 88% reduction in cervical cancer risk
3. England reported zero cervical cancer deaths in vaccinated women aged 20-29
4. The WHO elimination target is <4 cases per 100,000 women
5. Current global HPV vaccination coverage is approximately 21% (far from 90% target)
6. Cervical cancer is the leading cause of cancer death in women in 26 countries
7. Women with HIV are 6 times more likely to develop cervical cancer
8. Achieving WHO targets could avert 74 million cases and 62 million deaths by 2120

**Sources:** WHO Fact Sheet (https://www.who.int/news-room/fact-sheets/detail/cervical-cancer); Lancet 2026; GLOBOCAN 2024; Women's Health Association 2026

---

## 8. BLADDER CANCER

### Basic Information
- **ICD-10 Code:** C67
- **Primary Types:** Urothelial/transitional cell carcinoma (90%), Squamous cell carcinoma, Adenocarcinoma

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~635,000 new cases (3.1% of all cancers)
- **Annual Deaths:** ~228,000 deaths (2.3% of all cancer deaths)
- **5-Year Survival Rate:** ~77% (US, 2015-2021)
- **Rank:** #8 most commonly diagnosed cancer; #13 cause of cancer death

### Key Risk Groups
- Men (3-4x higher risk than women)
- Smokers (50% of cases attributable to smoking)
- Adults aged 70+ (median age at diagnosis: 73)
- Workers in rubber, leather, dye, and paint industries
- People with schistosomiasis (in endemic regions)

### High-Burden Regions
- Southern and Western Europe (highest incidence)
- Northern America, Australia
- Northern Africa (high rates due to schistosomiasis)
- Mortality highest in Southern/Eastern Europe

### Comorbidities
- Chronic bladder inflammation/infections
- Schistosomiasis (in endemic areas)
- Diabetes mellitus
- Bladder stones
- Urinary tract infections

### Prevention Methods
- **Primary:** Smoking cessation (most important), occupational safety measures, avoiding industrial chemicals
- **Secondary:** No routine screening recommended; urine cytology in high-risk populations
- **Hydration:** Adequate fluid intake

### Diagnostic Approaches
- Cystoscopy with biopsy (gold standard)
- Urine cytology
- Urine-based tumor markers (NMP22, BTA)
- CT urogram
- Urine FISH testing
- MRI for staging

### Treatment Options
- **Surgery:** Transurethral resection, radical cystectomy
- **Intravesical therapy:** BCG immunotherapy, chemotherapy
- **Radiation:** For organ preservation or palliation
- **Chemotherapy:** Cisplatin-based neoadjuvant/adjuvant
- **Targeted therapy:** Erdafitinib, enfortumab vedotin
- **Immunotherapy:** Atezolizumab, pembrolizumab

### Key Facts
1. Smoking is responsible for approximately 50% of bladder cancer cases
2. Bladder cancer has the highest lifetime treatment costs of any cancer due to surveillance
3. Men are 3-4 times more likely to develop bladder cancer than women
4. Schistosomiasis causes a distinct squamous cell variant in endemic regions
5. Non-muscle invasive bladder cancer (70% at diagnosis) has high recurrence rates
6. 5-year survival for localized disease exceeds 96%
7. BCG immunotherapy is the standard of care for high-risk non-muscle invasive disease
8. The global burden is rising due to population aging

**Sources:** GLOBOCAN 2024; European Urology 2026; Nature Reviews Urology 2023; SEER Stat Facts (https://seer.cancer.gov/statfacts/html/urinb.html)

---

## 9. NON-HODGKIN LYMPHOMA

### Basic Information
- **ICD-10 Codes:** C82-C86, C96
- **Primary Types:** Diffuse large B-cell lymphoma (30-35%), Follicular lymphoma (20-25%), Mantle cell lymphoma, Peripheral T-cell lymphoma, Burkitt lymphoma

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~550,000 new cases
- **Annual Deaths:** ~260,000 deaths
- **5-Year Survival Rate:** ~74% (US, 2016-2022)
- **Rank:** #11 most commonly diagnosed cancer; #12 cause of cancer death

### Key Risk Groups
- Adults aged 65-74 (peak incidence; median age at diagnosis: 68)
- Immunocompromised individuals (HIV/AIDS, transplant recipients)
- People with autoimmune diseases
- Those exposed to pesticides/herbicides
- Individuals with family history of lymphoma

### High-Burden Regions
- Australia/New Zealand (highest incidence)
- Northern America, Northern Europe
- Sub-Saharan Africa (Burkitt lymphoma endemic)
- Incidence varies 2-fold globally

### Comorbidities
- HIV/AIDS
- Autoimmune diseases (rheumatoid arthritis, Sjögren's syndrome)
- Organ transplantation (post-transplant lymphoproliferative disorder)
- Celiac disease
- Helicobacter pylori infection (gastric MALT lymphoma)

### Prevention Methods
- **Primary:** Avoiding known carcinogens (pesticides, benzene), HIV prevention/treatment
- **Secondary:** No routine screening available
- **Vaccination:** Hepatitis B (reduces HBV-associated lymphoma)
- **Monitoring:** For high-risk immunocompromised individuals

### Diagnostic Approaches
- Lymph node biopsy (excisional preferred)
- PET-CT scan
- Bone marrow biopsy
- Flow cytometry
- Molecular/genetic testing
- LDH and beta-2 microglobulin levels

### Treatment Options
- **Chemotherapy:** R-CHOP (rituximab, cyclophosphamide, doxorubicin, vincristine, prednisone)
- **Radiation therapy:** For early-stage localized disease
- **Immunotherapy:** Rituximab, obinutuzumab, CAR-T cell therapy
- **Targeted therapy:** Ibrutinib, lenalidomide, bortezomib
- **Stem cell transplantation:** Autologous and allogeneic

### Key Facts
1. NHL is the 11th most commonly diagnosed cancer worldwide
2. Over 60 distinct NHL subtypes have been identified by WHO
3. HIV infection increases NHL risk by 5-15 fold
4. Burkitt lymphoma is endemic in equatorial Africa, associated with EBV and malaria
5. DLBCL is the most common subtype globally
6. CAR-T cell therapy has revolutionized treatment of relapsed/refractory NHL
7. NHL incidence is higher in males than females across all regions
8. The WHO identifies both viral (EBV, HCV, HIV) and chemical (pesticides) risk factors

**Sources:** GLOBOCAN 2024; SEER Stat Facts (https://seer.cancer.gov/statfacts/html/nhl.html); Arch Med Sci 2026; Blood 2024; Cancer Medicine 2024

---

## 10. PANCREATIC CANCER

### Basic Information
- **ICD-10 Code:** C25
- **Primary Types:** Pancreatic ductal adenocarcinoma (85%), Neuroendocrine tumors, Acinar cell carcinoma

### Global Statistics (GLOBOCAN 2024)
- **Annual Incidence:** ~512,000 new cases (2.5% of all cancers)
- **Annual Deaths:** ~467,000 deaths (4.8% of all cancer deaths)
- **5-Year Survival Rate:** ~13% (US, 2016-2022)
- **Rank:** #12 most commonly diagnosed cancer; #6 cause of cancer death

### Key Risk Groups
- Adults aged 65-74 (median age at diagnosis: 70)
- Men (slightly higher risk than women)
- People with family history of pancreatic cancer
- Heavy smokers
- People with new-onset diabetes after age 50

### High-Burden Regions
- Northern America, Northern and Western Europe
- Australia/New Zealand
- Eastern Asia
- Incidence rates are 3x higher in high vs. low HDI countries

### Comorbidities
- Chronic pancreatitis
- Type 2 diabetes mellitus
- Obesity
- Hereditary pancreatitis syndromes
- BRCA1/BRCA2 mutations

### Prevention Methods
- **Primary:** Smoking cessation, maintaining healthy weight, limiting alcohol, physical activity
- **Secondary:** No routine screening recommended; surveillance in high-risk individuals
- **Chemoprevention:** No proven chemopreventive agents
- **Genetic counseling:** For familial/hereditary cases

### Diagnostic Approaches
- CT scan (multiphasic, pancreatic protocol)
- Endoscopic ultrasound (EUS) with biopsy
- MRI/MRCP
- CA 19-9 tumor marker
- Laparoscopy (for staging)
- Liquid biopsy (emerging)

### Treatment Options
- **Surgery:** Whipple procedure (pancreaticoduodenectomy), distal pancreatectomy
- **Chemotherapy:** FOLFIRINOX, gemcitabine + nab-paclitaxel
- **Radiation:** For locally advanced disease
- **Targeted therapy:** Olaparib (BRCA-mutated), sotorasib (KRAS G12C)
- **Immunotherapy:** Pembrolizumab (MSI-H/dMMR tumors)
- **Palliative care:** For symptom management

### Key Facts
1. Pancreatic cancer has the lowest 5-year survival rate of all major cancers (~13%)
2. 75% of cases are diagnosed at locally advanced or metastatic stage
3. Incidence and mortality have been slowly rising in most countries
4. Only 10-15% of pancreatic cancers are surgically resectable at diagnosis
5. The 5-year survival for localized disease is 44% but only 3% for distant disease
6. Pancreatic cancer is projected to become the #2 cause of cancer death by 2030
7. New-onset diabetes in people over 50 can be an early sign of pancreatic cancer
8. Global incidence has increased 0.9% annually over the past decade

**Sources:** GLOBOCAN 2024; SEER Stat Facts (https://seer.cancer.gov/statfacts/html/pancreas.html); Gastroenterology 2021; PMC 2022; Canadian Cancer Society

---

## Summary Table: Global Cancer Statistics 2024

| Cancer Type | Incidence | Deaths | 5-Year Survival | Rank (Incidence) | Rank (Mortality) |
|-------------|-----------|--------|-----------------|------------------|------------------|
| Lung | 2.6M | 1.9M | 13% | 1 | 1 |
| Breast (Female) | 2.4M | 694K | 90% | 2 | 4 |
| Colorectal | 2.0M | 918K | 65% | 3 | 2 |
| Prostate | 1.5M | 420K | 97% | 4 | 8 |
| Stomach | 980K | 642K | 38% | 5 | 5 |
| Liver | 843K | 732K | 21% | 7 | 3 |
| Cervical | 604K | 280K | 66% | 8 | - |
| Bladder | 635K | 228K | 77% | 8 | 13 |
| NHL | 550K | 260K | 74% | 11 | 12 |
| Pancreatic | 512K | 467K | 13% | 12 | 6 |

---

## Key References

1. Sung H, et al. Global cancer statistics 2024: GLOBOCAN estimates. CA Cancer J Clin. 2026. https://doi.org/10.3322/caac.70090
2. Bray F, et al. Global cancer statistics 2022: GLOBOCAN estimates. CA Cancer J Clin. 2024;74:229-263. https://doi.org/10.3322/caac.21834
3. WHO Cancer Fact Sheet. https://www.who.int/news-room/fact-sheets/detail/cancer
4. IARC Global Cancer Observatory. https://gco.iarc.who.int/
5. SEER Cancer Statistics. https://seer.cancer.gov/
6. Filho AM, et al. The GLOBOCAN 2022 cancer estimates. Int J Cancer. 2025;156(7):1336-1346.
7. Individual cancer-specific references as cited in each section above.
