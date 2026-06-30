import { fetchApi } from "./api";

export interface User {
  id: string;
  email: string;
  nickname: string | null;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (credentials: Record<string, string>) =>
    fetchApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (data: Record<string, string>) =>
    fetchApi<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleLogin: (idToken: string) =>
    fetchApi<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
};
