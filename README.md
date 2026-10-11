# Diabetes Readmission Risk Planner

**30-Day Hospital Readmission Risk Screening and Medication Pattern Insights**  
*IT3091 Machine Learning University Project · Academic Year 2026 · Group 2026-DS-61*

> **Disclaimer:** *For educational and research demonstration only. Not validated for clinical deployment.*

---

## 1. Project Overview & Clinical Context

Hospital readmission within 30 days after discharge is an adverse clinical event and a significant driver of healthcare costs. This project utilizes the **Diabetes 130-US Hospitals (1999–2008)** dataset (101,766 inpatient encounters across 71,518 unique patients) to address two core lenses:

1. **Primary Lens (Predictive):** Binary risk classification of whether a diabetic inpatient encounter will be followed by readmission within 30 days after discharge (`readmit_30`: 1 = `<30`, 0 = `>30` or `NO`).
2. **Secondary Lens (Observational Analytics):** Analysis of medication and treatment patterns (`insulin`, `change`, `diabetesMed`, and polypharmacy burden) associated with readmission risk.

### Core Model & Decision Threshold
- **Selected Model:** XGBoost (Hist gradient boosting, candidate 4).
- **Selection Criterion:** Validation PR-AUC (Precision-Recall Area Under Curve = **0.189940**).
- **Locked Operating Threshold:** **0.42** (Selected on validation data by maximizing **F2-Score = 0.4009** for recall-oriented screening).
- **Held-Out Test Set Performance (N = 15,219 encounters at threshold 0.42):**
  - **ROC-AUC:** 0.655522
  - **PR-AUC:** 0.209902
  - **Precision:** 0.140958
  - **Recall:** 0.782738 (78.3% of true `<30` readmissions detected)
  - **F1-Score:** 0.238895
  - **F2-Score:** 0.409683
  - **Balanced Accuracy:** 0.595409
  - **Confusion Matrix:** True Negatives: 5,525 | False Positives: 8,014 | False Negatives: 365 | True Positives: 1,315

---

## 2. Repository Structure

```text
Diabetes-Readmission-App/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application & REST endpoints
│   │   ├── inference.py             # Inference pipeline reproducing Part 11
│   │   ├── feature_engineering.py   # Deterministic feature engineering (Section 13)
│   │   ├── model_loader.py          # Safe artifact loading & caching
│   │   └── schemas.py               # Pydantic validation schemas
│   ├── artifacts/                   # Serialized ML artifacts
│   │   ├── best_xgboost_model.joblib
│   │   ├── best_xgboost_model.json
│   │   ├── tree_preprocessor.joblib
│   │   └── model_metadata.json
│   ├── tests/
│   │   └── test_api.py              # Automated parity & validation test suite
│   ├── requirements.txt             # Python backend dependencies
│   └── .env.example                 # Backend environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # App header, tab navigation, engine status
│   │   │   ├── DisclaimerBanner.tsx # Academic disclaimer notice
│   │   │   └── RiskResultCard.tsx   # Risk score gauge, interpretation & action
│   │   ├── pages/
│   │   │   ├── EncounterPredictionView.tsx # View 1: 43-field form with presets
│   │   │   ├── ModelPerformanceView.tsx    # View 2: 4-model comparison & curves
│   │   │   ├── MedicationInsightsView.tsx  # View 3: Secondary medication analysis
│   │   │   └── AboutProjectView.tsx        # View 4: Architecture, methodology & group
│   │   ├── services/
│   │   │   └── api.ts               # Type-safe API client
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces for 43 predictors & metrics
│   │   ├── App.tsx                  # Root layout & view controller
│   │   └── index.css                # Dark-theme Tailwind design system
│   ├── package.json
│   ├── vite.config.ts               # Vite configuration with /api backend proxy
│   └── .env.example                 # Frontend environment variable template
│
├── scripts/
│   └── export_model.py              # Local artifact export & verification script
│
├── diabetic_data.csv                # Primary encounter dataset
├── IDS_mapping.csv                  # Hospital admission/discharge mapping tables
├── IT3091_Diabetes_Readmission_Project.ipynb # Final master Jupyter Notebook
└── README.md
```

---

## 3. Google Colab One-Time Export Code

If you wish to export the exact in-memory fitted objects directly from your completed Google Colab notebook run, append and execute this single code cell at the very end of your Colab notebook:

```python
# ==============================================================================
# ONE-TIME ARTIFACT EXPORT FOR FASTAPI DEPLOYMENT (Run in Google Colab)
# ==============================================================================
import os
import json
import zipfile
import joblib
from google.colab import files

export_dir = "exported_artifacts"
os.makedirs(export_dir, exist_ok=True)

# 1. Save fitted tree preprocessor
preprocessor_path = os.path.join(export_dir, "tree_preprocessor.joblib")
joblib.dump(tree_preprocessor, preprocessor_path)
print("Saved tree_preprocessor.joblib")

# 2. Save fitted XGBoost model (joblib and native JSON)
model_joblib_path = os.path.join(export_dir, "best_xgboost_model.joblib")
model_json_path = os.path.join(export_dir, "best_xgboost_model.json")
joblib.dump(best_xgboost_model, model_joblib_path)
best_xgboost_model.save_model(model_json_path)
print("Saved best_xgboost_model.joblib and best_xgboost_model.json")

# 3. Save comprehensive metadata
metadata = {
    "model_name": "XGBoost (Candidate 4)",
    "project_title": "Diabetes 30-Day Hospital Readmission Risk Prediction",
    "group": "2026-DS-61",
    "locked_threshold": 0.42,
    "selection_criterion": "Validation PR-AUC",
    "threshold_selection_rule": "Maximum Validation F2",
    "random_state": 42,
    "raw_predictor_columns": RAW_PREDICTOR_COLUMNS,
    "new_input_numeric_columns": NEW_INPUT_NUMERIC_COLUMNS,
    "diabetes_medication_columns": DIABETES_MEDICATION_COLUMNS,
    "model_columns": list(X_train_model.columns),
    "presets": {
        "preset_high_risk": {
            "name": "High-Risk Encounter (PART 11 Example 1)",
            "expected_score": 0.663788,
            "data": new_encounter  # From Cell 168
        }
    }
}

metadata_path = os.path.join(export_dir, "model_metadata.json")
with open(metadata_path, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
print("Saved model_metadata.json")

# 4. Package into ZIP and trigger download
zip_path = "diabetes_readmission_artifacts.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
    for f in os.listdir(export_dir):
        zipf.write(os.path.join(export_dir, f), arcname=f)

print("Export complete! Downloading artifacts zip...")
files.download(zip_path)
```

Unzip the downloaded `diabetes_readmission_artifacts.zip` directly into the `backend/artifacts/` folder of this repository.

*(Note: We have also included `scripts/export_model.py`, which regenerates identical artifacts locally from `diabetic_data.csv`.)*

---

## 4. Prerequisites

- **Python:** 3.10 to 3.13
- **Node.js:** v18.0.0 or later (v22.x recommended)
- **Package Managers:** `pip` and `npm`

---

## 5. Local Setup & Execution

### A. Backend Setup
1. Open a terminal in the project root:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the automated parity and verification test suite:
   ```bash
   python -m pytest tests/test_api.py -v
   ```
   *Expected output: 7 passed.*
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *Interactive API Swagger documentation is available at `http://127.0.0.1:8000/docs`.*

### B. Frontend Setup
1. Open a second terminal window:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Verify production compilation:
   ```bash
   npm run build
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:5173`. The application will automatically connect to the backend via Vite's configured proxy.

---

## 6. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and verification of loaded ML artifacts |
| `GET` | `/api/model-info` | Frozen model specifications, validation metrics, and test metrics |
| `GET` | `/api/schema` | Accepted categorical values, numerical ranges, and field definitions |
| `GET` | `/api/presets` | PART 11 benchmark encounters (High-Risk & Lower-Risk examples) |
| `GET` | `/api/medication-insights` | Training-set secondary analysis findings & statistical test outputs |
| `POST` | `/api/predict` | Single encounter inference endpoint returning risk score and classification |
| `POST` | `/api/predict-batch` | Batch encounter inference endpoint |

### Example Inference Request
`POST /api/predict`
```json
{
  "race": "Caucasian",
  "gender": "Female",
  "age": "[70-80)",
  "admission_type_id": 1,
  "admission_source_id": 7,
  "time_in_hospital": 5,
  "payer_code": "MC",
  "medical_specialty": "InternalMedicine",
  "num_lab_procedures": 55,
  "num_procedures": 1,
  "num_medications": 18,
  "number_outpatient": 1,
  "number_emergency": 1,
  "number_inpatient": 2,
  "diag_1": "250.6",
  "diag_2": "401",
  "diag_3": "428",
  "number_diagnoses": 8,
  "max_glu_serum": "None",
  "A1Cresult": ">8",
  "metformin": "Steady",
  "repaglinide": "No",
  "nateglinide": "No",
  "chlorpropamide": "No",
  "glimepiride": "No",
  "acetohexamide": "No",
  "glipizide": "No",
  "glyburide": "No",
  "tolbutamide": "No",
  "pioglitazone": "No",
  "rosiglitazone": "No",
  "acarbose": "No",
  "miglitol": "No",
  "troglitazone": "No",
  "tolazamide": "No",
  "insulin": "Up",
  "glyburide-metformin": "No",
  "glipizide-metformin": "No",
  "glimepiride-pioglitazone": "No",
  "metformin-rosiglitazone": "No",
  "metformin-pioglitazone": "No",
  "change": "Ch",
  "diabetesMed": "Yes"
}
```

### Example Inference Response
```json
{
  "risk_score": 0.6563,
  "threshold": 0.42,
  "risk_classification": "HIGH-RISK FLAG",
  "interpretation": "This encounter is flagged as having elevated risk of readmission within 30 days after discharge.",
  "recommended_action": "Consider additional clinical review and appropriate follow-up planning."
}
```

---

## 7. Cloud Deployment Guide

### A. Deploy Python Backend to Render
1. Push this repository to GitHub.
2. In the Render Dashboard, create a **New Web Service** connected to your repo.
3. Configure the service settings:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variable:
   - `ALLOWED_ORIGINS`: `https://your-frontend-app.vercel.app` (or `*` during initial testing)
5. Deploy. Render will provide an HTTPS endpoint (e.g. `https://diabetes-readmission-api.onrender.com`).

### B. Deploy React Frontend to Vercel
1. In Vercel, import your GitHub repository.
2. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
3. Under **Environment Variables**, set:
   - `VITE_API_BASE_URL`: `https://diabetes-readmission-api.onrender.com` (Your Render backend URL)
4. Click **Deploy**. Vercel will build and host your production React application.

---

## 8. Responsible AI & Limitations

- **Observational Associations Only:** Medication pattern findings reflect disease severity, acute comorbidity, and treatment adjustment rather than causal clinical impact.
- **Decision Support:** Designed strictly for educational exploration and research screening. It does not replace clinical judgment or establish clinical treatment rules.
- **Uncalibrated Probability:** The output score is an uncalibrated ranking metric optimized for recall-oriented screening at threshold 0.42.
