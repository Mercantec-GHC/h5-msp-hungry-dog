import { apiRequest } from './api';

/**
 * Typerne matcher backendens DTO'er.
 */
export type FeedingRecommendation = {
  id: number;
  dogId: number;
  dailyCaloriesNeeded: number;
  restingEnergyExpenditure: number;
  activityMultiplier: number;
  breedAdjustment: string;
  notes: string;
  calculatedAt: string;
  nextReviewDate: string;
};

export type FeedingDetails = {
  dogName: string;
  weight: number;
  ageInMonths: number;
  dailyActivityDuration: string;
  dailyCaloriesNeeded: number;
  restingEnergyExpenditure: number;
  activityMultiplier: number;
  feedingGuide: string;
  calculatedAt: string;
};

export type MealAmount = 'All' | 'Half' | 'Small' | 'None';
export type MealName = 'Breakfast' | 'Dinner';

export type MealLog = {
  id: number;
  dogId: number;
  mealName: MealName;
  amountEaten: MealAmount;
  loggedAt: string;
};

/**
 * Beregner foderbehov for en hund.
 */
export const calculateFeeding = async (
  dogId: number
): Promise<FeedingRecommendation> => {
  return apiRequest('/feeding/calculate', {
    method: 'POST',
    body: JSON.stringify({ dogId }),
  });
};

/**
 * Henter den nyeste foderanbefaling.
 */
export const getLatestFeeding = async (
  dogId: number
): Promise<FeedingRecommendation> => {
  return apiRequest(`/feeding/${dogId}/latest`);
};

/**
 * Henter detaljer til foderkortet.
 */
export const getFeedingDetails = async (
  dogId: number
): Promise<FeedingDetails> => {
  return apiRequest(`/feeding/${dogId}/details`);
};

/**
 * Henter historik over foderanbefalinger.
 */
export const getFeedingHistory = async (
  dogId: number
): Promise<FeedingRecommendation[]> => {
  return apiRequest(`/feeding/${dogId}/history`);
};

export const logMeal = async (
  dogId: number,
  amountEaten: MealAmount = 'All',
  mealName: MealName = 'Breakfast'
): Promise<MealLog> => {
  // Standardværdierne matcher backendens fallback, hvis brugeren ikke vælger noget.
  return apiRequest('/feeding/meal-log', {
    method: 'POST',
    body: JSON.stringify({ dogId, amountEaten, mealName }),
  });
};

export const getLatestMealLog = async (dogId: number): Promise<MealLog> => {
  // Bruges til at sætte måltidsknapperne til seneste valg.
  return apiRequest(`/feeding/${dogId}/meal-log/latest`);
};

export const getRecentMealLogs = async (dogId: number, days = 7): Promise<MealLog[]> => {
  // Stats-siden bruger listen til tællere og kort historik.
  return apiRequest(`/feeding/${dogId}/meal-log/recent?days=${days}`);
};
