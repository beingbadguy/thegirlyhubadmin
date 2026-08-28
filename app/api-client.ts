import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
};

type AuthResponse = {
  success?: boolean;
  message?: string;
  data?: AuthUser;
  user?: AuthUser;
};

export function getAuthUser(response: AuthUser | AuthResponse) {
  if ("data" in response && response.data) return response.data;
  if ("user" in response && response.user) return response.user;
  return response as AuthUser;
}

export const getApiError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message || error.response?.data?.error || fallback
    );
  }
  return fallback;
};
