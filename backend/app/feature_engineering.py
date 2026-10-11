"""
backend/app/feature_engineering.py
Deterministic feature engineering matching Part 3 & Part 11 of the notebook.
"""

import pandas as pd
import numpy as np

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
    """Broad ICD-9-style diagnosis grouping matching notebook cell 87."""
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

def engineer_features(X: pd.DataFrame) -> pd.DataFrame:
    """Deterministic feature engineering matching notebook cell 88."""
    X = X.copy()

    # A. Prior healthcare utilisation
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

    # B. Diabetes medication burden / adjustment
    med_cols = [c for c in DIABETES_MEDICATION_COLUMNS if c in X.columns]
    if med_cols:
        med_values = X[med_cols].fillna("No").astype(str)
        X["diabetes_medication_count"] = med_values.ne("No").sum(axis=1)
        X["medication_adjustment_count"] = med_values.isin(["Up", "Down"]).sum(axis=1)
        X["any_medication_adjustment"] = (X["medication_adjustment_count"] > 0).astype(int)

    # C. Broad diagnosis groups
    for col in ["diag_1", "diag_2", "diag_3"]:
        if col in X.columns:
            X[f"{col}_group"] = X[col].map(diagnosis_group_for_model)

    diag_cols = [c for c in ["diag_1", "diag_2", "diag_3"] if c in X.columns]
    if diag_cols:
        X["diagnosis_slots_present"] = (
            X[diag_cols].notna() & X[diag_cols].ne("?")
        ).sum(axis=1)

    # D. Encounter / clinical-intensity summaries
    if {"num_lab_procedures", "num_procedures"}.issubset(X.columns):
        X["total_procedures"] = X["num_lab_procedures"] + X["num_procedures"]

    if {"num_medications", "time_in_hospital"}.issubset(X.columns):
        X["medications_per_hospital_day"] = (
            X["num_medications"] / X["time_in_hospital"].clip(lower=1)
        )

    return X
