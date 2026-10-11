"""
backend/app/main.py
FastAPI application for Diabetes Readmission Risk Planner.
"""

import os
import logging
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    EncounterInput,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    HealthResponse,
    ModelInfoResponse
)
from app.inference import predict_single, predict_batch
from app.model_loader import are_artifacts_loaded, get_metadata, load_artifacts

from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("diabetes_app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_artifacts()
        logger.info("Application startup: ML artifacts loaded successfully.")
    except Exception as e:
        logger.error("Application startup: Failed to load ML artifacts: %s", e)
    yield

app = FastAPI(
    title="Diabetes Readmission Risk Planner API",
    description="30-Day Hospital Readmission Risk Screening and Medication Pattern Insights (Group 2026-DS-61)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint indicating service and model readiness."""
    artifacts_ready = are_artifacts_loaded()
    return HealthResponse(
        status="healthy" if artifacts_ready else "degraded",
        artifacts_loaded=artifacts_ready,
        version="1.0.0"
    )

@app.get("/api/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """Returns model metadata, hyperparams, and frozen historical metrics."""
    try:
        meta = get_metadata()
        return ModelInfoResponse(
            model_name=meta.get("model_name", "XGBoost (Candidate 4)"),
            project_title=meta.get("project_title", "Diabetes 30-Day Hospital Readmission Risk Prediction"),
            group=meta.get("group", "2026-DS-61"),
            locked_threshold=meta.get("locked_threshold", 0.42),
            selection_criterion=meta.get("selection_criterion", "Validation PR-AUC"),
            threshold_selection_rule=meta.get("threshold_selection_rule", "Maximum Validation F2"),
            validation_metrics=meta.get("validation_metrics", {}),
            final_test_metrics_at_0_42=meta.get("final_test_metrics_at_0_42", {}),
            hyperparameters=meta.get("hyperparameters", {}),
            feature_count_raw=len(meta.get("raw_predictor_columns", [])),
            feature_count_model=len(meta.get("model_columns", []))
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to read model metadata: {str(e)}"
        )

@app.get("/api/presets")
def get_presets():
    """Returns preset example encounters from the notebook."""
    try:
        meta = get_metadata()
        return meta.get("presets", {})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to load presets: {str(e)}"
        )

@app.get("/api/schema")
def get_schema():
    """Returns accepted categories and numeric field ranges for UI form creation."""
    return {
        "demographics": {
            "race": ["Caucasian", "AfricanAmerican", "Asian", "Hispanic", "Other", "?"],
            "gender": ["Female", "Male", "Unknown/Invalid"],
            "age": ["[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)", "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"]
        },
        "admission": {
            "admission_type_id": [
                {"id": 1, "label": "Emergency (1)"},
                {"id": 2, "label": "Urgent (2)"},
                {"id": 3, "label": "Elective (3)"},
                {"id": 4, "label": "Newborn (4)"},
                {"id": 5, "label": "Not Available (5)"},
                {"id": 6, "label": "NULL (6)"},
                {"id": 7, "label": "Trauma Center (7)"},
                {"id": 8, "label": "Not Mapped (8)"}
            ],
            "admission_source_id": [
                {"id": 1, "label": "Physician Referral (1)"},
                {"id": 2, "label": "Clinic Referral (2)"},
                {"id": 3, "label": "HMO Referral (3)"},
                {"id": 4, "label": "Transfer from a hospital (4)"},
                {"id": 5, "label": "Transfer from SNF (5)"},
                {"id": 6, "label": "Transfer from another health care facility (6)"},
                {"id": 7, "label": "Emergency Room (7)"},
                {"id": 8, "label": "Court/Law Enforcement (8)"},
                {"id": 9, "label": "Not Available (9)"},
                {"id": 10, "label": "Transfer from critical access hospital (10)"},
                {"id": 17, "label": "NULL (17)"},
                {"id": 20, "label": "Not Mapped (20)"}
            ],
            "payer_code": ["MC", "MD", "HM", "BC", "SP", "CP", "UN", "CM", "OG", "PO", "DM", "WC", "CH", "MP", "OT", "SI", "FR", "?"],
            "medical_specialty": [
                "InternalMedicine", "Cardiology", "Family/GeneralPractice", "Emergency/Trauma",
                "Surgery-General", "Orthopedics", "Nephrology", "Pulmonology", "Psychiatry",
                "Radiologist", "Urology", "Gastroenterology", "Endocrinology", "Neurology",
                "Hematology/Oncology", "Pediatrics", "Other", "?"
            ]
        },
        "lab_results": {
            "max_glu_serum": ["None", "Norm", ">200", ">300"],
            "A1Cresult": ["None", "Norm", ">7", ">8"]
        },
        "medications": {
            "dose_options_4": ["No", "Steady", "Up", "Down"],
            "dose_options_2": ["No", "Steady"],
            "change_options": ["Ch", "No"],
            "diabetes_med_options": ["Yes", "No"]
        }
    }

@app.get("/api/medication-insights")
def get_medication_insights():
    """Returns the descriptive medication and treatment pattern findings from Part 5."""
    return {
        "insulin_status": {
            "title": "Insulin Status vs 30-Day Readmission",
            "rates": [
                {"category": "No", "count": 33227, "readmit_rate_pct": 9.96},
                {"category": "Steady", "count": 21723, "readmit_rate_pct": 11.25},
                {"category": "Up", "count": 7997, "readmit_rate_pct": 13.18},
                {"category": "Down", "count": 8573, "readmit_rate_pct": 14.15}
            ],
            "statistics": {
                "test": "Chi-square Test of Independence",
                "chi2": 157.566,
                "dof": 3,
                "p_value": "6.14e-34",
                "cramers_v": 0.0469,
                "interpretation": "Statistically significant association but very weak effect size (Cramer's V < 0.1). Patients requiring dose changes (Down/Up) exhibited higher readmission rates, reflecting higher glycemic instability/complexity."
            }
        },
        "medication_change": {
            "title": "Medication Change ('change') vs 30-Day Readmission",
            "rates": [
                {"category": "No", "count": 38519, "readmit_rate_pct": 10.67},
                {"category": "Changed (Ch)", "count": 33001, "readmit_rate_pct": 11.85}
            ],
            "statistics": {
                "test": "Chi-square Test of Independence",
                "chi2": 25.019,
                "dof": 1,
                "p_value": "5.68e-07",
                "cramers_v": 0.0187,
                "odds_ratio": 1.126,
                "ci_95": "1.075–1.180",
                "interpretation": "Statistically significant slight increase in readmission among patients with active medication adjustments (11.85% vs 10.67%). Association is weak (V = 0.019)."
            }
        },
        "diabetes_medication": {
            "title": "Diabetes Medication Prescribed ('diabetesMed') vs 30-Day Readmission",
            "rates": [
                {"category": "No", "count": 16407, "readmit_rate_pct": 9.52},
                {"category": "Yes", "count": 55113, "readmit_rate_pct": 11.72}
            ],
            "statistics": {
                "test": "Chi-square Test of Independence",
                "chi2": 61.192,
                "dof": 1,
                "p_value": "5.18e-15",
                "cramers_v": 0.0293,
                "odds_ratio": 1.262,
                "ci_95": "1.190–1.337",
                "interpretation": "Patients receiving diabetes medication during admission had an 11.72% readmission rate compared to 9.52% for those not on diabetes medications."
            }
        },
        "medication_burden": {
            "title": "Total Medication Count Burden vs 30-Day Readmission",
            "rates": [
                {"category": "0–10 meds", "count": 18200, "readmit_rate_pct": 9.20},
                {"category": "11–20 meds", "count": 36608, "readmit_rate_pct": 11.50},
                {"category": "21–30 meds", "count": 13034, "readmit_rate_pct": 12.94},
                {"category": "31+ meds", "count": 3678, "readmit_rate_pct": 12.26}
            ],
            "statistics": {
                "test": "Mann–Whitney U & Spearman correlation",
                "p_value": "2.43e-30",
                "rank_biserial": 0.0782,
                "spearman_rho": 0.0428,
                "interpretation": "Patients who were readmitted took slightly more medications on average (mean 16.8 vs 15.9), reflecting overall patient comorbidity burden."
            }
        },
        "disclaimer": "These findings are observational training-set descriptive analyses. They reflect associations and illness severity confounding, NOT causal treatment effects or medical instructions."
    }

@app.post("/api/predict", response_model=PredictionResponse)
def predict_encounter(encounter: EncounterInput):
    """
    Main inference endpoint:
    Accepts raw encounter, applies feature engineering, transforms via fitted preprocessor,
    and returns XGBoost risk score and locked 0.42 threshold classification.
    """
    try:
        data_dict = encounter.model_dump(by_alias=True)
        result = predict_single(data_dict)
        return PredictionResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        logger.exception("Inference error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Inference failed: {str(e)}")

@app.post("/api/predict-batch", response_model=BatchPredictionResponse)
def predict_encounters_batch(payload: BatchPredictionRequest):
    """Optional batch inference endpoint."""
    try:
        encounters_list = [enc.model_dump(by_alias=True) for enc in payload.encounters]
        results = predict_batch(encounters_list)
        return BatchPredictionResponse(
            count=len(results),
            predictions=[PredictionResponse(**r) for r in results]
        )
    except Exception as e:
        logger.exception("Batch inference error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Batch inference failed: {str(e)}")
