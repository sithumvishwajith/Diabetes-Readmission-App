import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { EncounterPredictionView } from './pages/EncounterPredictionView';
import { ModelPerformanceView } from './pages/ModelPerformanceView';
import { MedicationInsightsView } from './pages/MedicationInsightsView';
import { AboutProjectView } from './pages/AboutProjectView';
import { checkHealth } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('prediction');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth()
      .then((res) => {
        setBackendOnline(res.status === 'healthy' && res.artifacts_loaded);
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-charcoal-900 text-slate-100 flex flex-col font-sans selection:bg-tealAccent-500 selection:text-charcoal-900">
      <DisclaimerBanner />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendOnline={backendOnline}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prediction' && <EncounterPredictionView />}
        {activeTab === 'performance' && <ModelPerformanceView />}
        {activeTab === 'medication' && <MedicationInsightsView />}
        {activeTab === 'about' && <AboutProjectView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal-700 bg-charcoal-850 py-6 text-sm text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Diabetes Readmission Risk Planner</span>
            <span className="text-slate-600">|</span>
            <span>IT3091 Machine Learning Assignment</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Group 2026-DS-61</span>
            <span>•</span>
            <span>Locked Operating Threshold: 0.42</span>
            <span>•</span>
            <span>XGBoost (Hist Gradient Boosting)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
