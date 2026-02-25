import axios, { type AxiosInstance, type AxiosError } from "axios";
import type { ApiError } from "@/types";

// 환경변수에서 API 설정 가져오기
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://clify-insight-dev.simpaticoproject.com/admin/api";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // TODO:: 로컬 스토리지에서 토큰 가져와서 헤더에 추가
    const token =
      localStorage.getItem("accessToken") ||
      import.meta.env.VITE_TEMP_ACCESS_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답은 그대로 반환
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // 401 에러 (인증 실패)
    if (error.response?.status === 401 && originalRequest) {
      const isAuthRequest =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/logout") ||
        originalRequest.url?.includes("/auth/refresh");

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    // 403 에러 (권한 없음)
    if (error.response?.status === 403) {
      console.error("권한이 없습니다.");
      // TODO:: Toast 메시지 표시
    }

    // 404 에러 (리소스 없음)
    if (error.response?.status === 404) {
      console.error("요청한 리소스를 찾을 수 없습니다.");
      // TODO:: Toast 메시지 표시
    }

    // 500 에러 (서버 오류)
    if (error.response?.status === 500) {
      console.error("서버 오류가 발생했습니다.");
      // TODO:: Toast 메시지 표시
    }

    return Promise.reject(error);
  }
);

export default apiClient;
