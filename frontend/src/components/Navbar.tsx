import React from 'react';
import { Activity, BarChart2, Pill, Info, Stethoscope, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  backendOnline: boolean | null;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, backendOnline }) => {
  const tabs = [
    { id: 'prediction', label: 'Encounter Prediction', icon: Stethoscope },
    { id: 'performance', label: 'Model Performance', icon: BarChart2 },
    { id: 'medication', label: 'Medication Insights', icon: Pill },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <header className="border-b border-charcoal-700 bg-charcoal-850/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Brand & Titles */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-tealAccent-600 to-navyAccent-500 flex items-center justify-center shadow-lg shadow-tealAccent-500/10">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  Diabetes Readmission Risk Planner
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-teal-500/15 border border-teal-500/40 text-teal-300">
                  Group 2026-DS-61
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-blue-500/15 border border-blue-500/40 text-blue-300 hidden sm:inline-block">
                  Threshold: 0.42
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                30-Day Hospital Readmission Risk Screening and Medication Pattern Insights
              </p>
            </div>
          </div>

          {/* Backend Status indicator */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                backendOnline === true
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-600/30'
                  : backendOnline === false
                  ? 'bg-rose-950/40 text-rose-400 border-rose-600/30'
                  : 'bg-charcoal-800 text-slate-400 border-charcoal-700'
              }`}
            >
              {backendOnline === true ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Model Engine Ready</span>
                </>
              ) : backendOnline === false ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Backend Offline</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Checking Engine...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 py-3.5 px-4 text-base font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-tealAccent-400 text-tealAccent-400 bg-charcoal-800/60 font-bold'
                    : 'border-transparent text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-tealAccent-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
