import apiClient from "../client";
import type {
  PaginatedResponse,
  EmployeeUsageRequest,
  EmployeeUsage,
} from "@/types";

// 임직원별 이용 내역 조회
export const getEmployeeUsageHistory = async (
  params: EmployeeUsageRequest
): Promise<PaginatedResponse<EmployeeUsage>> => {
  const response = await apiClient.get<PaginatedResponse<EmployeeUsage>>(
    "/usage/employee",
    {
      params,
    }
  );
  return response.data;
};

// 임직원 상세 이용 내역 조회
export const getEmployeeUsageDetail = async (
  employeeId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<
  PaginatedResponse<{
    serviceName: string;
    usedAt: string;
    duration?: number;
    status: string;
  }>
> => {
  const response = await apiClient.get<
    PaginatedResponse<{
      serviceName: string;
      usedAt: string;
      duration?: number;
      status: string;
    }>
  >(`/usage/employee/${employeeId}`, {
    params,
  });
  return response.data;
};
