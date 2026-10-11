import React from 'react';
import type { PredictionResult } from '../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Activity, ArrowRight } from 'lucide-react';

interface Props {
  result: PredictionResult | null;
  loading: boolean;
}

export const RiskResultCard: React.FC<Props> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[340px] animate-pulse">
        <Activity className="w-12 h-12 text-tealAccent-400 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-200">Evaluating Patient Encounter...</h3>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-sm">
          Applying deterministic feature engineering, tree preprocessor encoding, and frozen XGBoost inference.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-charcoal-800/80 border border-charcoal-700/80 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-16 h-16 rounded-full bg-charcoal-700/50 flex items-center justify-center mb-4 text-slate-400">
          <Activity className="w-8 h-8 text-tealAccent-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Awaiting Encounter Submission</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Fill in the 43 clinical & administrative predictor fields or click one of the historical educational presets above to compute the readmission risk score.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-charcoal-900/60 px-4 py-2 rounded-lg border border-charcoal-700">
          <span>Locked Threshold:</span>
          <span className="font-mono font-bold text-tealAccent-400">0.42</span>
          <span className="text-slate-500">|</span>
          <span>Target: &lt;30 Readmission</span>
        </div>
      </div>
    );
  }

  const isHighRisk = result.risk_score >= result.threshold;
  const scorePct = Math.round(result.risk_score * 100);
  const thresholdPct = Math.round(result.threshold * 100);

  return (
    <div
      className={`rounded-xl border shadow-2xl overflow-hidden transition-all duration-300 ${
        isHighRisk
          ? 'bg-gradient-to-b from-rose-950/40 via-charcoal-800 to-charcoal-850 border-rose-600/40'
          : 'bg-gradient-to-b from-teal-950/40 via-charcoal-800 to-charcoal-850 border-teal-500/40'
      }`}
    >
      {/* Header Banner */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${
          isHighRisk
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            : 'bg-teal-500/10 border-teal-500/20 text-teal-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {isHighRisk ? (
            <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-tealAccent-400 flex-shrink-0" />
          )}
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
              Evaluation Decision
            </span>
            <h4 className="text-lg font-bold tracking-tight text-white">{result.risk_classification}</h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Locked Threshold</span>
          <span className="font-mono font-bold text-slate-200">0.42</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Risk Score & Gauge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-charcoal-900/60 p-5 rounded-lg border border-charcoal-700">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Model Risk Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold font-mono text-white">
                {result.risk_score.toFixed(4)}
              </span>
              <span className="text-sm text-slate-400">/ 1.0000</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {scorePct}% estimated probability of &lt;30 day readmission
            </span>
          </div>

          {/* Visual Bar Gauge */}
          <div className="w-full sm:w-60 space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>0.00</span>
              <span className="text-tealAccent-400 font-bold">Cutoff: 0.42</span>
              <span>1.00</span>
            </div>
            <div className="h-3.5 w-full bg-charcoal-700 rounded-full relative overflow-hidden">
              {/* Threshold indicator marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
                style={{ left: `${thresholdPct}%` }}
                title="Threshold: 0.42"
              />
              {/* Fill */}
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  isHighRisk
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                    : 'bg-gradient-to-r from-cyan-500 to-tealAccent-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, scorePct))}%` }}
              />
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-medium ${
                  isHighRisk ? 'text-rose-400' : 'text-tealAccent-400'
                }`}
              >
                {isHighRisk
                  ? `+${((result.risk_score - 0.42) * 100).toFixed(1)}% above cutoff`
                  : `-${((0.42 - result.risk_score) * 100).toFixed(1)}% below cutoff`}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Interpretation */}
        <div className="space-y-2">
          <h5 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            Clinical Interpretation
          </h5>
          <p className="text-sm text-slate-200 leading-relaxed bg-charcoal-900/40 p-4 rounded-lg border border-charcoal-700/80">
            {result.interpretation}
          </p>
        </div>

        {/* Recommended Action */}
        <div className="space-y-2">
          <h5 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            Recommended Action
          </h5>
          <div
            className={`p-4 rounded-lg border text-sm flex items-start gap-3 ${
              isHighRisk
                ? 'bg-rose-950/20 border-rose-700/30 text-rose-200'
                : 'bg-teal-950/20 border-teal-700/30 text-teal-200'
            }`}
          >
            <ArrowRight className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{result.recommended_action}</span>
          </div>
        </div>

        {/* Calibration Note */}
        <div className="p-3 bg-charcoal-900/80 rounded border border-charcoal-700/60 text-xs text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Predictive Decision-Support Note:</strong> This score reflects the model's ranking of readmission risk and was optimized for recall screening (validation F2). It is not a clinically calibrated probability and should not substitute for comprehensive physician assessment.
          </span>
        </div>
      </div>
    </div>
  );
};
