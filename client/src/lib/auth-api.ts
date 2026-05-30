import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function register(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', { email, password });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', { email, password });
}

export function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me');
}
