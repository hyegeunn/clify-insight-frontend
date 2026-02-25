import apiClient from "../client";
import type {
  ApiResponse,
  EmployeeUsagePaymentsRequest,
  EmployeeUsagePaymentsResponse,
  EmployeeUsageContractHistoryResponse,
  EmployeeUsageExcelRequest,
  TeamUsagePaymentsRequest,
  TeamUsagePaymentsResponse,
  TeamUsageExcelRequest,
  SettlementSummaryRequest,
  SettlementSummaryResponse,
  ProductUsageStatusRequest,
  ProductUsageStatusExcelRequest,
  ProductUsageStatusApiData,
  MonthlyUsageRequest,
  MonthlyUsageResponse,
  MonthlyUsageExcelRequest,
  AssessmentUsageRequest,
  AssessmentUsageResponse,
  AssessmentUsageDetailResponse,
} from "@/types";

export const getEmployeeUsage = async (
  params: EmployeeUsagePaymentsRequest
): Promise<ApiResponse<EmployeeUsagePaymentsResponse>> => {
  const response = await apiClient.get<
    ApiResponse<EmployeeUsagePaymentsResponse>
  >("/payments/employee-usage", {
    params,
  });
  return response.data;
};

export const getEmployeeUsageContract = async (
  memberId: number,
  month: string
): Promise<ApiResponse<EmployeeUsageContractHistoryResponse>> => {
  const response = await apiClient.get<
    ApiResponse<EmployeeUsageContractHistoryResponse>
  >(`/payments/usage/member/${memberId}`, {
    params: { month },
  });
  return response.data;
};

export const downloadEmployeeUsageExcel = async (
  params: EmployeeUsageExcelRequest
): Promise<Blob> => {
  const response = await apiClient.get("/payments/employee-usage/excel", {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const getTeamUsage = async (
  params: TeamUsagePaymentsRequest
): Promise<ApiResponse<TeamUsagePaymentsResponse>> => {
  const response = await apiClient.get<
    ApiResponse<TeamUsagePaymentsResponse>
  >("/payments/team-usage", {
    params,
  });
  return response.data;
};

export const downloadTeamUsageExcel = async (
  params: TeamUsageExcelRequest
): Promise<Blob> => {
  const response = await apiClient.get("/payments/team-usage/excel", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const getSettlementSummary = async (
  params?: SettlementSummaryRequest
): Promise<ApiResponse<SettlementSummaryResponse>> => {
  const response = await apiClient.get<ApiResponse<SettlementSummaryResponse>>(
    "/payments/settlement-summary",
    {
      params,
    }
  );
  return response.data;
};

export const getProductUsageStatus = async (
  params: ProductUsageStatusRequest
): Promise<ApiResponse<ProductUsageStatusApiData>> => {
  const response = await apiClient.get<
    ApiResponse<ProductUsageStatusApiData>
  >("/payments/product-usage-status", {
    params,
  });

  return response.data;
};

export const downloadProductUsageStatusExcel = async (
  params: ProductUsageStatusExcelRequest
): Promise<Blob> => {
  const response = await apiClient.get("/payments/product-usage-status/excel", {
    params,
    responseType: "blob",
  });

  return response.data;
};

export const getMonthlyUsage = async (
  params: MonthlyUsageRequest
): Promise<ApiResponse<MonthlyUsageResponse>> => {
  const response = await apiClient.get<ApiResponse<MonthlyUsageResponse>>(
    "/payments/monthly-usage",
    {
      params,
    }
  );

  return response.data;
};

export const downloadMonthlyUsageExcel = async (
  params: MonthlyUsageExcelRequest
): Promise<Blob> => {
  const response = await apiClient.get("/payments/monthly-usage/excel", {
    params,
    responseType: "blob",
  });

  return response.data;
};

// 검사별 이용 현황 조회
export const getAssessmentUsage = async (
  params: AssessmentUsageRequest
): Promise<ApiResponse<AssessmentUsageResponse>> => {
  const response = await apiClient.get<ApiResponse<AssessmentUsageResponse>>(
    "/payments/assessment-usage",
    {
      params,
    }
  );
  return response.data;
};

// 검사별 이용 현황 상세보기 조회
export const getAssessmentUsageDetail = async (
  solutionId: number
): Promise<ApiResponse<AssessmentUsageDetailResponse>> => {
  const response = await apiClient.get<
    ApiResponse<AssessmentUsageDetailResponse>
  >(`/payments/assessment-usage/${solutionId}/detail`);
  return response.data;
};

