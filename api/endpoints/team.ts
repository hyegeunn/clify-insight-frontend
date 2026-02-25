import apiClient from "../client";
import type {
  PaginatedResponse,
  TeamUsageRequest,
  TeamUsage,
} from "@/types";

// 팀별 이용 내역 조회
export const getTeamUsageHistory = async (
  params: TeamUsageRequest
): Promise<PaginatedResponse<TeamUsage>> => {
  const response = await apiClient.get<PaginatedResponse<TeamUsage>>(
    "/usage/team",
    {
      params,
    }
  );
  return response.data;
};

// 팀 상세 이용 내역 조회
export const getTeamUsageDetail = async (
  departmentId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<
  PaginatedResponse<{
    employeeId: string;
    employeeName: string;
    usageCount: number;
    lastUsedAt: string;
  }>
> => {
  const response = await apiClient.get<
    PaginatedResponse<{
      employeeId: string;
      employeeName: string;
      usageCount: number;
      lastUsedAt: string;
    }>
  >(`/usage/team/${departmentId}`, {
    params,
  });
  return response.data;
};
