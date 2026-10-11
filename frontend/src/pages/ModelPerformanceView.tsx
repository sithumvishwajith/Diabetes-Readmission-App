import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { Award, Lock, ShieldCheck } from 'lucide-react';

export const ModelPerformanceView: React.FC = () => {
  // Four models validation metrics at 0.50 threshold
  const validationComparisonData = [
    {
      model: 'XGBoost',
      'PR-AUC': 0.189940,
      'ROC-AUC': 0.633847,
      Recall: 0.518116,
      Precision: 0.161856,
      F1: 0.246658,
      F2: 0.359748,
      isWinner: true,
    },
    {
      model: 'Logistic Regression',
      'PR-AUC': 0.181569,
      'ROC-AUC': 0.629251,
      Recall: 0.528382,
      Precision: 0.160698,
      F1: 0.246444,
      F2: 0.362499,
      isWinner: false,
    },
    {
      model: 'Random Forest',
      'PR-AUC': 0.181198,
      'ROC-AUC': 0.637163,
      Recall: 0.380435,
      Precision: 0.179949,
      F1: 0.244328,
      F2: 0.311111,
      isWinner: false,
    },
    {
      model: 'CatBoost',
      'PR-AUC': 0.142732,
      'ROC-AUC': 0.588585,
      Recall: 0.567633,
      Precision: 0.141396,
      F1: 0.226397,
      F2: 0.354129,
      isWinner: false,
    },
  ];

  // XGBoost Validation threshold search curve (from notebook Cell 131)
  const thresholdData = [
    { threshold: 0.10, Precision: 0.1102, Recall: 1.0000, F1: 0.1985, F2: 0.3824 },
    { threshold: 0.20, Precision: 0.1110, Recall: 0.9988, F1: 0.1998, F2: 0.3842 },
    { threshold: 0.30, Precision: 0.1157, Recall: 0.9710, F1: 0.2068, F2: 0.3919 },
    { threshold: 0.36, Precision: 0.1228, Recall: 0.8992, F1: 0.2161, F2: 0.3970 },
    { threshold: 0.40, Precision: 0.1313, Recall: 0.8207, F1: 0.2263, F2: 0.4002 },
    { threshold: 0.42, Precision: 0.1374, Recall: 0.7699, F1: 0.2332, F2: 0.4009 }, // Selected by max F2
    { threshold: 0.46, Precision: 0.1501, Recall: 0.6492, F1: 0.2438, F2: 0.3899 },
    { threshold: 0.50, Precision: 0.1619, Recall: 0.5181, F1: 0.2467, F2: 0.3597 },
    { threshold: 0.56, Precision: 0.1902, Recall: 0.3261, F1: 0.2403, F2: 0.2853 },
    { threshold: 0.60, Precision: 0.2058, Recall: 0.2325, F1: 0.2183, F2: 0.2266 },
    { threshold: 0.70, Precision: 0.3035, Recall: 0.0737, F1: 0.1186, F2: 0.0868 },
  ];

  return (
    <div className="space-y-10">
      {/* SECTION 1: Four-Model Validation Comparison */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-charcoal-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Phase 1: Model Selection
              </span>
              <h3 className="text-xl font-bold text-white">
                Four-Model Algorithm Validation Comparison
              </h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Evaluated on the patient-aware validation split (15,027 encounters) at the standard 0.50 threshold.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-500/40 text-teal-300 text-xs font-medium">
            <Award className="w-4 h-4 text-tealAccent-400" />
            <span>Winner: XGBoost (PR-AUC = 0.1899)</span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-charcoal-700 bg-charcoal-900/60 text-xs font-semibold uppercase text-slate-400">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Model Family</th>
                <th className="py-3 px-4 text-tealAccent-400 font-bold">PR-AUC (Criterion)</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">F2-Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-700">
              {validationComparisonData.map((row, idx) => (
                <tr
                  key={row.model}
                  className={`transition-colors ${
                    row.isWinner
                      ? 'bg-teal-950/20 text-white font-medium'
                      : 'hover:bg-charcoal-700/30 text-slate-300'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {idx === 0 ? (
                      <span className="flex items-center gap-1.5 text-tealAccent-400">
                        <Award className="w-4 h-4" /> 1
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold flex items-center gap-2">
                    {row.model}
                    {row.isWinner && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
                        Selected
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-tealAccent-400">
                    {row['PR-AUC'].toFixed(6)}
                  </td>
                  <td className="py-3.5 px-4 font-mono">{row['ROC-AUC'].toFixed(6)}</td>
                  <td className="py-3.5 px-4 font-mono">{row.Recall.toFixed(6)}</td>
                  <td className="py-3.5 px-4 font-mono">{row.Precision.toFixed(6)}</td>
                  <td className="py-3.5 px-4 font-mono">{row.F1.toFixed(6)}</td>
                  <td className="py-3.5 px-4 font-mono">{row.F2.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart View */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Validation PR-AUC vs ROC-AUC Across Algorithms
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={validationComparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222d42" />
                <XAxis dataKey="model" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 0.7]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101622', borderColor: '#222d42', color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="PR-AUC" fill="#14b8a6" name="PR-AUC (Selection Metric)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROC-AUC" fill="#3b82f6" name="ROC-AUC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="p-4 rounded-lg bg-charcoal-900 border border-charcoal-700/80 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong>Selection Rationale:</strong> XGBoost was chosen based on the pre-specified criterion of <strong>Validation PR-AUC (0.189940)</strong>. In imbalanced clinical datasets where the positive outcome is infrequent (11.16% in this cohort), Precision-Recall AUC is far more informative than ROC-AUC or Raw Accuracy because it specifically measures discrimination among the minority class.
          </p>
          <p className="text-slate-400">
            * Note: All metrics in this table reflect validation performance at the default 0.50 classification threshold before dedicated threshold tuning.
          </p>
        </div>
      </div>

      {/* SECTION 2: Decision Threshold Tuning */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-6">
        <div className="border-b border-charcoal-700 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              Phase 2: Operating Point
            </span>
            <h3 className="text-xl font-bold text-white">
              Validation-Only Decision-Threshold Tuning (Locked at 0.42)
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Threshold selection maximized <strong>Validation F2</strong> to prioritize sensitivity (recall) for hospital readmission screening.
          </p>
        </div>

        {/* Threshold Tuning Line Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={thresholdData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222d42" />
              <XAxis dataKey="threshold" stroke="#94a3b8" label={{ value: 'Decision Threshold', position: 'bottom', offset: 0, fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" domain={[0, 1.0]} />
              <Tooltip contentStyle={{ backgroundColor: '#101622', borderColor: '#222d42', color: '#f8fafc' }} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="Recall" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="F2" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 4 }} name="F2 (Optimization Criterion)" />
              <Line type="monotone" dataKey="F1" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Precision" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              <ReferenceLine x={0.42} stroke="#fbbf24" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Locked 0.42 (Max F2)', fill: '#fbbf24', position: 'insideTopRight' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 text-center">
            <span className="text-xs text-slate-400 block">Locked Threshold</span>
            <span className="text-2xl font-mono font-bold text-tealAccent-400">0.42</span>
            <span className="text-[11px] text-slate-500 block mt-1">Max F2 point</span>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 text-center">
            <span className="text-xs text-slate-400 block">Validation Recall</span>
            <span className="text-2xl font-mono font-bold text-sky-400">76.99%</span>
            <span className="text-[11px] text-slate-500 block mt-1">High sensitivity</span>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 text-center">
            <span className="text-xs text-slate-400 block">Validation F2-Score</span>
            <span className="text-2xl font-mono font-bold text-tealAccent-400">0.4009</span>
            <span className="text-[11px] text-slate-500 block mt-1">Peak objective score</span>
          </div>
          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 text-center">
            <span className="text-xs text-slate-400 block">Predicted Positive Rate</span>
            <span className="text-2xl font-mono font-bold text-amber-400">61.74%</span>
            <span className="text-[11px] text-slate-500 block mt-1">Screening flag rate</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Final One-Time Test Evaluation */}
      <div className="bg-gradient-to-b from-charcoal-800 to-charcoal-850 border border-charcoal-700 rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-charcoal-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Phase 3: Held-Out Test Evaluation
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Final Held-Out Test Metrics at Threshold 0.42
              </h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              One-time evaluation on 15,219 unseen patient encounters. The test set was never used for model selection or threshold tuning.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-600/40">
            <ShieldCheck className="w-4 h-4" />
            <span>Clean Patient Separation</span>
          </div>
        </div>

        {/* Test Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700">
            <span className="text-xs text-slate-400 block">ROC-AUC</span>
            <span className="text-lg font-mono font-bold text-white">0.655522</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700">
            <span className="text-xs text-tealAccent-400 block font-semibold">PR-AUC</span>
            <span className="text-lg font-mono font-bold text-tealAccent-400">0.209902</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700">
            <span className="text-xs text-slate-400 block">Recall</span>
            <span className="text-lg font-mono font-bold text-sky-400">78.27%</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700">
            <span className="text-xs text-slate-400 block">Precision</span>
            <span className="text-lg font-mono font-bold text-white">14.10%</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700">
            <span className="text-xs text-slate-400 block">F1-Score</span>
            <span className="text-lg font-mono font-bold text-white">0.238895</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700">
            <span className="text-xs text-amber-400 block font-semibold">F2-Score</span>
            <span className="text-lg font-mono font-bold text-amber-400">0.409683</span>
          </div>
          <div className="bg-charcoal-900 p-3.5 rounded-lg border border-charcoal-700">
            <span className="text-xs text-slate-400 block">Balanced Acc</span>
            <span className="text-lg font-mono font-bold text-white">59.54%</span>
          </div>
        </div>

        {/* Confusion Matrix Visual */}
        <div className="bg-charcoal-900 p-5 rounded-xl border border-charcoal-700 space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Final Test Confusion Matrix (N = 15,219 encounters)</span>
            <span className="text-slate-500 font-mono">Cutoff = 0.42</span>
          </h4>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-center font-mono">
            {/* True Negative */}
            <div className="bg-charcoal-800 p-4 rounded-lg border border-charcoal-700">
              <span className="text-xs text-slate-400 block uppercase font-sans">True Negatives (TN)</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">5,525</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">Correctly identified low-risk</span>
            </div>

            {/* False Positive */}
            <div className="bg-charcoal-800 p-4 rounded-lg border border-charcoal-700">
              <span className="text-xs text-slate-400 block uppercase font-sans">False Positives (FP)</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">8,014</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">Flagged for extra review</span>
            </div>

            {/* False Negative */}
            <div className="bg-charcoal-800 p-4 rounded-lg border border-charcoal-700">
              <span className="text-xs text-slate-400 block uppercase font-sans">False Negatives (FN)</span>
              <span className="text-2xl font-bold text-rose-400 mt-1 block">365</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">Missed readmissions</span>
            </div>

            {/* True Positive */}
            <div className="bg-charcoal-800 p-4 rounded-lg border border-charcoal-700">
              <span className="text-xs text-slate-400 block uppercase font-sans">True Positives (TP)</span>
              <span className="text-2xl font-bold text-tealAccent-400 mt-1 block">1,315</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block font-sans">Correctly detected &lt;30</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center max-w-md mx-auto pt-2">
            <strong>Clinical Screening Trade-Off:</strong> By lowering the decision threshold to 0.42, the model caught <strong>1,315 out of 1,680</strong> true readmissions (78.3% recall), missing only 365 patients, at the expense of screening 8,014 false positives.
          </p>
        </div>
      </div>
    </div>
  );
};
