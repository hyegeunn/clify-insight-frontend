import apiClient from "../client";
import type {
  ApiResponse,
  HomeDashboardRequest,
  HomeDashboardResponse,
} from "@/types";

// 홈 대시보드 데이터 조회
export const getHomeDashboard = async (
  params: HomeDashboardRequest
): Promise<ApiResponse<HomeDashboardResponse>> => {
  const response = await apiClient.get<ApiResponse<HomeDashboardResponse>>("/dashboard/home", {
    params,
  });
  return response.data;
};

