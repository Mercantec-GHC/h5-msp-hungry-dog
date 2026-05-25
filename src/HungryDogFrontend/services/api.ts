import Constants from 'expo-constants';
import { getStoredItem } from './storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:5083/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Token hentes her, så alle API kald automatisk bruger login hvis brugeren er logget ind.
    const token = await getStoredItem('token');

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,

      headers: {
        'Content-Type': 'application/json',

        // Authorization-headeren er det backend bruger til at finde den rigtige bruger.
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),

        // Gør det stadig muligt at sende ekstra headers fra enkelte kald.
        ...(options.headers || {}),
      },
    });

    // Ved fejl læses svaret fra backend, så alert-beskeder bliver mere brugbare.
    if (!response.ok) {
      const errorText = await response.text();

      console.log('API STATUS:', response.status);
      console.log('API ERROR:', errorText);

      let message = errorText || 'API error';
      try {
        const parsedError = JSON.parse(errorText);
        message = parsedError.message || message;
      } catch {}

      throw new Error(message);
    }

    // Nogle endpoints returnerer ikke body, fx delete.
    const text = await response.text();

    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    console.log('NETWORK/API ERROR:', error);

    throw error;
  }
}
