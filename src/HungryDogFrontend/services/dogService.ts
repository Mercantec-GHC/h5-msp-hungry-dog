import { apiRequest } from './api';
import type { CreateDogInput, Dog, UpdateDogInput } from '@/types/dog';

/**
 * Henter alle hunde for den indloggede bruger.
 */
export const getDogs = async (): Promise<Dog[]> => {
  return apiRequest('/dogs');
};

/**
 * Henter én hund via ID.
 */
export const getDog = async (id: number): Promise<Dog> => {
  return apiRequest(`/dogs/${id}`);
};

/**
 * Opretter en ny hund.
 */
export const createDog = async (dog: CreateDogInput): Promise<Dog> => {
  return apiRequest('/dogs', {
    method: 'POST',
    body: JSON.stringify(dog),
  });
};

/**
 * Opdaterer hundens profil.
 */
export const updateDog = async (id: number, dog: UpdateDogInput): Promise<Dog> => {
  return apiRequest(`/dogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dog),
  });
};

/**
 * Sletter hunden og relaterede data på backend.
 */
export const deleteDog = async (id: number) => {
  return apiRequest(`/dogs/${id}`, {
    method: 'DELETE',
  });
};
