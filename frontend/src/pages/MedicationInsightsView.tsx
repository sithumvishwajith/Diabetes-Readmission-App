import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Pill, AlertTriangle, Info, TrendingUp, Activity } from 'lucide-react';
import { getMedicationInsights } from '../services/api';
import type { MedicationInsights } from '../types';

export const MedicationInsightsView: React.FC = () => {
  const [insights, setInsights] = useState<MedicationInsights | null>(null);

  useEffect(() => {
    getMedicationInsights()
      .then((data) => setInsights(data))
      .catch((err) => console.warn('Could not load insights:', err));
  }, []);

  const insulinData = insights?.insulin_status.rates || [
    { category: 'No', count: 33227, readmit_rate_pct: 9.96 },
    { category: 'Steady', count: 21723, readmit_rate_pct: 11.25 },
    { category: 'Up', count: 7997, readmit_rate_pct: 13.18 },
    { category: 'Down', count: 8573, readmit_rate_pct: 14.15 },
  ];

  const changeData = insights?.medication_change.rates || [
    { category: 'No Change', count: 38519, readmit_rate_pct: 10.67 },
    { category: 'Changed (Ch)', count: 33001, readmit_rate_pct: 11.85 },
  ];

  const diabetesMedData = insights?.diabetes_medication.rates || [
    { category: 'No Diabetes Med', count: 16407, readmit_rate_pct: 9.52 },
    { category: 'Prescribed Diabetes Med', count: 55113, readmit_rate_pct: 11.72 },
  ];

  const burdenData = insights?.medication_burden.rates || [
    { category: '0–10 meds', count: 18200, readmit_rate_pct: 9.20 },
    { category: '11–20 meds', count: 36608, readmit_rate_pct: 11.50 },
    { category: '21–30 meds', count: 13034, readmit_rate_pct: 12.94 },
    { category: '31+ meds', count: 3678, readmit_rate_pct: 12.26 },
  ];

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Secondary Research Objective
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-tealAccent-400" />
                Medication & Treatment Pattern Insights
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Descriptive associations with 30-day readmission analyzed across 71,520 training inpatient encounters.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Observational Only · Not Causal</span>
          </div>
        </div>

        {/* Prominent Educational Warning Callout */}
        <div className="p-4 rounded-lg bg-charcoal-900 border border-charcoal-700 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-tealAccent-400 font-semibold uppercase tracking-wide">
            <Info className="w-4 h-4" />
            Statistical Significance vs. Effect Size Interpretation Principle
          </div>
          <p>
            Due to the large statistical power of 71,520 encounters, statistical tests yield extremely small p-values (e.g. p = 6.14e-34 for insulin). However, the <strong>Cramér's V effect sizes are very small (0.018 – 0.047)</strong>, demonstrating that individual medication changes have weak marginal predictive power by themselves.
          </p>
          <p className="text-slate-400">
            Medication changes frequently serve as clinical proxies for glycemic instability, acute decompensation, or physician attempts to correct uncontrolled diabetes, rather than being the biological cause of hospital readmission.
          </p>
        </div>
      </div>

      {/* Grid of Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CARD 1: Insulin Status */}
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-lg space-y-5">
          <div className="border-b border-charcoal-700 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-tealAccent-400" />
              1. Insulin Status vs. &lt;30 Readmission
            </h3>
            <span className="text-xs font-mono text-slate-400">N = 71,520</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insulinData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222d42" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 16]} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                  contentStyle={{ backgroundColor: '#101622', borderColor: '#222d42', color: '#f8fafc' }}
                />
                <Bar dataKey="readmit_rate_pct" radius={[4, 4, 0, 0]}>
                  {insulinData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.category === 'Down' ? '#f43f5e' : entry.category === 'Up' ? '#fb923c' : '#14b8a6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span>Chi-square = 157.566 (dof = 3)</span>
              <span className="text-amber-400">p = 6.14e-34</span>
              <span className="text-tealAccent-400 font-bold">Cramér's V = 0.0469</span>
            </div>
            <p className="text-slate-400 leading-relaxed pt-1 border-t border-charcoal-800">
              Patients requiring dosage adjustments (Down: 14.15%, Up: 13.18%) experienced notably higher 30-day readmission rates compared to those on Steady insulin (11.25%) or No insulin (9.96%).
            </p>
          </div>
        </div>

        {/* CARD 2: Medication Change */}
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-lg space-y-5">
          <div className="border-b border-charcoal-700 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-tealAccent-400" />
              2. Medication Change ('change') vs. &lt;30 Readmission
            </h3>
            <span className="text-xs font-mono text-slate-400">N = 71,520</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={changeData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222d42" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 15]} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                  contentStyle={{ backgroundColor: '#101622', borderColor: '#222d42', color: '#f8fafc' }}
                />
                <Bar dataKey="readmit_rate_pct" radius={[4, 4, 0, 0]}>
                  <Cell fill="#0ea5e9" />
                  <Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span>Chi-square = 25.019 (dof = 1)</span>
              <span className="text-amber-400">p = 5.68e-07</span>
              <span className="text-tealAccent-400 font-bold">OR = 1.126 (1.075–1.180)</span>
            </div>
            <p className="text-slate-400 leading-relaxed pt-1 border-t border-charcoal-800">
              Active medication modification ('Ch') showed an 11.85% readmission rate compared to 10.67% when medications were maintained without alteration ('No'). Weak association (Cramér's V = 0.0187).
            </p>
          </div>
        </div>

        {/* CARD 3: Diabetes Medication Indicator */}
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-lg space-y-5">
          <div className="border-b border-charcoal-700 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-tealAccent-400" />
              3. Prescribed Diabetes Medication ('diabetesMed')
            </h3>
            <span className="text-xs font-mono text-slate-400">N = 71,520</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diabetesMedData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222d42" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 15]} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                  contentStyle={{ backgroundColor: '#101622', borderColor: '#222d42', color: '#f8fafc' }}
                />
                <Bar dataKey="readmit_rate_pct" radius={[4, 4, 0, 0]}>
                  <Cell fill="#64748b" />
                  <Cell fill="#14b8a6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span>Chi-square = 61.192</span>
              <span className="text-amber-400">p = 5.18e-15</span>
              <span className="text-tealAccent-400 font-bold">OR = 1.262 (1.190–1.337)</span>
            </div>
            <p className="text-slate-400 leading-relaxed pt-1 border-t border-charcoal-800">
              Patients requiring pharmaceutical diabetes management during their stay had an 11.72% readmission rate compared to 9.52% for those with diabetes managed through non-pharmacological means.
            </p>
          </div>
        </div>

        {/* CARD 4: Total Medication Burden */}
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 shadow-lg space-y-5">
          <div className="border-b border-charcoal-700 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-tealAccent-400" />
              4. Total Medication Burden ('num_medications')
            </h3>
            <span className="text-xs font-mono text-slate-400">Mean 16.0 meds</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burdenData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222d42" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 16]} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Readmission Rate']}
                  contentStyle={{ backgroundColor: '#101622', borderColor: '#222d42', color: '#f8fafc' }}
                />
                <Bar dataKey="readmit_rate_pct" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-charcoal-900 p-4 rounded-lg border border-charcoal-700 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span>Mann–Whitney U test</span>
              <span className="text-amber-400">p = 2.43e-30</span>
              <span className="text-tealAccent-400 font-bold">Spearman rho = 0.0428</span>
            </div>
            <p className="text-slate-400 leading-relaxed pt-1 border-t border-charcoal-800">
              Patients who were readmitted took an average of 16.8 medications compared to 15.9 for those not readmitted. Medication count acts as a surrogate marker of patient comorbidity and polypharmacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
