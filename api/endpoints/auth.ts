import apiClient from "../client";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "@/types";

// 로그인
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data);
  return response.data;
};

// 로그아웃
export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>("/auth/logout");
  return response.data;
};

// 토큰 갱신
export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponse>> => {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
    "/auth/refresh",
    data
  );
  return response.data;
};

// 비밀번호 재설정 요청
export const requestPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>("/auth/password-reset/request", {
    email,
  });
  return response.data;
};

// 비밀번호 재설정
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>("/auth/password-reset/confirm", {
    token,
    newPassword,
  });
  return response.data;
};
