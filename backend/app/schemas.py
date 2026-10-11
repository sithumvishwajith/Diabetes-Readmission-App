"""
backend/app/schemas.py
Pydantic schemas for the Diabetes Readmission Prediction API.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict

class EncounterInput(BaseModel):
    """
    Complete clinical and administrative input representing one inpatient encounter.
    All 43 raw predictors required by the notebook inference pipeline are present.
    """
    model_config = ConfigDict(extra="ignore")

    # A. Patient Demographics
    race: str = Field(
        default="Caucasian",
        description="Patient reported race (Caucasian, AfricanAmerican, Asian, Hispanic, Other, ?)"
    )
    gender: str = Field(
        default="Female",
        description="Patient recorded gender (Female, Male, Unknown/Invalid)"
    )
    age: str = Field(
        default="[70-80)",
        description="Age decade bracket, e.g. [50-60), [60-70), [70-80)"
    )

    # B. Hospital Admission
    admission_type_id: Union[int, float] = Field(
        default=1,
        description="Integer identifier for admission type (1=Emergency, 2=Urgent, 3=Elective, etc.)"
    )
    admission_source_id: Union[int, float] = Field(
        default=7,
        description="Integer identifier for admission source (1=Physician Referral, 7=Emergency Room, etc.)"
    )
    time_in_hospital: Union[int, float] = Field(
        default=4,
        ge=1,
        le=14,
        description="Length of hospital stay in days (integer 1-14)"
    )
    payer_code: str = Field(
        default="MC",
        description="Payer code (e.g. MC, MD, HM, BC, SP, CP, ?, etc.)"
    )
    medical_specialty: str = Field(
        default="InternalMedicine",
        description="Admitting medical specialty (e.g. InternalMedicine, Cardiology, Family/GeneralPractice, ?, etc.)"
    )

    # C. Medical Utilization
    num_lab_procedures: Union[int, float] = Field(
        default=44,
        ge=1,
        le=150,
        description="Total number of lab tests performed during encounter"
    )
    num_procedures: Union[int, float] = Field(
        default=1,
        ge=0,
        le=10,
        description="Number of non-lab medical/surgical procedures performed"
    )
    num_medications: Union[int, float] = Field(
        default=15,
        ge=1,
        le=100,
        description="Total distinct medications administered during encounter"
    )
    number_outpatient: Union[int, float] = Field(
        default=0,
        ge=0,
        description="Number of outpatient visits in the preceding year"
    )
    number_emergency: Union[int, float] = Field(
        default=0,
        ge=0,
        description="Number of emergency visits in the preceding year"
    )
    number_inpatient: Union[int, float] = Field(
        default=0,
        ge=0,
        description="Number of inpatient stays in the preceding year"
    )

    # D. Diagnoses and Clinical Information
    diag_1: str = Field(
        default="250.6",
        description="Primary ICD-9 diagnosis code or group (e.g. 250.6, 401, 428, V-code, E-code)"
    )
    diag_2: str = Field(
        default="401",
        description="Secondary ICD-9 diagnosis code (e.g. 401, 428, 250.0)"
    )
    diag_3: str = Field(
        default="428",
        description="Tertiary ICD-9 diagnosis code (e.g. 428, 276, 414)"
    )
    number_diagnoses: Union[int, float] = Field(
        default=8,
        ge=1,
        le=16,
        description="Total number of diagnoses entered in patient chart"
    )
    max_glu_serum: str = Field(
        default="None",
        description="Maximum glucose serum test result (None, Norm, >200, >300)"
    )
    A1Cresult: str = Field(
        default="None",
        description="Hemoglobin A1c test result (None, Norm, >7, >8)"
    )

    # E. Diabetes Medication and Treatment (23 medications + change + diabetesMed)
    metformin: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    repaglinide: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    nateglinide: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    chlorpropamide: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    glimepiride: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    acetohexamide: str = Field(default="No", description="Dose status (No, Steady)")
    glipizide: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    glyburide: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    tolbutamide: str = Field(default="No", description="Dose status (No, Steady)")
    pioglitazone: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    rosiglitazone: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    acarbose: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    miglitol: str = Field(default="No", description="Dose status (No, Steady, Up, Down)")
    troglitazone: str = Field(default="No", description="Dose status (No, Steady)")
    tolazamide: str = Field(default="No", description="Dose status (No, Steady, Up)")
    insulin: str = Field(default="No", description="Insulin status (No, Steady, Up, Down)")
    glyburide_metformin: str = Field(default="No", alias="glyburide-metformin", description="Dose status (No, Steady, Up, Down)")
    glipizide_metformin: str = Field(default="No", alias="glipizide-metformin", description="Dose status (No, Steady)")
    glimepiride_pioglitazone: str = Field(default="No", alias="glimepiride-pioglitazone", description="Dose status (No, Steady)")
    metformin_rosiglitazone: str = Field(default="No", alias="metformin-rosiglitazone", description="Dose status (No, Steady)")
    metformin_pioglitazone: str = Field(default="No", alias="metformin-pioglitazone", description="Dose status (No, Steady)")
    change: str = Field(
        default="No",
        description="Whether diabetes medication was changed/adjusted during stay ('Ch' or 'No')"
    )
    diabetesMed: str = Field(
        default="Yes",
        description="Whether patient was prescribed any diabetic medication ('Yes' or 'No')"
    )

class PredictionResponse(BaseModel):
    """Prediction output matching Part 11 requirements."""
    risk_score: float = Field(..., description="Continuous XGBoost model predicted probability (0.0 to 1.0)")
    threshold: float = Field(default=0.42, description="Locked validation-selected decision threshold (0.42)")
    risk_classification: str = Field(..., description="'HIGH-RISK FLAG' or 'LOWER-RISK FLAG'")
    interpretation: str = Field(..., description="Clinical context interpretation of the score")
    recommended_action: str = Field(..., description="Actionable follow-up recommendation")

class BatchPredictionRequest(BaseModel):
    encounters: List[EncounterInput]

class BatchPredictionResponse(BaseModel):
    count: int
    predictions: List[PredictionResponse]

class HealthResponse(BaseModel):
    status: str
    artifacts_loaded: bool
    version: str = "1.0.0"

class ModelInfoResponse(BaseModel):
    model_name: str
    project_title: str
    group: str
    locked_threshold: float
    selection_criterion: str
    threshold_selection_rule: str
    validation_metrics: Dict[str, Any]
    final_test_metrics_at_0_42: Dict[str, Any]
    hyperparameters: Dict[str, Any]
    feature_count_raw: int
    feature_count_model: int
