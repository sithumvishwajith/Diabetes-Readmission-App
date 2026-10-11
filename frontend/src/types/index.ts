export interface EncounterData {
  // A. Demographics
  race: string;
  gender: string;
  age: string;

  // B. Hospital Admission
  admission_type_id: number;
  admission_source_id: number;
  time_in_hospital: number;
  payer_code: string;
  medical_specialty: string;

  // C. Medical Utilization
  num_lab_procedures: number;
  num_procedures: number;
  num_medications: number;
  number_outpatient: number;
  number_emergency: number;
  number_inpatient: number;

  // D. Diagnoses & Clinical
  diag_1: string;
  diag_2: string;
  diag_3: string;
  number_diagnoses: number;
  max_glu_serum: string;
  A1Cresult: string;

  // E. Diabetes Medication & Treatment (23 fields)
  metformin: string;
  repaglinide: string;
  nateglinide: string;
  chlorpropamide: string;
  glimepiride: string;
  acetohexamide: string;
  glipizide: string;
  glyburide: string;
  tolbutamide: string;
  pioglitazone: string;
  rosiglitazone: string;
  acarbose: string;
  miglitol: string;
  troglitazone: string;
  tolazamide: string;
  insulin: string;
  'glyburide-metformin': string;
  'glipizide-metformin': string;
  'glimepiride-pioglitazone': string;
  'metformin-rosiglitazone': string;
  'metformin-pioglitazone': string;
  change: string;
  diabetesMed: string;
}

export interface PredictionResult {
  risk_score: number;
  threshold: number;
  risk_classification: 'HIGH-RISK FLAG' | 'LOWER-RISK FLAG';
  interpretation: string;
  recommended_action: string;
}

export interface PresetEncounter {
  name: string;
  expected_score: number;
  expected_classification: string;
  data: EncounterData;
}

export interface ValidationMetricSet {
  'PR-AUC': number;
  'ROC-AUC': number;
  Precision: number;
  Recall: number;
  F1: number;
  F2: number;
  'Balanced Accuracy'?: number;
}

export interface ModelInfo {
  model_name: string;
  project_title: string;
  group: string;
  locked_threshold: number;
  selection_criterion: string;
  threshold_selection_rule: string;
  validation_metrics: {
    logistic_regression: ValidationMetricSet;
    random_forest: ValidationMetricSet;
    xgboost: ValidationMetricSet;
    catboost: ValidationMetricSet;
  };
  final_test_metrics_at_0_42: {
    model: string;
    threshold: number;
    'ROC-AUC': number;
    'PR-AUC': number;
    Precision: number;
    Recall: number;
    F1: number;
    F2: number;
    'Balanced Accuracy': number;
    confusion_matrix: {
      tn: number;
      fp: number;
      fn: number;
      tp: number;
    };
  };
  hyperparameters: Record<string, any>;
  feature_count_raw: number;
  feature_count_model: number;
}

export interface InsightRate {
  category: string;
  count: number;
  readmit_rate_pct: number;
}

export interface MedicationInsights {
  insulin_status: {
    title: string;
    rates: InsightRate[];
    statistics: {
      test: string;
      chi2: number;
      dof: number;
      p_value: string;
      cramers_v: number;
      interpretation: string;
    };
  };
  medication_change: {
    title: string;
    rates: InsightRate[];
    statistics: {
      test: string;
      chi2: number;
      dof: number;
      p_value: string;
      cramers_v: number;
      odds_ratio: number;
      ci_95: string;
      interpretation: string;
    };
  };
  diabetes_medication: {
    title: string;
    rates: InsightRate[];
    statistics: {
      test: string;
      chi2: number;
      dof: number;
      p_value: string;
      cramers_v: number;
      odds_ratio: number;
      ci_95: string;
      interpretation: string;
    };
  };
  medication_burden: {
    title: string;
    rates: InsightRate[];
    statistics: {
      test: string;
      p_value: string;
      rank_biserial: number;
      spearman_rho: number;
      interpretation: string;
    };
  };
  disclaimer: string;
}
