import apiClient from "../client";
import type {
  ApiResponse,
  ReservationDashboardRequest,
  ReservationDashboardResponse,
  ConsultationTypeDistributionRequest,
  ConsultationTypeDistributionResponse,
  SatisfactionRequest,
  SatisfactionResponse,
  TopicRatiosRequest,
  TopicRatiosResponse,
  DepartmentUsageStatusRequest,
  DepartmentUsageStatusResponse,
  ServiceDetailRequest,
  ServiceDetailResponse,
  PartnershipDashboardRequest,
  PartnershipDashboardResponse,
  PartnershipDepartmentUsageRequest,
  PartnershipDepartmentUsageResponse,
} from "@/types";

// ===========================================
// Reservations API
// ===========================================

// 1. 카테고리별 대시보드 데이터 조회
export const getDashboard = async (
  params: ReservationDashboardRequest
): Promise<ApiResponse<ReservationDashboardResponse>> => {
  const response = await apiClient.get<
    ApiResponse<ReservationDashboardResponse>
  >("/reservations/dashboard", {
    params: {
      categoryCode: params.categoryCode,
      month: params.month,
    },
  });
  return response.data;
};

// 2. 카테고리별 상담 유형별 분포 조회
export const getConsultationTypeDistribution = async (
  params: ConsultationTypeDistributionRequest
): Promise<ApiResponse<ConsultationTypeDistributionResponse>> => {
  const response = await apiClient.get<
    ApiResponse<ConsultationTypeDistributionResponse>
  >("/reservations/consultation-type-distribution", {
    params: {
      categoryCode: params.categoryCode,
      month: params.month,
    },
  });
  return response.data;
};

// 3. 만족도 대시보드 조회
export const getSatisfaction = async (
  params: SatisfactionRequest
): Promise<ApiResponse<SatisfactionResponse>> => {
  const response = await apiClient.get<ApiResponse<SatisfactionResponse>>(
    "/reservations/satisfaction",
    {
      params: {
        categoryCode: params.categoryCode,
        month: params.month,
      },
    }
  );
  return response.data;
};

// 4. 카테고리별 주제 비율 조회
export const getTopicRatios = async (
  params: TopicRatiosRequest
): Promise<ApiResponse<TopicRatiosResponse>> => {
  const requestParams: Record<string, unknown> = {
    categoryCode: params.categoryCode,
    month: params.month,
  };
  
  if (params.page !== undefined) {
    requestParams.page = params.page;
  }
  if (params.size !== undefined) {
    requestParams.size = params.size;
  }

  const response = await apiClient.get<ApiResponse<TopicRatiosResponse>>(
    "/reservations/topic-ratios",
    {
      params: requestParams,
    }
  );
  return response.data;
};

// 5. 부서별 이용현황 조회
export const getDepartmentUsageStatus = async (
  params: DepartmentUsageStatusRequest
): Promise<ApiResponse<DepartmentUsageStatusResponse>> => {
  const response = await apiClient.get<
    ApiResponse<DepartmentUsageStatusResponse>
  >("/reservations/department-usage-status", {
    params: {
      categoryCode: params.categoryCode,
      month: params.month,
      departmentSearch: params.departmentSearch,
      page: params.page ?? 0,
      size: params.size ?? 10,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    },
  });
  return response.data;
};

// ===========================================
// Payments API
// ===========================================

// 6. 제휴서비스 - 서비스별 상세 현황 조회
export const getServiceDetail = async (
  params: ServiceDetailRequest
): Promise<ApiResponse<ServiceDetailResponse>> => {
  const response = await apiClient.get<ApiResponse<ServiceDetailResponse>>(
    "/payments/dashboard/service-detail",
    {
      params: {
        month: params.month,
        sortField: params.sortField ?? "rank",
        sortDirection: params.sortDirection ?? "desc",
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    }
  );
  return response.data;
};

// 7. 제휴서비스 - 대시보드 조회
export const getPartnershipDashboard = async (
  params: PartnershipDashboardRequest
): Promise<ApiResponse<PartnershipDashboardResponse>> => {
  const response = await apiClient.get<
    ApiResponse<PartnershipDashboardResponse>
  >("/payments/dashboard/partnership", {
    params: {
      month: params.month,
    },
  });
  return response.data;
};

// 8. 제휴서비스 - 부서별 이용현황 조회
export const getPartnershipDepartmentUsage = async (
  params: PartnershipDepartmentUsageRequest
): Promise<ApiResponse<PartnershipDepartmentUsageResponse>> => {
  const response = await apiClient.get<
    ApiResponse<PartnershipDepartmentUsageResponse>
  >("/payments/dashboard/department-usage", {
    params: {
      month: params.month,
      departmentName: params.departmentName,
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  });
  return response.data;
};
