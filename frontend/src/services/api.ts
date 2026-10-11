import type { EncounterData, PredictionResult, ModelInfo, MedicationInsights, PresetEncounter } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export async function checkHealth(): Promise<{ status: string; artifacts_loaded: boolean }> {
  const res = await fetch(`${API_BASE}/api/health`);
  return handleResponse(res);
}

export async function getModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_BASE}/api/model-info`);
  return handleResponse(res);
}

export async function getPresets(): Promise<Record<string, PresetEncounter>> {
  const res = await fetch(`${API_BASE}/api/presets`);
  return handleResponse(res);
}

export async function getMedicationInsights(): Promise<MedicationInsights> {
  const res = await fetch(`${API_BASE}/api/medication-insights`);
  return handleResponse(res);
}

export async function getSchema(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/schema`);
  return handleResponse(res);
}

export async function predictRisk(encounter: EncounterData): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(encounter),
  });
  return handleResponse(res);
}
