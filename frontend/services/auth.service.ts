// services/auth.service.ts
import { httpClient } from '@/lib/http.client';

export interface SignupData {
  fullName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  profileImage?: string;
}

class AuthService {
  async signup(data: SignupData) {
    return httpClient.post('/api/Auth/signup', data);
  }

  async login(data: LoginData) {
    return httpClient.post('/api/Auth/login', data);
  }

  async logout() {
    return httpClient.post('/api/Auth/logout');
  }

  async getCurrentUser() {
    return httpClient.get<User>('/api/Auth/me');
  }
}

export const authService = new AuthService();