import { apiRequest } from './api';
import type { AuthResponse, User } from '@/types/auth';
import { deleteStoredItem, getStoredItem, setStoredItem } from './storage';

/**
 * Logger brugeren ind og gemmer token lokalt.
 */
export const login = async (
  email: string,
  password: string
) : Promise<AuthResponse> => {
  const result = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  // Gemmer token, så brugeren ikke skal logge ind igen på næste API kald.
  if (result.token) {
    await setStoredItem('token', result.token);
  }

  if (result.user) {
    await setStoredItem('user', JSON.stringify(result.user));
  }

  return result;
};

/**
 * Opretter en ny bruger og gemmer token lokalt.
 */
export const register = async ({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) : Promise<AuthResponse> => {
  const result = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
    }),
  });

  // Efter oprettelse gemmes token automatisk, så brugeren går direkte ind i appen.
  if (result.token) {
    await setStoredItem('token', result.token);
  }

  if (result.user) {
    await setStoredItem('user', JSON.stringify(result.user));
  }

  return result;
};

/**
 * Logger brugeren ud ved at fjerne lokale login-data.
 */
export const logout = async () => {
  await deleteStoredItem('token');
  await deleteStoredItem('user');
};

/**
 * Henter gemt token til kald der har brug for direkte adgang.
 */
export const getToken = async () => {
  return await getStoredItem('token');
};

export const getCurrentUser = async (): Promise<User | null> => {
  // Bruges til hurtig visning af profil, inden API'et svarer.
  const user = await getStoredItem('user');
  return user ? JSON.parse(user) : null;
};

export const fetchCurrentUser = async (): Promise<User> => {
  // Backend er den endelige kilde, så lokale brugerdata opdateres efter hentning.
  const user = await apiRequest<User>('/auth/me');
  await setStoredItem('user', JSON.stringify(user));
  return user;
};

export const updateProfile = async (
  firstName: string,
  lastName: string
): Promise<User> => {
  // Når profilen gemmes, opdateres cache også så UI'et viser det nye navn med det samme.
  const user = await apiRequest<User>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ firstName, lastName }),
  });

  await setStoredItem('user', JSON.stringify(user));
  return user;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> => {
  // Password skiftes på backend, men token bevares så brugeren ikke smides ud.
  return apiRequest<AuthResponse>('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};
