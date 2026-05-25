import { apiRequest } from './api';
import type { DogNote } from '@/types/dogNote';

export const getDogNotes = async (dogId: number): Promise<DogNote[]> => {
  // Noter hentes under hundens route, fordi de altid tilhører en bestemt hund.
  return apiRequest(`/dogs/${dogId}/notes`);
};

export const addDogNote = async (dogId: number, text: string): Promise<DogNote> => {
  // Backend trimmer og validerer teksten, men frontend sender kun selve noten.
  return apiRequest(`/dogs/${dogId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

export const deleteDogNote = async (dogId: number, noteId: number) => {
  // Både dogId og noteId sendes, så backend kan tjekke ejerskab.
  return apiRequest(`/dogs/${dogId}/notes/${noteId}`, {
    method: 'DELETE',
  });
};
