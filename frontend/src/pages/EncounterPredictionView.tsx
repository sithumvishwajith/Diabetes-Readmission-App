import React, { useState, useEffect } from 'react';
import type { EncounterData, PredictionResult, PresetEncounter } from '../types';
import { predictRisk, getPresets } from '../services/api';
import { RiskResultCard } from '../components/RiskResultCard';
import {
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

const INITIAL_FORM: EncounterData = {
  race: 'Caucasian',
  gender: 'Female',
  age: '[70-80)',
  admission_type_id: 1,
  admission_source_id: 7,
  time_in_hospital: 5,
  payer_code: 'MC',
  medical_specialty: 'InternalMedicine',
  num_lab_procedures: 55,
  num_procedures: 1,
  num_medications: 18,
  number_outpatient: 1,
  number_emergency: 1,
  number_inpatient: 2,
  diag_1: '250.6',
  diag_2: '401',
  diag_3: '428',
  number_diagnoses: 8,
  max_glu_serum: 'None',
  A1Cresult: '>8',
  metformin: 'Steady',
  repaglinide: 'No',
  nateglinide: 'No',
  chlorpropamide: 'No',
  glimepiride: 'No',
  acetohexamide: 'No',
  glipizide: 'No',
  glyburide: 'No',
  tolbutamide: 'No',
  pioglitazone: 'No',
  rosiglitazone: 'No',
  acarbose: 'No',
  miglitol: 'No',
  troglitazone: 'No',
  tolazamide: 'No',
  insulin: 'Up',
  'glyburide-metformin': 'No',
  'glipizide-metformin': 'No',
  'glimepiride-pioglitazone': 'No',
  'metformin-rosiglitazone': 'No',
  'metformin-pioglitazone': 'No',
  change: 'Ch',
  diabetesMed: 'Yes',
};

export const EncounterPredictionView: React.FC = () => {
  const [formData, setFormData] = useState<EncounterData>(INITIAL_FORM);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<Record<string, PresetEncounter> | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>('preset_high_risk');
  const [showAllMeds, setShowAllMeds] = useState(false);

  useEffect(() => {
    getPresets()
      .then((data) => setPresets(data))
      .catch((err) => console.warn('Could not load presets:', err));
  }, []);

  const handleChange = (field: keyof EncounterData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setActivePreset(null); // Clear preset badge on manual edit
  };

  const handleNumericChange = (field: keyof EncounterData, value: string) => {
    const num = parseFloat(value);
    handleChange(field, isNaN(num) ? 0 : num);
  };

  const loadPreset = (presetKey: string) => {
    if (!presets || !presets[presetKey]) return;
    setFormData(presets[presetKey].data);
    setActivePreset(presetKey);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
    setError(null);
    setActivePreset('preset_high_risk');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictRisk(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header & Presets Bar */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tealAccent-400" />
              Single Inpatient Encounter Screening
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Supply the 43 clinical predictors to calculate readmission risk using the frozen XGBoost model at threshold 0.42.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs uppercase font-semibold text-slate-400 mr-1 hidden sm:inline">
              Educational Presets:
            </span>

            <button
              type="button"
              onClick={() => loadPreset('preset_high_risk')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                activePreset === 'preset_high_risk'
                  ? 'bg-rose-950/60 border-rose-500/80 text-rose-300 ring-1 ring-rose-500/50'
                  : 'bg-charcoal-700/60 border-charcoal-600 text-slate-300 hover:bg-charcoal-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              High-Risk Preset (Cell 168)
            </button>

            <button
              type="button"
              onClick={() => loadPreset('preset_lower_risk')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                activePreset === 'preset_lower_risk'
                  ? 'bg-teal-950/60 border-teal-500/80 text-teal-300 ring-1 ring-teal-500/50'
                  : 'bg-charcoal-700/60 border-charcoal-600 text-slate-300 hover:bg-charcoal-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-tealAccent-400"></span>
              Lower-Risk Preset (Cell 169)
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-charcoal-900 border border-charcoal-700 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Result Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 Cols on desktop) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {error && (
            <div className="bg-rose-950/40 border border-rose-600/40 text-rose-200 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Inference Error</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* SECTION A: Patient Demographics */}
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-charcoal-700 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-tealAccent-400">
                A. Patient Demographics
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Race</label>
                <select
                  value={formData.race}
                  onChange={(e) => handleChange('race', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="Caucasian">Caucasian</option>
                  <option value="AfricanAmerican">AfricanAmerican</option>
                  <option value="Hispanic">Hispanic</option>
                  <option value="Asian">Asian</option>
                  <option value="Other">Other</option>
                  <option value="?">Unknown / ?</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Unknown/Invalid">Unknown/Invalid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age Decade</label>
                <select
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="[0-10)">[0-10)</option>
                  <option value="[10-20)">[10-20)</option>
                  <option value="[20-30)">[20-30)</option>
                  <option value="[30-40)">[30-40)</option>
                  <option value="[40-50)">[40-50)</option>
                  <option value="[50-60)">[50-60)</option>
                  <option value="[60-70)">[60-70)</option>
                  <option value="[70-80)">[70-80)</option>
                  <option value="[80-90)">[80-90)</option>
                  <option value="[90-100)">[90-100)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION B: Hospital Admission */}
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-charcoal-700 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-tealAccent-400">
                B. Hospital Admission Details
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admission Type
                </label>
                <select
                  value={formData.admission_type_id}
                  onChange={(e) => handleNumericChange('admission_type_id', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value={1}>Emergency (1)</option>
                  <option value={2}>Urgent (2)</option>
                  <option value={3}>Elective (3)</option>
                  <option value={4}>Newborn (4)</option>
                  <option value={5}>Not Available (5)</option>
                  <option value={6}>NULL (6)</option>
                  <option value={7}>Trauma Center (7)</option>
                  <option value={8}>Not Mapped (8)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admission Source
                </label>
                <select
                  value={formData.admission_source_id}
                  onChange={(e) => handleNumericChange('admission_source_id', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value={7}>Emergency Room (7)</option>
                  <option value={1}>Physician Referral (1)</option>
                  <option value={2}>Clinic Referral (2)</option>
                  <option value={3}>HMO Referral (3)</option>
                  <option value={4}>Transfer from Hospital (4)</option>
                  <option value={5}>Transfer from SNF (5)</option>
                  <option value={6}>Transfer from other facility (6)</option>
                  <option value={10}>Critical access hospital (10)</option>
                  <option value={17}>NULL (17)</option>
                  <option value={20}>Not Mapped (20)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Time in Hospital (Days 1–14)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={formData.time_in_hospital}
                  onChange={(e) => handleNumericChange('time_in_hospital', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payer Code
                </label>
                <select
                  value={formData.payer_code}
                  onChange={(e) => handleChange('payer_code', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="MC">MC (Medicare)</option>
                  <option value="MD">MD (Medicaid)</option>
                  <option value="HM">HM (HMO)</option>
                  <option value="BC">BC (Blue Cross)</option>
                  <option value="SP">SP (Self-Pay)</option>
                  <option value="CP">CP (Commercial)</option>
                  <option value="UN">UN (United)</option>
                  <option value="CM">CM</option>
                  <option value="OG">OG</option>
                  <option value="PO">PO</option>
                  <option value="DM">DM</option>
                  <option value="WC">WC (Worker's Comp)</option>
                  <option value="CH">CH</option>
                  <option value="MP">MP</option>
                  <option value="OT">OT</option>
                  <option value="SI">SI</option>
                  <option value="FR">FR</option>
                  <option value="?">? (Missing)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Medical Specialty
                </label>
                <select
                  value={formData.medical_specialty}
                  onChange={(e) => handleChange('medical_specialty', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="InternalMedicine">InternalMedicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Family/GeneralPractice">Family/GeneralPractice</option>
                  <option value="Emergency/Trauma">Emergency/Trauma</option>
                  <option value="Surgery-General">Surgery-General</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Hematology/Oncology">Hematology/Oncology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Other">Other</option>
                  <option value="?">? (Missing)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION C: Medical Utilization */}
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-charcoal-700 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-tealAccent-400">
                C. Medical Utilization & Intensity
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Lab Procedures
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={formData.num_lab_procedures}
                  onChange={(e) => handleNumericChange('num_lab_procedures', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Non-Lab Procedures
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.num_procedures}
                  onChange={(e) => handleNumericChange('num_procedures', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Medications Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.num_medications}
                  onChange={(e) => handleNumericChange('num_medications', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prior Outpatient Visits
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.number_outpatient}
                  onChange={(e) => handleNumericChange('number_outpatient', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prior Emergency Visits
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.number_emergency}
                  onChange={(e) => handleNumericChange('number_emergency', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prior Inpatient Stays
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.number_inpatient}
                  onChange={(e) => handleNumericChange('number_inpatient', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION D: Diagnoses & Lab Results */}
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-charcoal-700 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-tealAccent-400">
                D. Diagnoses & Clinical Tests
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Diagnosis (diag_1)
                </label>
                <input
                  type="text"
                  value={formData.diag_1}
                  onChange={(e) => handleChange('diag_1', e.target.value)}
                  placeholder="e.g. 250.6"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Secondary Diagnosis (diag_2)
                </label>
                <input
                  type="text"
                  value={formData.diag_2}
                  onChange={(e) => handleChange('diag_2', e.target.value)}
                  placeholder="e.g. 401"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tertiary Diagnosis (diag_3)
                </label>
                <input
                  type="text"
                  value={formData.diag_3}
                  onChange={(e) => handleChange('diag_3', e.target.value)}
                  placeholder="e.g. 428"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Number of Diagnoses
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={formData.number_diagnoses}
                  onChange={(e) => handleNumericChange('number_diagnoses', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Max Glucose Serum
                </label>
                <select
                  value={formData.max_glu_serum}
                  onChange={(e) => handleChange('max_glu_serum', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="None">None (Not Measured)</option>
                  <option value="Norm">Norm (Normal)</option>
                  <option value=">200">&gt;200 mg/dL</option>
                  <option value=">300">&gt;300 mg/dL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  A1C Result
                </label>
                <select
                  value={formData.A1Cresult}
                  onChange={(e) => handleChange('A1Cresult', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="None">None (Not Measured)</option>
                  <option value="Norm">Norm (Normal)</option>
                  <option value=">7">&gt;7 %</option>
                  <option value=">8">&gt;8 %</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION E: Diabetes Medication and Treatment */}
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-charcoal-700 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-tealAccent-400">
                E. Diabetes Medication & Treatment
              </h3>
              <span className="text-xs text-slate-400">All 23 Model Predictors</span>
            </div>

            {/* Primary treatment fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Insulin Status
                </label>
                <select
                  value={formData.insulin}
                  onChange={(e) => handleChange('insulin', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none font-semibold"
                >
                  <option value="No">No</option>
                  <option value="Steady">Steady</option>
                  <option value="Up">Up (Dose Increased)</option>
                  <option value="Down">Down (Dose Decreased)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Medication Change (change)
                </label>
                <select
                  value={formData.change}
                  onChange={(e) => handleChange('change', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="No">No</option>
                  <option value="Ch">Ch (Dose Changed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Diabetes Med Prescribed
                </label>
                <select
                  value={formData.diabetesMed}
                  onChange={(e) => handleChange('diabetesMed', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Metformin
                </label>
                <select
                  value={formData.metformin}
                  onChange={(e) => handleChange('metformin', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="No">No</option>
                  <option value="Steady">Steady</option>
                  <option value="Up">Up</option>
                  <option value="Down">Down</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Glipizide
                </label>
                <select
                  value={formData.glipizide}
                  onChange={(e) => handleChange('glipizide', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="No">No</option>
                  <option value="Steady">Steady</option>
                  <option value="Up">Up</option>
                  <option value="Down">Down</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Glyburide
                </label>
                <select
                  value={formData.glyburide}
                  onChange={(e) => handleChange('glyburide', e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-tealAccent-400 focus:outline-none"
                >
                  <option value="No">No</option>
                  <option value="Steady">Steady</option>
                  <option value="Up">Up</option>
                  <option value="Down">Down</option>
                </select>
              </div>
            </div>

            {/* Expandable toggle for remaining 17 specific oral medications */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAllMeds(!showAllMeds)}
                className="text-xs text-tealAccent-400 hover:text-tealAccent-300 font-medium flex items-center gap-1 focus:outline-none"
              >
                {showAllMeds ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Hide other 17 specific medication fields
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Expand remaining 17 specific medication fields (glimepiride, pioglitazone, acarbose, etc.)
                  </>
                )}
              </button>

              {showAllMeds && (
                <div className="mt-4 pt-4 border-t border-charcoal-700/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    'glimepiride',
                    'pioglitazone',
                    'rosiglitazone',
                    'repaglinide',
                    'nateglinide',
                    'chlorpropamide',
                    'acetohexamide',
                    'tolbutamide',
                    'acarbose',
                    'miglitol',
                    'troglitazone',
                    'tolazamide',
                    'glyburide-metformin',
                    'glipizide-metformin',
                    'glimepiride-pioglitazone',
                    'metformin-rosiglitazone',
                    'metformin-pioglitazone',
                  ].map((med) => {
                    const val = (formData as any)[med];
                    const isTwoValue = ['acetohexamide', 'tolbutamide', 'troglitazone', 'glipizide-metformin', 'glimepiride-pioglitazone', 'metformin-rosiglitazone', 'metformin-pioglitazone'].includes(med);
                    return (
                      <div key={med}>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1 truncate" title={med}>
                          {med}
                        </label>
                        <select
                          value={val}
                          onChange={(e) => handleChange(med as any, e.target.value)}
                          className="w-full bg-charcoal-900 border border-charcoal-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-tealAccent-400 focus:outline-none"
                        >
                          <option value="No">No</option>
                          <option value="Steady">Steady</option>
                          {!isTwoValue && <option value="Up">Up</option>}
                          {!isTwoValue && <option value="Down">Down</option>}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-tealAccent-600 via-tealAccent-500 to-navyAccent-500 hover:from-tealAccent-500 hover:to-navyAccent-600 focus:ring-2 focus:ring-tealAccent-400 transition-all shadow-lg shadow-tealAccent-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Real XGBoost Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Predict Readmission Risk (Run Inference)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Sticky Column (5 Cols on desktop) */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          <RiskResultCard result={result} loading={loading} />

          {/* Preset comparison helper card */}
          {activePreset && presets && presets[activePreset] && (
            <div className="bg-charcoal-800/80 border border-charcoal-700 p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold">{presets[activePreset].name}</span>
                <span className="font-mono text-tealAccent-400">
                  Notebook Score: {presets[activePreset].expected_score.toFixed(4)}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Clicking "Predict Readmission Risk" above will execute the exact live pipeline on this encounter to verify parity with the notebook output.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
