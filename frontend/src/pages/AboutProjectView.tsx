import React from 'react';
import {
  FileText,
  Users,
  GitBranch,
  ShieldAlert,
  Server,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Overview Card */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Project Overview & Background</h2>
            <p className="text-xs text-slate-400">
              IT3091 Machine Learning Assignment · Academic Year 2026 · Group 2026-DS-61
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Hospital readmissions within 30 days after discharge impose immense health and financial burdens on healthcare systems. This project investigates the <strong>Diabetes 130-US Hospitals (1999–2008)</strong> dataset to build an end-to-end machine learning decision-support system to screen for elevated 30-day readmission risk (<span className="font-mono text-tealAccent-400">&lt;30</span>) and explore clinical medication patterns.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700/80">
            <span className="text-xs text-slate-400 block">Total Encounters</span>
            <span className="text-xl font-mono font-bold text-white">101,766</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700/80">
            <span className="text-xs text-slate-400 block">Unique Patients</span>
            <span className="text-xl font-mono font-bold text-white">71,518</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700/80">
            <span className="text-xs text-slate-400 block">Positive Class (&lt;30)</span>
            <span className="text-xl font-mono font-bold text-tealAccent-400">11.16% (11,357)</span>
          </div>
        </div>
      </div>

      {/* Patient-Aware Splitting Architecture */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-tealAccent-400" />
          Leakage Prevention & Patient-Aware 70/15/15 Split Strategy
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          In this dataset, 16,773 patients (23.45%) have more than one hospital encounter, accounting for 46.21% of all records. A naive random encounter split would cause <strong>repeated-patient data leakage</strong>, where past encounters of a patient appear in training and future encounters of the same patient appear in test.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700">
            <span className="text-tealAccent-400 font-bold block mb-1">Training Split (70%)</span>
            <div className="text-slate-300 space-y-1">
              <div>Encounters: 71,520</div>
              <div>Patients: 50,062</div>
              <div>&lt;30 Rate: 11.22%</div>
            </div>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700">
            <span className="text-sky-400 font-bold block mb-1">Validation Split (15%)</span>
            <div className="text-slate-300 space-y-1">
              <div>Encounters: 15,027</div>
              <div>Patients: 10,728</div>
              <div>&lt;30 Rate: 11.02%</div>
            </div>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700">
            <span className="text-emerald-400 font-bold block mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Test Split (15%)
            </span>
            <div className="text-slate-300 space-y-1">
              <div>Encounters: 15,219</div>
              <div>Patients: 10,728</div>
              <div>&lt;30 Rate: 11.04%</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Patient overlap between Train, Validation, and Test subsets is verified to be exactly <strong>zero</strong>.</span>
        </p>
      </div>

      {/* Model Selection & Locked Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-tealAccent-400" />
            Why XGBoost Was Selected
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Four model families (Logistic Regression, Random Forest, XGBoost, and CatBoost) were developed and tuned on identical patient-aware training partitions.
          </p>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside pt-1">
            <li><strong>Selection Criterion:</strong> Validation PR-AUC (Precision-Recall Area Under Curve).</li>
            <li><strong>Outcome:</strong> XGBoost achieved the highest validation PR-AUC (<strong>0.189940</strong>) compared to Logistic Regression (0.181569), Random Forest (0.181198), and CatBoost (0.142732).</li>
          </ul>
        </div>

        <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-tealAccent-400" />
            Why Threshold 0.42 Was Chosen
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            The decision threshold was calibrated on validation predictions using <strong>maximum F2-score</strong> rather than the default 0.50 cutoff.
          </p>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside pt-1">
            <li><strong>Screening Focus:</strong> Missing a high-risk readmission has severe clinical and financial consequences; F2 weights recall twice as heavily as precision.</li>
            <li><strong>Operating Point:</strong> At 0.42, validation recall reaches 76.99% with an F2 of 0.4009. The threshold was locked permanently before evaluating the test set.</li>
          </ul>
        </div>
      </div>

      {/* Group Member Ownership */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-tealAccent-400" />
          Group 2026-DS-61 Member Ownership
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700">
            <span className="text-xs text-tealAccent-400 font-mono font-bold block">Member 1</span>
            <div className="font-semibold text-white mt-0.5">Rathnayake S.N.S.</div>
            <div className="text-xs text-slate-400 mt-1">Data Understanding, Exploratory Data Analysis & Logistic Regression</div>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700">
            <span className="text-tealAccent-400 font-mono font-bold block">Member 2</span>
            <div className="font-semibold text-white mt-0.5">De Silva N.S.R.</div>
            <div className="text-xs text-slate-400 mt-1">Preprocessing, Leakage Review, Patient Split & Random Forest</div>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700">
            <span className="text-tealAccent-400 font-mono font-bold block">Member 3</span>
            <div className="font-semibold text-white mt-0.5">Dewmith H.B.S.</div>
            <div className="text-xs text-slate-400 mt-1">Feature Engineering, Gradient Boosting & XGBoost (Final Selected Model)</div>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700">
            <span className="text-tealAccent-400 font-mono font-bold block">Member 4</span>
            <div className="font-semibold text-white mt-0.5">Vishwajith U.K.S.B.</div>
            <div className="text-xs text-slate-400 mt-1">Secondary Medication/Treatment Analysis & CatBoost Classifier</div>
          </div>
        </div>
      </div>

      {/* Technology Stack & Architecture */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-tealAccent-400" />
          Software Stack & System Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 space-y-2">
            <span className="font-bold text-tealAccent-400 uppercase tracking-wide block">Frontend Interface</span>
            <div>• <strong>Framework:</strong> React 19 + TypeScript + Vite</div>
            <div>• <strong>Styling:</strong> Tailwind CSS (Dark healthcare dashboard theme)</div>
            <div>• <strong>Visualizations:</strong> Recharts (Interactive comparative bar & line charts)</div>
            <div>• <strong>Icons:</strong> Lucide React</div>
            <div>• <strong>Hosting:</strong> Vercel (Configured via VITE_API_BASE_URL)</div>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 space-y-2">
            <span className="font-bold text-tealAccent-400 uppercase tracking-wide block">Inference Backend</span>
            <div>• <strong>Framework:</strong> Python 3.13 + FastAPI + Pydantic v2</div>
            <div>• <strong>ML Libraries:</strong> scikit-learn, XGBoost, pandas, numpy, joblib</div>
            <div>• <strong>Preprocessors:</strong> ColumnTransformer with Median Imputation & OneHotEncoder</div>
            <div>• <strong>Testing:</strong> pytest automated parity test suite</div>
            <div>• <strong>Hosting:</strong> Render / Python Web Service</div>
          </div>
        </div>
      </div>

      {/* Responsible AI & Limitations */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <ShieldAlert className="w-5 h-5" />
          Responsible AI & Clinical Deployment Limitations
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          1. <strong>Historical Dataset:</strong> Data was gathered between 1999 and 2008 across 130 US hospitals. Clinical practice guidelines and diabetes pharmacotherapy have substantially shifted since this cohort.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          2. <strong>Decision Support Only:</strong> This tool is engineered strictly for educational, research, and university demonstration purposes. It has not undergone clinical trial validation or FDA clearance.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          3. <strong>Uncalibrated Scores:</strong> Model probabilities represent discrimination rankings rather than perfectly calibrated true posterior probabilities. A high-risk flag should always prompt human clinician judgment.
        </p>
      </div>
    </div>
  );
};
