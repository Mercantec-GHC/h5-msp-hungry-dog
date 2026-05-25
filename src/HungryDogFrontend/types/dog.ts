export type Dog = {
  id: number;
  name: string;
  breed: string;
  currentWeight: number;
  ageInMonths: number;
  dailyActivityDuration: string;
};

export type CreateDogInput = {
  name: string;
  breed: string;
  currentWeight: number;
  ageInMonths: number;
  dailyActivityDuration: string;
};

export type UpdateDogInput = CreateDogInput;
