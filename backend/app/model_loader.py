"""
backend/app/model_loader.py
Model artifact loader for frozen preprocessor and XGBoost model.
"""

import os
import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import joblib
from xgboost import XGBClassifier

logger = logging.getLogger("diabetes_app.model_loader")

# Base directory for artifacts
BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = Path(os.getenv("ARTIFACTS_DIR", str(BASE_DIR / "artifacts")))

_preprocessor = None
_model = None
_metadata: Optional[Dict[str, Any]] = None

def get_artifacts_dir() -> Path:
    return ARTIFACTS_DIR

def load_artifacts() -> Tuple[Any, Any, Dict[str, Any]]:
    """
    Load preprocessor, XGBoost model, and metadata from disk.
    Cached in memory after initial load.
    """
    global _preprocessor, _model, _metadata

    if _preprocessor is not None and _model is not None and _metadata is not None:
        return _preprocessor, _model, _metadata

    artifacts_path = get_artifacts_dir()
    if not artifacts_path.exists():
        raise FileNotFoundError(
            f"Artifacts directory not found: {artifacts_path}. "
            "Please ensure model artifacts are placed in this directory or run scripts/export_model.py."
        )

    # 1. Load Metadata
    metadata_path = artifacts_path / "model_metadata.json"
    if not metadata_path.exists():
        raise FileNotFoundError(f"Model metadata not found at: {metadata_path}")

    with open(metadata_path, "r", encoding="utf-8") as f:
        _metadata = json.load(f)

    # 2. Load Preprocessor
    preprocessor_path = artifacts_path / "tree_preprocessor.joblib"
    if not preprocessor_path.exists():
        raise FileNotFoundError(f"Fitted preprocessor not found at: {preprocessor_path}")

    logger.info("Loading fitted tree preprocessor from %s", preprocessor_path)
    _preprocessor = joblib.load(preprocessor_path)

    # 3. Load XGBoost Model
    joblib_model_path = artifacts_path / "best_xgboost_model.joblib"
    json_model_path = artifacts_path / "best_xgboost_model.json"

    if joblib_model_path.exists():
        logger.info("Loading fitted XGBoost model from %s", joblib_model_path)
        _model = joblib.load(joblib_model_path)
    elif json_model_path.exists():
        logger.info("Loading XGBoost booster from native JSON %s", json_model_path)
        clf = XGBClassifier()
        clf.load_model(str(json_model_path))
        _model = clf
    else:
        raise FileNotFoundError(
            f"Fitted XGBoost model not found at {joblib_model_path} or {json_model_path}"
        )

    logger.info("Successfully loaded all ML artifacts.")
    return _preprocessor, _model, _metadata

def get_preprocessor():
    p, _, _ = load_artifacts()
    return p

def get_model():
    _, m, _ = load_artifacts()
    return m

def get_metadata() -> Dict[str, Any]:
    _, _, meta = load_artifacts()
    return meta

def are_artifacts_loaded() -> bool:
    try:
        load_artifacts()
        return True
    except Exception as e:
        logger.warning("Artifacts could not be loaded: %s", e)
        return False
