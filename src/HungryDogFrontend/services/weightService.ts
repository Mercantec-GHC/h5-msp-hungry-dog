import { apiRequest } from './api';
import type { WeightRecord } from '@/types/weight';

type WeightTrend = {
  trend: number | null;
  interpretation?: string;
  message?: string;
};

type WeightStatus = {
  status: string;
};

/**
 * Tilføjer en ny vægtmåling.
 */
export const addWeight = async (data: {
  dogId: number;
  weight: number;
  recordedAt?: string;
}) => {
  return apiRequest('/weight', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Henter vægthistorik til grafen.
 */
export const getWeightHistory = async (dogId: number, months = 12): Promise<WeightRecord[]> => {
  return apiRequest<WeightRecord[]>(`/weight/${dogId}/history?months=${months}`);
};

/**
 * Henter simpel vægttrend.
 */
export const getWeightTrend = async (dogId: number): Promise<WeightTrend> => {
  return apiRequest<WeightTrend>(`/weight/${dogId}/trend`);
};

/**
 * Henter vægtstatus.
 */
export const getWeightStatus = async (dogId: number): Promise<WeightStatus> => {
  return apiRequest<WeightStatus>(`/weight/${dogId}/status`);
};
