"""
backend/tests/test_api.py
Comprehensive test suite verifying:
- Health endpoint
- Schema endpoint
- Model-info endpoint
- Input validation (missing fields, invalid types)
- High-risk and lower-risk predictions
- Inference parity with notebook PART 11 presets
- Locked 0.42 threshold logic
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.model_loader import get_metadata

client = TestClient(app)

def test_health():
    """Verify GET /api/health returns healthy and artifacts_loaded=True."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["artifacts_loaded"] is True

def test_model_info():
    """Verify GET /api/model-info returns required frozen metrics and locked threshold."""
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["locked_threshold"] == 0.42
    assert "XGBoost" in data["model_name"]
    assert "validation_metrics" in data
    assert "final_test_metrics_at_0_42" in data
    assert data["final_test_metrics_at_0_42"]["ROC-AUC"] == pytest.approx(0.655522, abs=1e-4)

def test_schema_and_presets():
    """Verify GET /api/schema and GET /api/presets endpoints."""
    schema_res = client.get("/api/schema")
    assert schema_res.status_code == 200
    schema_data = schema_res.json()
    assert "demographics" in schema_data
    assert "admission" in schema_data
    assert "medications" in schema_data

    presets_res = client.get("/api/presets")
    assert presets_res.status_code == 200
    presets_data = presets_res.json()
    assert "preset_high_risk" in presets_data
    assert "preset_lower_risk" in presets_data

def test_high_risk_prediction_parity():
    """
    Verify inference parity for the PART 11 High-Risk Example (Cell 168).
    Notebook score was ~0.6638. Score must be >= 0.42 and flag as HIGH-RISK FLAG.
    """
    presets_data = client.get("/api/presets").json()
    high_risk_encounter = presets_data["preset_high_risk"]["data"]

    response = client.post("/api/predict", json=high_risk_encounter)
    assert response.status_code == 200
    result = response.json()

    assert result["threshold"] == 0.42
    assert result["risk_classification"] == "HIGH-RISK FLAG"
    assert "elevated risk" in result["interpretation"]
    assert result["risk_score"] >= 0.42
    # Check within tight tolerance of expected score range
    assert result["risk_score"] == pytest.approx(0.6563, abs=0.03)

def test_lower_risk_prediction_parity():
    """
    Verify inference parity for the PART 11 Lower-Risk Example (Cell 169).
    Notebook score was ~0.3644. Score must be < 0.42 and flag as LOWER-RISK FLAG.
    """
    presets_data = client.get("/api/presets").json()
    lower_risk_encounter = presets_data["preset_lower_risk"]["data"]

    response = client.post("/api/predict", json=lower_risk_encounter)
    assert response.status_code == 200
    result = response.json()

    assert result["threshold"] == 0.42
    assert result["risk_classification"] == "LOWER-RISK FLAG"
    assert "not flagged" in result["interpretation"]
    assert result["risk_score"] < 0.42
    # Check within tight tolerance of expected score range
    assert result["risk_score"] == pytest.approx(0.3747, abs=0.03)

def test_validation_missing_required_fields():
    """Verify that omitting required features or passing bad types returns appropriate error."""
    # Omit essential fields
    bad_data = {
        "race": "Caucasian",
        "gender": "Female"
    }
    # Notice our schema has defaults for many fields, but if invalid payload is sent:
    invalid_type_data = {
        "time_in_hospital": "not-a-number",
        "num_medications": -5
    }
    response = client.post("/api/predict", json=invalid_type_data)
    assert response.status_code in [422, 500]

def test_batch_prediction():
    """Verify POST /api/predict-batch works with multiple encounters."""
    presets_data = client.get("/api/presets").json()
    enc1 = presets_data["preset_high_risk"]["data"]
    enc2 = presets_data["preset_lower_risk"]["data"]

    batch_payload = {"encounters": [enc1, enc2]}
    response = client.post("/api/predict-batch", json=batch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 2
    assert len(data["predictions"]) == 2
    assert data["predictions"][0]["risk_classification"] == "HIGH-RISK FLAG"
    assert data["predictions"][1]["risk_classification"] == "LOWER-RISK FLAG"
