"""
backend/app/inference.py
Inference engine reproducing Part 11 predict_new_encounter() logic.
"""

from typing import Any, Dict, List, Union
import numpy as np
import pandas as pd
from app.feature_engineering import engineer_features
from app.model_loader import get_model, get_preprocessor, get_metadata

LOCKED_XGB_THRESHOLD = 0.42

def run_pipeline(encounters_df: pd.DataFrame) -> np.ndarray:
    """
    Core inference pipeline matching notebook cell 166:
    1. Verify raw predictor columns
    2. Order raw columns
    3. Replace '?' with np.nan
    4. Convert numeric source columns to numeric
    5. engineer_features()
    6. Reindex to training feature schema
    7. preprocessor.transform()
    8. model.predict_proba()[:, 1]
    """
    preprocessor = get_preprocessor()
    model = get_model()
    metadata = get_metadata()

    raw_columns = metadata["raw_predictor_columns"]
    numeric_columns = metadata["new_input_numeric_columns"]
    model_columns = metadata["model_columns"]

    # Handle alias renaming if input came with hyphenated or underscore names
    df = encounters_df.copy()
    alias_mapping = {
        "glyburide_metformin": "glyburide-metformin",
        "glipizide_metformin": "glipizide-metformin",
        "glimepiride_pioglitazone": "glimepiride-pioglitazone",
        "metformin_rosiglitazone": "metformin-rosiglitazone",
        "metformin_pioglitazone": "metformin-pioglitazone"
    }
    for old_col, new_col in alias_mapping.items():
        if old_col in df.columns and new_col not in df.columns:
            df[new_col] = df[old_col]

    missing = [c for c in raw_columns if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required raw predictor columns: {', '.join(missing)}")

    # 1. Reorder to raw predictor columns
    new_raw = df[raw_columns].copy()

    # 2. Convert explicit missing marker
    new_raw = new_raw.replace("?", np.nan)

    # 3. Numeric normalization
    for col in numeric_columns:
        new_raw[col] = pd.to_numeric(new_raw[col], errors="coerce")

    # 4. Feature engineering
    new_engineered = engineer_features(new_raw)

    # 5. Reindex to model training feature schema
    new_engineered = new_engineered.reindex(columns=model_columns)

    # 6. Transform using fitted preprocessor
    new_xgb = preprocessor.transform(new_engineered)

    # 7. Model predict_proba
    probabilities = model.predict_proba(new_xgb)[:, 1]
    return probabilities

def format_prediction_result(score: float, threshold: float = LOCKED_XGB_THRESHOLD) -> Dict[str, Any]:
    high_risk = score >= threshold
    return {
        "risk_score": round(float(score), 4),
        "threshold": float(threshold),
        "risk_classification": "HIGH-RISK FLAG" if high_risk else "LOWER-RISK FLAG",
        "interpretation": (
            "This encounter is flagged as having elevated risk of readmission within 30 days after discharge."
            if high_risk else
            "This encounter is not flagged as having elevated risk of readmission within 30 days after discharge at the locked 0.42 threshold."
        ),
        "recommended_action": (
            "Consider additional clinical review and appropriate follow-up planning."
            if high_risk else
            "Continue usual clinical assessment and follow-up as appropriate. A lower-risk flag does not guarantee that readmission will not occur."
        )
    }

def predict_single(encounter_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Perform inference for a single encounter dictionary."""
    df = pd.DataFrame([encounter_dict])
    scores = run_pipeline(df)
    return format_prediction_result(scores[0])

def predict_batch(encounters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Perform inference for multiple encounters in batch."""
    if not encounters:
        return []
    df = pd.DataFrame(encounters)
    scores = run_pipeline(df)
    return [format_prediction_result(s) for s in scores]
