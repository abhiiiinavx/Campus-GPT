import api, { setAccessToken } from "./api.js";
import { ApiResponse, User } from "../types/index.js";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  rollNumber?: string;
  admissionYear?: number;
  departmentId?: string;
  semesterId?: string;
}

export const authService = {
  async signup(
    payload: SignupPayload,
  ): Promise<{ user: User; accessToken: string }> {
    const res = await api.post<
      ApiResponse<{ user: User; accessToken: string }>
    >("/auth/signup", payload);
    if (res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data.data;
  },

  async login(
    payload: LoginPayload,
  ): Promise<{ user: User; accessToken: string }> {
    const res = await api.post<
      ApiResponse<{ user: User; accessToken: string }>
    >("/auth/login", payload);
    if (res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data.data;
  },

  async refresh(): Promise<{ user?: User; accessToken: string }> {
    const res = await api.post<
      ApiResponse<{ user?: User; accessToken: string }>
    >("/auth/refresh");
    if (res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
    }
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },
};
