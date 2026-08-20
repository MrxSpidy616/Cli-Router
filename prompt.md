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

---

# Comprehensive Research: 10 Global Health Conditions (2019–2024 Data)

---

## 1. ROAD TRAFFIC INJURIES

### Name
Road Traffic Injuries (RTIs)

### ICD-10 Codes
- **V00–V89**: Transport accidents (pedestrian, cyclist, motorcyclist, motor vehicle occupant, other)
- **V00–V09**: Pedestrian injured in transport accident
- **V10–V19**: Cyclist injured in transport accident
- **V20–V29**: Motorcyclist injured in transport accident
- **V30–V59**: Occupant of three-wheeled or four-wheeled motor vehicle
- **V60–V69**: Occupant of heavy transport vehicle
- **V70–V79**: Bus occupant
- **V80–V89**: Other specified/unspecified road transport accidents

### Global Prevalence/Incidence
- **50.9 million** road injury incident cases globally in 2023 (GBD 2023)
- Age-standardized incidence rate: 664.51 per 100,000 (2021)
- Rate decreased ~38% between 1990 and 2023

### Annual Deaths
- **1.19 million** road traffic deaths in 2021 (WHO Global Status Report 2023)
- **1.34 million** deaths in 2023 (GBD 2023)
- Leading cause of death for children and young adults aged 5–29 years
- 12th leading cause of death overall

### Key Risk Groups
- **Males**: 3× higher mortality rate than females
- **Aged 10–39 years**: Leading cause of death globally
- **Pedestrians, cyclists, motorcyclists**: 50%+ of fatalities
- **Low-income populations**: Higher risk despite fewer vehicles
- **Occupants of four-wheeled vehicles**: 25% of fatalities
- **Motorcyclists**: 30% of deaths

### High-Burden Regions
- **WHO South-East Asia Region**: 28% of global deaths (330,222)
- **WHO Western Pacific Region**: 25% (297,733)
- **WHO African Region**: 19% (225,482) – highest fatality rate at 19/100,000
- **Region of the Americas**: 12% (144,090)
- **WHO Eastern Mediterranean Region**: 11% (125,781)
- **WHO European Region**: 5% (62,670) – lowest at 7/100,000
- 90% of deaths occur in low- and middle-income countries (LMICs)

### Prevention
- Speed limits and enforcement
- Seat-belt and helmet laws
- Child restraints
- Anti-drunk driving legislation
- Pedestrian/cyclist infrastructure (cycle lanes, sidewalks)
- Road engineering and vehicle safety standards
- Post-crash emergency care
- Safe System approach to road safety

### Diagnostics
- Clinical assessment of injuries
- Imaging (X-ray, CT, MRI)
- Trauma scoring systems (ISS, GCS)
- Emergency department assessment

### Treatment
- Emergency trauma care
- Surgical intervention
- ICU management
- Rehabilitation (physiotherapy, occupational therapy)
- Fracture fixation
- Wound management

### 5 Key Facts
1. Road traffic injuries are the **#1 killer** of people aged 5–29 years (WHO, 2023)
2. Motor vehicle fleet **more than doubled** since 2010 while death rates fell 16% (WHO, 2023)
3. Crashes cost most countries **3% of GDP** (WHO, 2023)
4. Only **6 countries** have laws meeting WHO best practice for all road safety risk factors (WHO, 2023)
5. The UN Decade of Action for Road Safety 2021–2030 targets a **50% reduction** in deaths by 2030 (UN, 2020)

### Source URLs
- https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries
- https://www.who.int/publications-detail-redirect/9789240086517
- https://www.healthdata.org/index.php/research-analysis/library/global-regional-and-national-burden-road-injuries-systematic-analysis
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10523810/

---

## 2. FALLS (INJURIES)

### Name
Unintentional Falls

### ICD-10 Codes
- **W00–W19**: Falls (standing position, ladders, stairs, steps, etc.)
- **W00**: Fall involving ice and snow
- **W01–W07**: Fall from slipping, tripping, stairs, chairs, beds, ladders
- **W10–W19**: Other falls

### Global Prevalence/Incidence
- **540.88 million** prevalent cases globally in 2021
- **215.57 million** incident cases in 2021
- Age-standardized incidence: 2,702.0 per 100,000 (2021)
- 37.3 million falls severe enough to require medical attention annually (WHO)

### Annual Deaths
- **802,803** deaths from falls in 2021 (GBD 2021)
- **684,000** estimated annual deaths (WHO, 2023)
- Second leading cause of unintentional injury death after road traffic injuries
- 80%+ of fall-related fatalities in LMICs

### Key Risk Groups
- **Adults >60 years**: Greatest number of fatal falls; 20–30% suffer moderate-severe injuries
- **Children**: Developmental curiosity, increasing independence
- **Males**: Higher death rates and DALYs across all age groups
- **Occupational hazards**: Workers at elevated heights
- **Institutionalized elderly**: Poor mobility, cognition, vision
- **Substance users**: Alcohol/substance use increases risk

### High-Burden Regions
- **Western Pacific and South East Asia**: 60% of fall-related deaths
- **Low SDI regions**: Highest age-standardized death rates
- **High SDI regions**: Highest age-standardized incidence rates
- **Sub-Saharan Africa**: Highest ASDR in older adults (2021)
- **Australasia**: Highest ASPR (12,862.8 per 100,000)
- **India, China, USA**: Highest absolute death numbers

### Prevention
- Education and training programs
- Home safety assessments (grab bars, lighting, non-slip surfaces)
- Medication review (side effects affecting balance)
- Exercise programs (balance, strength training)
- Workplace safety regulations
- Fall prevention in elderly (osteoporosis management)
- Supervision of children

### Diagnostics
- Clinical examination and history
- Imaging (X-ray, CT for fractures)
- Bone density scanning (DEXA)
- Neurological assessment
- Balance and gait assessment
- Vision testing

### Treatment
- Emergency care for acute injuries
- Fracture management (surgery, casting)
- Hip fracture repair (surgical)
- Head injury management
- Rehabilitation programs
- Osteoporosis treatment
- Physical therapy

### 5 Key Facts
1. Falls are the **second leading** cause of unintentional injury death globally (WHO, 2023)
2. **684,000 people die** from falls each year, over 80% in LMICs (WHO, 2023)
3. Falls result in **more years lived with disability** than transport injury, drowning, burns, and poisoning combined (WHO, 2023)
4. **Adults >60 years** suffer the greatest number of fatal falls (WHO, 2023)
5. Global fall-related deaths **nearly doubled** from 407,768 (1990) to 802,803 (2021) (GBD 2021)

### Source URLs
- https://www.who.int/news-room/fact-sheets/detail/falls
- https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1695026/full
- https://pubmed.ncbi.nlm.nih.gov/40168890/
- https://ourworldindata.org/grapher/death-rate-from-falls-gbd

---

## 3. SELF-HARM/SUICIDE

### Name
Self-Harm / Suicide

### ICD-10 Codes
- **Intentional self-harm (suicide)**: X60–X84, Y87.0
  - X60–X64: Poisoning
  - X65–X69: Other means
  - X70–X79: Hanging, drowning, firearms, sharp objects, jumping
  - X80–X84: Other
- **Sequelae of self-harm**: Y87.0
- **Undetermined intent**: Y10–Y34 (often misclassified suicides)

### Global Prevalence/Incidence
- **5.49 million** new self-harm cases in 2021 (GBD 2021)
- **746,400** deaths by suicide in 2021
- **766,000** deaths in 2023 (GBD 2023)
- 33.5 million DALYs from self-harm globally in 2021

### Annual Deaths
- **727,000** deaths annually (WHO, 2023)
- **766,000** in 2023 (IHME/GBD)
- 1 in every 100 deaths is by suicide
- Third leading cause of death among 15–29-year-olds
- 20+ suicide attempts for every suicide death

### Key Risk Groups
- **Males**: 535,000 suicide deaths in 2023 (70% of total)
- **Aged 15–29 years**: Third leading cause of death
- **Young adults (20–29)**: Highest DALY rates
- **Middle-aged populations (45–60)**: High mortality rates
- **Low- and middle-income countries**: 73% of global suicides
- **Those with prior suicide attempts**: Major risk factor

### High-Burden Regions
- **Central Europe, Eastern Europe, Central Asia**: Highest age-standardized rates (14.7/100,000)
- **South Asia**: Highest absolute number of deaths (212,400)
- **Greenland**: Highest national rate (53.5/100,000)
- **Sub-Saharan Africa**: Increasing absolute burden projected to 2050
- **Eastern Mediterranean**: Rising rates
- **Low-income countries**: Higher rates overall

### Prevention
- Restricting access to means (pesticides, firearms)
- Media reporting guidelines
- School-based life skills programs
- Gatekeeper training
- Mental health services
- Screening for depression and alcohol use
- Crisis hotlines and support
- WHO LIVE LIFE initiative
- Decriminalization of suicide attempts

### Diagnostics
- Mental health assessment
- Screening tools (PHQ-9, Columbia Suicide Severity Rating Scale)
- Psychiatric evaluation
- Risk factor assessment
- Alcohol/substance use screening

### Treatment
- Crisis intervention
- Psychotherapy (CBT, DBT)
- Pharmacotherapy (antidepressants, mood stabilizers)
- Safety planning
- Follow-up care after attempts
- Family support programs
- Community-based mental health services

### 5 Key Facts
1. **Over 720,000 people** die by suicide every year – one every 43 seconds (WHO, 2023)
2. Suicide is the **3rd leading cause of death** among 15–29-year-olds globally (WHO, 2023)
3. **73% of suicides** occur in low- and middle-income countries (WHO, 2023)
4. Global age-standardized suicide **rates are declining** (EAPC: –1.97% per year, 1990–2021)
5. For every suicide death, there are **20+ attempts** – prior attempt is the strongest predictor (WHO, 2023)

### Source URLs
- https://www.who.int/news-room/fact-sheets/detail/suicide
- https://www.who.int/teams/mental-health-and-substance-use/data-research/suicide-data
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12116644/
- https://www.healthdata.org/research-analysis/health-topics/suicide-self-harm

---

## 4. INTERPERSONAL VIOLENCE

### Name
Interpersonal Violence (including intimate partner violence and violence against children)

### ICD-10 Codes
- **Homicide**: X85–Y09
- **Assault**: Y00–Y09
- **Intimate partner violence**: T74.2–T76.22
- **Violence against children**: Y87.1–Y87.2
- **Physical abuse**: T74
- **Sexual abuse**: T74.2
- **Psychological abuse**: T74.3
- **Neglect/abandonment**: T74.4

### Global Prevalence/Incidence
- **608 million** females aged 15+ have experienced intimate partner violence (IPV) in their lifetime (GBD 2023)
- **1.01 billion** individuals aged 15+ experienced sexual violence during childhood
- **29.40 million** new cases of interpersonal violence in 2021
- Nearly **1 in 3 women** (32%) have experienced physical/sexual violence by partner or non-partner

### Annual Deaths
- **~470,000** deaths attributed to interpersonal violence annually
- **140 women and girls** killed every day by partners or family members in 2023
- 18.5 million DALYs attributed to IPV among females (2023)
- 32.2 million DALYs attributed to sexual violence against children (2023)

### Key Risk Groups
- **Women aged 15–49**: Highest burden of IPV
- **Males aged 15–49**: Highest burden of community violence
- **Children and adolescents**: Sexual and physical violence
- **Low-income populations**: Higher exposure
- **Conflict-affected populations**
- **LGBTQ+ individuals**: Elevated risk

### High-Burden Regions
- **Sub-Saharan Africa**: Highest prevalence of IPV
- **South Asia**: High burden of sexual violence
- **Central/Eastern Europe**: High interpersonal violence rates
- **Low- and middle-income countries**: 90%+ of violence-related deaths
- **Conflict-affected areas**: Highest MMR and violence rates
- **Latin America**: High community violence

### Prevention
- Laws against domestic violence and sexual assault
- School-based prevention programs
- Community mobilization
- Women's empowerment programs
- Parenting skills training
- Economic empowerment of women
- Safe spaces for women and children
- Male engagement programs
- Alcohol policy interventions

### Diagnostics
- Clinical screening for abuse (routine inquiry)
- Forensic examination
- Injury documentation
- Mental health assessment
- Risk assessment tools
- Verbal autopsy in low-resource settings

### Treatment
- Emergency medical care
- Surgical intervention for injuries
- Psychological support and counseling
- Trauma-focused therapy
- Safe shelter provision
- Legal aid and protection orders
- HIV/STI post-exposure prophylaxis
- Referral networks

### 5 Key Facts
1. **608 million** women have experienced intimate partner violence in their lifetime (GBD 2023)
2. IPV and sexual violence against children are among the **top 5 risk factors** for DALYs in women aged 15–49 (GBD 2023)
3. **140 women and girls** are killed daily by partners or family members (WHO, 2023)
4. Only **16.3%** of suicides in LMICs have good vital registration data – violence is severely underreported (WHO)
5. Mental health disorders account for the **greatest share** of disease burden among violence survivors (GBD 2023)

### Source URLs
- https://www.who.int/news-room/fact-sheets/detail/violence-against-women
- https://www.healthdata.org/research-analysis/library/disease-burden-attributable-intimate-partner-violence-against-females-and
- https://link.springer.com/article/10.1186/s12889-025-22814-0
- https://www.who.int/publications/i/item/B09860

---

## 5. MATERNAL CONDITIONS (MATERNAL MORTALITY)

### Name
Maternal Mortality / Maternal Conditions

### ICD-10 Codes
- **O00–O99**: Pregnancy, childbirth and the puerperium
- **O00–O08**: Pregnancy with abortive outcome
- **O10–O16**: Hypertensive disorders in pregnancy
- **O20–O29**: Other maternal disorders predominantly related to pregnancy
- **O60–O75**: Complications of labor and delivery
- **O85–O92**: Complications predominantly related to the puerperium
- **O95–O97**: Maternal deaths classified by cause
- **Specific causes**: O72 (hemorrhage), O14 (pre-eclampsia), O85 (puerperal sepsis)

### Global Prevalence/Incidence
- **260,000 maternal deaths** in 2023 (MMEIG/WHO, 2025)
- Maternal mortality ratio (MMR): **197 per 100,000 live births** globally in 2023
- Down from 328 in 2000 (40% reduction over 24 years)
- Lifetime risk for a 15-year-old girl: **1 in 272**

### Annual Deaths
- **260,000** maternal deaths in 2023
- **700+ women** die every day from pregnancy/childbirth causes
- One maternal death every **2 minutes**
- 90%+ of deaths in low- and lower-middle-income countries

### Key Risk Groups
- **Women in low-income countries**: MMR 346/100,000 vs. 10/100,000 in high-income
- **Adolescent mothers** (<20 years)
- **Women in conflict zones**: MMR 504/100,000
- **Women in sub-Saharan Africa**: 70% of global maternal deaths
- **Women with pre-existing conditions**: Hypertension, diabetes, HIV
- **Women in least developed countries**: MMR 313/100,000

### High-Burden Regions
- **Sub-Saharan Africa**: 70% of maternal deaths (182,000)
- **Southern Asia**: 17% (43,000)
- **Western Africa**: MMR 690/100,000 (highest subregion)
- **Middle Africa**: MMR 415/100,000
- **Conflict-affected countries**: 61% of global deaths
- **Least developed countries**: 43.9% of all maternal deaths

### Prevention
- Skilled birth attendance at every delivery
- Emergency obstetric and neonatal care
- Antenatal care (4+ visits)
- Family planning services
- Prevention and management of pre-eclampsia/eclampsia
- Safe abortion care
- Prevention of postpartum hemorrhage
- Infection prevention
- Addressing social determinants (education, poverty)

### Diagnostics
- Clinical assessment during pregnancy
- Blood pressure monitoring
- Blood tests (hemoglobin, glucose)
- Urine protein testing
- Ultrasound
- Fetal monitoring
- Postpartum monitoring

### Treatment
- Oxytocin for hemorrhage
- Magnesium sulfate for eclampsia
- Blood transfusion
- Antimicrobials for infections
- Surgical intervention (cesarean section, hysterectomy)
- Manual removal of placenta
- Repair of obstetric trauma
- ICU management for complications

### 5 Key Facts
1. **260,000 women** died from maternal causes in 2023 – over 700 per day (MMEIG, 2025)
2. **92% of maternal deaths** occurred in low- and lower-middle-income countries (WHO, 2025)
3. **Hemorrhage** is the leading cause (27% of maternal deaths globally) (Lancet, 2025)
4. Global MMR dropped **40%** from 328 (2000) to 197 (2023) but SDG target of <70 by 2030 is not on track (WHO, 2025)
5. The **COVID-19 pandemic** caused an estimated 1,740–22,900 additional maternal deaths in 2020–2021 (GBD, 2023)

### Source URLs
- https://www.who.int/news-room/fact-sheets/detail/maternal-mortality
- https://www.who.int/publications/i/item/9789240108462
- https://iris.who.int/server/api/core/bitstreams/29f43a3d-2228-489c-b1e7-b2f28e9101ce/content
- https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(24)00560-6/fulltext

---

## 6. NEONATAL CONDITIONS (PRETERM BIRTH COMPLICATIONS)

### Name
Neonatal Conditions / Preterm Birth Complications

### ICD-10 Codes
- **P07**: Disorders related to short gestation and low birth weight
  - P07.0: Extremely low birth weight
  - P07.1: Other low birth weight
  - P07.2: Extreme immaturity
  - P07.3: Other preterm infant
- **P05**: Disorders related to length of gestation and fetal growth
- **P00–P96**: Certain conditions originating in the perinatal period
- **P23**: Congenital pneumonia
- **P24**: Neonatal disorders of metabolism
- **P25–P28**: Respiratory conditions originating in the perinatal period

### Global Prevalence/Incidence
- **13.4 million babies** born preterm (<37 weeks) in 2020
- Preterm birth rate: **9.9%** of all live births globally
- 1 in 10 babies born too early
- No measurable change in rates over the past decade

### Annual Deaths
- **~900,000** neonatal deaths from preterm birth complications (2019)
- **~1 million** neonatal deaths in 2022 (prematurity remains #1 cause of under-5 mortality)
- 40% of neonatal deaths are due to preterm complications
- 3/4 of these deaths are preventable with current interventions

### Key Risk Groups
- **Low-income settings**: 50% mortality for babies ≤32 weeks vs. <10% in high-income
- **Extremely preterm** (<28 weeks): >90% die in low-income countries within days
- **Low birth weight infants**
- **Twin/multiple pregnancies**
- **Mothers <20 years or >35 years**
- **Infections during pregnancy**
- **Poor nutrition and inadequate prenatal care**

### High-Burden Regions
- **Southern Asia**: 13.2% preterm birth rate (highest region)
- **Sub-Saharan Africa**: 10.1% rate, rising absolute numbers (+563,000 more preterm births 2010–2020)
- **India**: Highest absolute number (>20% of global preterm births)
- **Nigeria, Pakistan**: Among highest national burdens
- **Latin America**: Wide variation (5.8% Nicaragua to 12.8% Suriname)
- **Bangladesh, Malawi, Pakistan**: Rates 14–16%

### Prevention
- Quality antenatal care
- Management of pre-eclampsia
- Prevention and treatment of infections (malaria, HIV)
- Cervical cerclage for cervical insufficiency
- Progesterone supplementation
- Reduction of non-medically indicated cesarean sections
- Maternal nutrition supplementation
- Smoking cessation programs
- Management of chronic conditions (diabetes, hypertension)

### Diagnostics
- Gestational age assessment (ultrasound, LMP)
- Birth weight measurement
- Ultrasound biometry
- Fetal fibronectin testing
- Cervical length measurement
- Tocolysis monitoring
- Neonatal assessment (APGAR, Ballard score)

### Treatment
- Kangaroo mother care (skin-to-skin)
- Respiratory support (CPAP, ventilation)
- Surfactant therapy
- Thermoregulation (incubators, warmers)
- Nutritional support (breast milk, parenteral nutrition)
- Infection management (antibiotics)
- Phototherapy for jaundice
- Neonatal intensive care

### 5 Key Facts
1. **13.4 million** babies (1 in 10) are born preterm globally every year (WHO/Lancet, 2023)
2. Preterm complications are the **#1 cause of death** in children under 5 (WHO, 2023)
3. In low-income countries, **>90%** of extremely preterm babies die within days; <10% die in high-income settings (WHO, 2023)
4. **65% of preterm births** occur in sub-Saharan Africa and southern Asia (WHO, 2023)
5. No measurable change in global preterm birth rates in the **past decade** (9.9% in 2020 vs. 9.8% in 2010) (Born Too Soon, 2023)

### Source URLs
- https://www.who.int/news-room/fact-sheets/detail/preterm-birth
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11462015/
- https://link.springer.com/article/10.1186/s12978-025-02033-x
- https://jamanetwork.com/journals/jamapediatrics/fullarticle/2792732

---

## 7. CONGENITAL ANOMALIES

### Name
Congenital Anomalies (Birth Defects / Congenital Malformations)

### ICD-10 Codes
- **Q00–Q99**: Congenital malformations, deformations and chromosomal abnormalities
  - Q00–Q07: Nervous system (neural tube defects, hydrocephalus)
  - Q20–Q24: Circulatory system (congenital heart defects)
  - Q35–Q37: Cleft lip and palate
  - Q38–Q45: Digestive system
  - Q50–Q56: Genital organs
  - Q60–Q64: Urinary system
  - Q65–Q79: Musculoskeletal and limb anomalies
  - Q80–Q89: Other
  - Q90–Q99: Chromosomal abnormalities (Down syndrome)

### Global Prevalence/Incidence
- **6% of babies** born with a congenital disorder worldwide
- **~53 million** people living with congenital anomalies globally
- **7.2 million** new cases diagnosed in newborns in 2021
- Prevalence rate: 865.75 per 100,000 (2021)
- Congenital heart disease: most common (~9.41 per 1,000 live births)

### Annual Deaths
- **240,000** newborns die within 28 days from congenital disorders (WHO)
- **170,000** children die aged 1 month to 5 years
- **~410,000** child deaths annually from birth defects
- **475,816** deaths in children aged 0–14 in 2021 (GBD 2021)
- 10% of all neonatal and under-5 deaths

### Key Risk Groups
- **Low-income countries**: 94% of severe congenital disorders
- **Males**: Higher prevalence than females across all SDI groups
- **Low SDI regions**: Highest mortality rates (43.33 per 100,000)
- **Families with consanguinity**
- **Maternal age extremes** (<15 or >35 years)
- **Mothers with diabetes, obesity, or infections**

### High-Burden Regions
- **Sub-Saharan Africa**: Highest mortality from congenital anomalies
- **South Asia**: High absolute numbers
- **Low SDI regions**: Highest age-standardized death rate
- **Oceania**: Increasing prevalence trends
- **Central Asia**: Rising prevalence
- **India, Nigeria**: Highest absolute death numbers

### Prevention
- Folic acid supplementation (reduces neural tube defects by 70%)
- Rubella vaccination
- Iodine supplementation
- Genetic counseling
- Preconception care
- Avoidance of teratogens (alcohol, certain medications)
- Prenatal screening
- Universal health coverage

### Diagnostics
- Prenatal ultrasound screening
- Serum screening (triple/quad test)
- Amniocentesis
- Chorionic villus sampling
- Newborn screening (metabolic disorders)
- Echocardiography
- Genetic testing (karyotyping, microarray)
- Pulse oximetry screening

### Treatment
- Surgical repair (heart defects, cleft lip/palate, neural tube defects)
- Cardiac catheterization
- Medication management
- Occupational and physical therapy
- Special education support
- Long-term follow-up care
- Palliative care for severe anomalies

### 5 Key Facts
1. An estimated **6% of babies** (1 in 17) are born with a congenital disorder globally (WHO, 2023)
2. **94% of severe congenital disorders** occur in low- and middle-income countries (WHO, 2023)
3. Congenital heart defects are the **most common** type and the leading cause of CBD-related deaths (46.7% of deaths) (GBD, 2021)
4. Global mortality from CBDs decreased **47%** from 902,741 (1990) to 475,816 (2021) in children (GBD, 2021)
5. As under-5 mortality declines from other causes, congenital anomalies become a **larger proportion** of neonatal/child deaths (WHO, 2023)

### Source URLs
- https://www.who.int/news-room/fact-sheets/detail/birth-defects
- https://www.who.int/topics/congenital_anomalies/en/
- https://tp.amegroups.org/article/view/153044/html
- https://link.springer.com/article/10.1186/s12884-025-07612-1

---

## 8. MALNUTRITION (PROTEIN-ENERGY)

### Name
Protein-Energy Malnutrition (PEM) / Child Growth Failure

### ICD-10 Codes
- **E40**: Kwashiorkor
- **E41**: Nutritional marasmus
- **E42**: Marasmic kwashiorkor
- **E43**: Unspecified severe protein-energy malnutrition
- **E44**: Protein-energy malnutrition of moderate and mild degree
- **E45**: Retarded development following protein-energy malnutrition
- **E46**: Unspecified protein-energy malnutrition
- **E64.0**: Sequelae of protein-energy malnutrition

### Global Prevalence/Incidence
- **14.77 million** prevalent cases of PEM in 2019
- Age-standardized prevalence rate: 2,006.4 per 100,000 (2019)
- ASPR showed increasing trend (EAPC: +0.19% per year)
- **Child growth failure** (stunting, wasting, underweight) affects millions of children

### Annual Deaths
- **212,242** deaths from PEM in 2019
- **~880,000** child deaths associated with child growth failure in 2023 (GBD 2023)
- PEM causes **56% of children's deaths** in developing countries
- Child growth failure = 18.8% of all under-5 deaths

### Key Risk Groups
- **Children under 5 years**: Highest prevalence, especially 1–4 years
- **Elderly**: ~50% of hospitalized elderly have PEM
- **Low SDI populations**: Highest burden
- **Sub-Saharan Africa and South Asia**: Highest geographic burden
- **Children in food-insecure regions**
- **Refugee and displaced populations**

### High-Burden Regions
- **South Asia**: Highest age-standardized rates
- **Eastern Sub-Saharan Africa**: Highest death and DALY rates
- **Sub-Saharan Africa**: 618,000 deaths associated with CGF (2023)
- **South Asia**: 165,000 CGF deaths (2023)
- **Sierra Leone**: Highest DALYs rate for PEM among children
- **India, Nigeria**: Highest absolute burdens

### Prevention
- Exclusive breastfeeding for first 6 months
- Complementary feeding from 6 months
- Micronutrient supplementation
- Food fortification
- Nutrition education
- Social protection programs (cash transfers)
- Food security programs
- Growth monitoring and promotion
- Management of acute malnutrition

### Diagnostics
- Anthropometric measurements (weight-for-height, height-for-age, weight-for-age)
- Z-score classification (WHO growth standards)
- Mid-upper arm circumference (MUAC)
- Biochemical markers (albumin, prealbumin)
- Clinical assessment (edema, wasting)
- Severe acute malnutrition: WHZ < -3 or MUAC < 115mm

### Treatment
- Ready-to-use therapeutic food (RUTF)
- Therapeutic milk (F-75, F-100)
- Inpatient treatment for severe acute malnutrition
- Community-based management of acute malnutrition (CMAM)
- Breastfeeding support
- Micronutrient supplementation
- Treatment of complications (hypothermia, hypoglycemia, infection)
- Follow-up care

### 5 Key Facts
1. **880,000 child deaths** annually are associated with child growth failure (underweight, stunting, wasting) (GBD 2023)
2. PEM causes **56% of children's deaths** in developing countries (Nutrients, 2022)
3. Global PEM prevalence is **increasing** (EAPC: +0.19% per year), mainly due to aging populations (GBD 2019)
4. **Low SDI regions** have the highest death rates but show declining trends (Nutrients, 2022)
5. PEM also significantly affects the **elderly** (~50% of hospitalized older adults have some degree of PEM) (Nutrients, 2022)

### Source URLs
- https://www.mdpi.com/2072-6643/14/13/2592
- https://www.ons.gov.uk/aboutus/transparencyandgovernance/freedomofinformationfoi/deathsfrom-malnutrition
- https://kclpure.kcl.ac.uk/ws/files/358748923/GBD_2023_Child_Growth_Failure.pdf
- https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2024.1426790/full

---

## 9. IODINE DEFICIENCY

### Name
Iodine Deficiency

### ICD-10 Codes
- **E00**: Congenital iodine deficiency syndrome (cretinism)
  - E00.0: Neurological
  - E00.1: Myxedematous
  - E00.2: Mixed
  - E00.9: Unspecified
- **E01**: Iodine deficiency-related thyroid disorders
  - E01.0: Diffuse goiter
  - E01.1: Multinodular goiter
  - E01.2: Other goiter
  - E01.8: Other iodine deficiency disorders
- **E02**: Subclinical iodine deficiency

### Global Prevalence/Incidence
- **8.08 million** incident cases of iodine deficiency in 2021
- **186,825** prevalent cases of developmental/intellectual disability from iodine deficiency in 2021
- **2.44 million** DALYs from iodine deficiency in 2019
- Global incidence peaked at ages 20–24 years
- **21 countries** still have insufficient iodine status (2024 IGN scorecard)

### Annual Deaths
- Iodine deficiency is **rarely a direct cause of death** but contributes to stillbirths and neonatal mortality
- **~50,000 stillbirths** per year in Ethiopian women due to severe iodine deficiency
- Primary burden is morbidity (intellectual disability) rather than mortality
- GBD estimates include iodine deficiency under nutritional deficiencies

### Key Risk Groups
- **School-age children**: 285 million vulnerable globally
- **Pregnant and lactating women**: Increased requirements
- **Women of reproductive age**
- **Populations in iodine-deficient soils** (inland, mountainous regions)
- **Low SDI populations**: Highest burden
- **Females**: Higher prevalence than males

### High-Burden Regions
- **Central Sub-Saharan Africa**: Highest ASR (459 per 100,000)
- **South Asia**: High burden
- **Eastern Sub-Saharan Africa**: High burden
- **East Asia**: Increasing ASR from 1990 to 2019
- **Philippines, Pakistan, Nepal**: Greatest increases in incidence
- **Somalia**: Highest rates of developmental disability from iodine deficiency

### Prevention
- Universal salt iodization (USI) – most cost-effective strategy
- Iodized oil supplementation
- Iodine supplementation for pregnant women
- Food fortification (bread, water)
- Education on dietary iodine sources
- Monitoring of population iodine status

### Diagnostics
- Urinary iodine concentration (UIC) – gold standard
- Median UIC in school-age children:
  - <20 μg/L: Severe deficiency
  - 20–49 μg/L: Moderate deficiency
  - 50–99 μg/L: Mild deficiency
  - 100–199 μg/L: Adequate
- Thyroid function tests (TSH, T3, T4)
- Goiter assessment (palpation, ultrasound)

### Treatment
- Iodized salt consumption
- Oral iodine supplementation (potassium iodide)
- Iodized oil (intramuscular or oral)
- Thyroid hormone replacement for hypothyroidism
- Treatment of iodine-induced hyperthyroidism
- Nutritional counseling

### 5 Key Facts
1. Iodine deficiency is the **world's leading preventable cause** of intellectual disability and brain damage (WHO)
2. The number of countries with insufficient iodine status has decreased from **113 in 1993 to 21 in 2024** (IGN, 2024)
3. **285 million school-age children** in countries with chronic iodine shortage remain at risk (WHO)
4. Global age-standardized prevalence of developmental disability from iodine deficiency **decreased 58.5%** from 1990 to 2019 (Frontiers, 2024)
5. Iodine deficiency is **easily preventable** through universal salt iodization but over 2 billion people remain at risk (PMC, 2023)

### Source URLs
- https://www.who.int/data/nutrition/nlis/info/iodine-deficiency
- https://ign.org/scorecard/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11623181/
- https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1598949/full

---

## 10. VITAMIN A DEFICIENCY

### Name
Vitamin A Deficiency (VAD)

### ICD-10 Codes
- **E50**: Vitamin A deficiency
  - E50.0: Vitamin A deficiency with conjunctival xerosis
  - E50.1: Vitamin A deficiency with Bitot's spot
  - E50.2: Vitamin A deficiency with corneal xerosis
  - E50.3: Vitamin A deficiency with corneal ulceration and xerosis
  - E50.4: Vitamin A deficiency with keratomalacia
  - E50.5: Vitamin A deficiency with night blindness
  - E50.6: Vitamin A deficiency with xerophthalmia
  - E50.7: Other ocular manifestations
  - E50.8: Other manifestations
  - E50.9: Unspecified vitamin A deficiency
- **E64.1**: Sequelae of vitamin A deficiency

### Global Prevalence/Incidence
- **490 million** children affected by VAD in 2019 (age-standardized incidence rate: 6,955.6 per 100,000)
- **334 million** children and adolescents affected in 165 LMICs
- VAD prevalence in children <5 years: **19.53%** in LMICs
- Moderate VAD (mVAD): **24.54%** prevalence in LMICs
- WHO estimates **250,000–500,000** children become vitamin A deficient

### Annual Deaths
- **~17,374** deaths attributable to VAD in 2021 (down from 188,458 in 1990)
- VAD contributes to **~2% of all under-5 deaths**
- **~500,000** children go blind due to VAD each year; half die within 12 months
- Diarrheal diseases: 64.6% of VAD-attributable deaths (2021)

### Key Risk Groups
- **Children under 5 years**: Highest burden (19.53% prevalence)
- **Children aged 0–5 years**: Highest prevalence and mortality
- **Pregnant women**: Increased requirements
- **Low SDI regions**: 29.67% VAD prevalence vs. 5.17% in high-middle SDI
- **Males**: Higher burden than females (though gap narrowing)
- **Breastfed infants in deficient mothers**

### High-Burden Regions
- **Sub-Saharan Africa**: Highest prevalence (48% of preschool children)
- **Central Sub-Saharan Africa**: Highest ASR (33,739.9 per 100,000)
- **South Asia**: 44% prevalence in preschool children
- **Eastern Sub-Saharan Africa**: High ASR
- **Western Sub-Saharan Africa**: High ASR
- **Cameroon**: Highest national VAD ASR
- **Somalia, Niger**: Among highest national burdens

### Prevention
- Vitamin A supplementation (bi-annual for children 6–59 months)
- Food fortification (cooking oil, sugar, flour)
- Dietary diversification (orange/yellow fruits and vegetables, liver, eggs)
- Breastfeeding promotion
- Immunization programs (measles vaccination reduces VAD risk)
- Biofortification (golden rice, orange-fleshed sweet potato)
- Public health nutrition programs

### Diagnostics
- Serum retinol concentration (<0.70 μmol/L = VAD)
- Conjunctival impression cytology
- Dark adaptation testing (night blindness)
- Clinical examination for xerophthalmia signs
- Dietary assessment
- Breast milk retinol levels

### Treatment
- High-dose vitamin A supplementation (100,000 IU for infants 6–11 months; 200,000 IU for children 12–59 months)
- Treatment of xerophthalmia (oral or intramuscular vitamin A)
- Management of underlying infections (diarrhea, measles)
- Dietary improvement
- Nutritional rehabilitation
- Follow-up care

### 5 Key Facts
1. VAD is the **leading cause of preventable childhood blindness** and increases mortality risk from common infections (WHO)
2. **250,000–500,000** children become blind from VAD annually; **half die within 12 months** (WHO)
3. Vitamin A supplementation can **reduce all-cause child mortality by 12–24%** (UNICEF, 2023)
4. VAD-related deaths declined **91%** from 188,458 (1990) to 17,374 (2021) (GBD 2021)
5. In 2023, **75%** of targeted children received two high-dose vitamin A supplements (UNICEF, 2023)

### Source URLs
- https://www.who.int/data/nutrition/nlis/info/vitamin-a-deficiency
- https://www.who.int/publications/i/item/WHO-NUT-95.3
- https://data.unicef.org/topic/nutrition/vitamin-a-deficiency/
- https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1689903/full
- https://jogh.org/2023/jogh-13-04084/

---

*Research compiled from WHO, GBD (2019–2023), Lancet, JAMA, Frontiers, and peer-reviewed medical literature. All data are from 2019–2024 sources where available.*
