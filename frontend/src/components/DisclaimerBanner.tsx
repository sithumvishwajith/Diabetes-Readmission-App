import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside aria-label="Disclaimer" className="bg-amber-950/30 border-b border-amber-600/30 text-amber-200/90 text-sm px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Academic Research Notice:</strong> For educational and research demonstration only. Not validated for clinical deployment.
          </span>
        </div>
        <span className="hidden md:inline-block text-amber-300/70 text-xs">
          IT3091 Machine Learning Assignment · Group 2026-DS-61
        </span>
      </div>
    </aside>
  );
};
