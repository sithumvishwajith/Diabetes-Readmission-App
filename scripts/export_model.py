"""
scripts/export_model.py
Export script to train/export the exact notebook XGBoost inference pipeline
from diabetic_data.csv and save all artifacts into backend/artifacts/.
"""

import os
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "diabetic_data.csv"
ARTIFACTS_DIR = BASE_DIR / "backend" / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42
LOCKED_XGB_THRESHOLD = 0.42

NUMERIC_SOURCE_COLUMNS = [
    "encounter_id", "patient_nbr",
    "admission_type_id", "discharge_disposition_id", "admission_source_id",
    "time_in_hospital", "num_lab_procedures", "num_procedures",
    "num_medications", "number_outpatient", "number_emergency",
    "number_inpatient", "number_diagnoses"
]

DROP_FROM_PREDICTORS = [
    "readmitted",
    "readmit_30",
    "encounter_id",
    "patient_nbr",
    "discharge_disposition_id",
    "weight",
    "examide",
    "citoglipton",
]

DIABETES_MEDICATION_COLUMNS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide",
    "glimepiride", "acetohexamide", "glipizide", "glyburide",
    "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
    "miglitol", "troglitazone", "tolazamide",
    "insulin", "glyburide-metformin", "glipizide-metformin",
    "glimepiride-pioglitazone", "metformin-rosiglitazone",
    "metformin-pioglitazone"
]

def diagnosis_group_for_model(value):
    if pd.isna(value) or str(value) == "?":
        return "Missing / unknown"
    code = str(value)
    if code.startswith("V"):
        return "Supplementary V-code"
    if code.startswith("E"):
        return "External cause E-code"
    try:
        number = float(code)
    except (TypeError, ValueError):
        return "Other / unknown"

    if 390 <= number <= 459 or number == 785:
        return "Circulatory"
    if 460 <= number <= 519 or number == 786:
        return "Respiratory"
    if 520 <= number <= 579 or number == 787:
        return "Digestive"
    if 250 <= number < 251:
        return "Diabetes"
    if 800 <= number <= 999:
        return "Injury"
    if 710 <= number <= 739:
        return "Musculoskeletal"
    if 580 <= number <= 629 or number == 788:
        return "Genitourinary"
    if 140 <= number <= 239:
        return "Neoplasms"
    return "Other"

def engineer_features(X):
    X = X.copy()
    utilisation_cols = [
        c for c in ["number_outpatient", "number_emergency", "number_inpatient"]
        if c in X.columns
    ]
    if utilisation_cols:
        X["total_prior_utilisation"] = X[utilisation_cols].sum(axis=1)
        X["any_prior_utilisation"] = (X[utilisation_cols].sum(axis=1) > 0).astype(int)

    if "number_inpatient" in X.columns:
        X["prior_inpatient_2plus"] = (X["number_inpatient"] >= 2).astype(int)

    if "number_emergency" in X.columns:
        X["prior_emergency_2plus"] = (X["number_emergency"] >= 2).astype(int)

    med_cols = [c for c in DIABETES_MEDICATION_COLUMNS if c in X.columns]
    if med_cols:
        med_values = X[med_cols].fillna("No").astype(str)
        X["diabetes_medication_count"] = med_values.ne("No").sum(axis=1)
        X["medication_adjustment_count"] = med_values.isin(["Up", "Down"]).sum(axis=1)
        X["any_medication_adjustment"] = (X["medication_adjustment_count"] > 0).astype(int)

    for col in ["diag_1", "diag_2", "diag_3"]:
        if col in X.columns:
            X[f"{col}_group"] = X[col].map(diagnosis_group_for_model)

    diag_cols = [c for c in ["diag_1", "diag_2", "diag_3"] if c in X.columns]
    if diag_cols:
        X["diagnosis_slots_present"] = (
            X[diag_cols].notna() & X[diag_cols].ne("?")
        ).sum(axis=1)

    if {"num_lab_procedures", "num_procedures"}.issubset(X.columns):
        X["total_procedures"] = X["num_lab_procedures"] + X["num_procedures"]

    if {"num_medications", "time_in_hospital"}.issubset(X.columns):
        X["medications_per_hospital_day"] = (
            X["num_medications"] / X["time_in_hospital"].clip(lower=1)
        )
    return X

def main():
    print(f"Loading dataset from: {DATA_PATH}")
    df_raw = pd.read_csv(DATA_PATH, keep_default_na=False)

    df = df_raw.copy()
    df["readmit_30"] = (df["readmitted"] == "<30").astype(int)

    for col in NUMERIC_SOURCE_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Patient-aware 70/15/15 split
    all_indices = np.arange(len(df))
    groups = df["patient_nbr"]
    target = df["readmit_30"]

    gss_train = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=RANDOM_STATE)
    train_idx, temp_idx = next(gss_train.split(all_indices, target, groups=groups))

    temp_groups = df.iloc[temp_idx]["patient_nbr"]
    temp_target = df.iloc[temp_idx]["readmit_30"]

    gss_valid_test = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=RANDOM_STATE)
    valid_rel_idx, test_rel_idx = next(gss_valid_test.split(temp_idx, temp_target, groups=temp_groups))

    valid_idx = temp_idx[valid_rel_idx]
    test_idx = temp_idx[test_rel_idx]

    train_df = df.iloc[train_idx].copy()
    valid_df = df.iloc[valid_idx].copy()
    test_df = df.iloc[test_idx].copy()

    def make_xy(split_df):
        y = split_df["readmit_30"].astype(int).copy()
        X = split_df.drop(columns=DROP_FROM_PREDICTORS, errors="ignore").copy()
        X = X.replace("?", np.nan)
        return X, y

    X_train_raw, y_train = make_xy(train_df)
    X_valid_raw, y_valid = make_xy(valid_df)
    X_test_raw, y_test = make_xy(test_df)

    RAW_PREDICTOR_COLUMNS = [c for c in df.columns if c not in DROP_FROM_PREDICTORS]
    NEW_INPUT_NUMERIC_COLUMNS = [c for c in NUMERIC_SOURCE_COLUMNS if c in RAW_PREDICTOR_COLUMNS]

    X_train_fe = engineer_features(X_train_raw)
    X_train_model = X_train_fe.copy()

    numeric_features = X_train_model.select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = [c for c in X_train_model.columns if c not in numeric_features]

    numeric_tree_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median"))
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Missing")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", min_frequency=20))
    ])

    tree_preprocessor = ColumnTransformer([
        ("num", numeric_tree_pipeline, numeric_features),
        ("cat", categorical_pipeline, categorical_features)
    ])

    print("Fitting tree preprocessor on training data...")
    X_train_xgb = tree_preprocessor.fit_transform(X_train_model)

    negative_count = int((y_train == 0).sum())
    positive_count = int((y_train == 1).sum())
    scale_pos_weight = negative_count / positive_count

    best_params = {
        'n_estimators': 400,
        'max_depth': 4,
        'learning_rate': 0.03,
        'min_child_weight': 5,
        'subsample': 0.85,
        'colsample_bytree': 0.85
    }

    print("Fitting XGBoost model (candidate 4)...")
    best_xgboost_model = XGBClassifier(
        objective="binary:logistic",
        eval_metric="aucpr",
        scale_pos_weight=scale_pos_weight,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        tree_method="hist",
        verbosity=0,
        **best_params
    )
    best_xgboost_model.fit(X_train_xgb, y_train)

    # Save artifacts
    print(f"Saving artifacts to: {ARTIFACTS_DIR}")
    joblib.dump(tree_preprocessor, ARTIFACTS_DIR / "tree_preprocessor.joblib")
    joblib.dump(best_xgboost_model, ARTIFACTS_DIR / "best_xgboost_model.joblib")
    best_xgboost_model.save_model(str(ARTIFACTS_DIR / "best_xgboost_model.json"))

    # Metadata
    metadata = {
        "model_name": "XGBoost (Candidate 4)",
        "project_title": "Diabetes 30-Day Hospital Readmission Risk Prediction and Medication/Treatment Pattern Analysis",
        "group": "2026-DS-61",
        "locked_threshold": LOCKED_XGB_THRESHOLD,
        "selection_criterion": "Validation PR-AUC",
        "threshold_selection_rule": "Maximum Validation F2",
        "random_state": RANDOM_STATE,
        "hyperparameters": best_params,
        "scale_pos_weight": float(scale_pos_weight),
        "raw_predictor_columns": RAW_PREDICTOR_COLUMNS,
        "new_input_numeric_columns": NEW_INPUT_NUMERIC_COLUMNS,
        "diabetes_medication_columns": DIABETES_MEDICATION_COLUMNS,
        "model_columns": list(X_train_model.columns),
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "validation_metrics": {
            "logistic_regression": {
                "PR-AUC": 0.181569, "ROC-AUC": 0.629251, "Precision": 0.160698,
                "Recall": 0.528382, "F1": 0.246444, "F2": 0.362499
            },
            "random_forest": {
                "PR-AUC": 0.181198, "ROC-AUC": 0.637163, "Precision": 0.179949,
                "Recall": 0.380435, "F1": 0.244328, "F2": 0.311111
            },
            "xgboost": {
                "PR-AUC": 0.189940, "ROC-AUC": 0.633847, "Precision": 0.161856,
                "Recall": 0.518116, "F1": 0.246658, "F2": 0.359748
            },
            "catboost": {
                "PR-AUC": 0.142732, "ROC-AUC": 0.588585, "Precision": 0.141396,
                "Recall": 0.567633, "F1": 0.226397, "F2": 0.354129
            }
        },
        "final_test_metrics_at_0_42": {
            "model": "XGBoost",
            "threshold": 0.42,
            "ROC-AUC": 0.655522,
            "PR-AUC": 0.209902,
            "Precision": 0.140958,
            "Recall": 0.782738,
            "F1": 0.238895,
            "F2": 0.409683,
            "Balanced Accuracy": 0.595409,
            "confusion_matrix": {
                "tn": 5525,
                "fp": 8014,
                "fn": 365,
                "tp": 1315
            }
        },
        "presets": {
            "preset_high_risk": {
                "name": "High-Risk Encounter (PART 11 Example 1)",
                "expected_score": 0.6638,
                "expected_classification": "HIGH-RISK FLAG",
                "data": {
                    "race": "Caucasian", "gender": "Female", "age": "[70-80)",
                    "admission_type_id": 1, "admission_source_id": 7, "time_in_hospital": 5,
                    "payer_code": "MC", "medical_specialty": "InternalMedicine",
                    "num_lab_procedures": 55, "num_procedures": 1, "num_medications": 18,
                    "number_outpatient": 1, "number_emergency": 1, "number_inpatient": 2,
                    "diag_1": "250.6", "diag_2": "401", "diag_3": "428", "number_diagnoses": 8,
                    "max_glu_serum": "None", "A1Cresult": ">8", "metformin": "Steady",
                    "repaglinide": "No", "nateglinide": "No", "chlorpropamide": "No",
                    "glimepiride": "No", "acetohexamide": "No", "glipizide": "No",
                    "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
                    "rosiglitazone": "No", "acarbose": "No", "miglitol": "No",
                    "troglitazone": "No", "tolazamide": "No", "insulin": "Up",
                    "glyburide-metformin": "No", "glipizide-metformin": "No",
                    "glimepiride-pioglitazone": "No", "metformin-rosiglitazone": "No",
                    "metformin-pioglitazone": "No", "change": "Ch", "diabetesMed": "Yes"
                }
            },
            "preset_lower_risk": {
                "name": "Lower-Risk Encounter (PART 11 Example 2)",
                "expected_score": 0.3644,
                "expected_classification": "LOWER-RISK FLAG",
                "data": {
                    "race": "AfricanAmerican", "gender": "Female", "age": "[20-30)",
                    "admission_type_id": 1, "admission_source_id": 7, "time_in_hospital": 2,
                    "payer_code": "MC", "medical_specialty": "InternalMedicine",
                    "num_lab_procedures": 40, "num_procedures": 0, "num_medications": 10,
                    "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0,
                    "diag_1": "233.6", "diag_2": "370", "diag_3": "398", "number_diagnoses": 5,
                    "max_glu_serum": "None", "A1Cresult": ">8", "metformin": "Steady",
                    "repaglinide": "No", "nateglinide": "No", "chlorpropamide": "No",
                    "glimepiride": "No", "acetohexamide": "No", "glipizide": "No",
                    "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
                    "rosiglitazone": "No", "acarbose": "No", "miglitol": "No",
                    "troglitazone": "No", "tolazamide": "No", "insulin": "Up",
                    "glyburide-metformin": "No", "glipizide-metformin": "No",
                    "glimepiride-pioglitazone": "No", "metformin-rosiglitazone": "No",
                    "metformin-pioglitazone": "No", "change": "Ch", "diabetesMed": "Yes"
                }
            }
        }
    }

    with open(ARTIFACTS_DIR / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("All artifacts successfully exported!")

if __name__ == "__main__":
    main()
