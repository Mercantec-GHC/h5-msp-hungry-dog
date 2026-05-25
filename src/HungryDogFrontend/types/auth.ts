export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
};
