import apiClient from "../client";
import type {
  FavDashboardRequest,
  FavDashboardResponse,
  FavTrendsRequest,
  FavTrendsResponse,
  FavStatusSummaryRequest,
  FavStatusSummaryResponse,
  FavStatusDetailRequest,
  FavStatusDetailResponse,
  FavOrganizationsRequest,
  FavOrganizationsResponse,
} from "@/types";

// 1. FAV 대시보드 전체 조회 (최초 로드)
export const getFavDashboard = async (
  params: FavDashboardRequest
): Promise<FavDashboardResponse> => {
  const response = await apiClient.get<FavDashboardResponse>(
    "/dashboard/fav",
    {
      params: {
        year: params.year,
        month: params.month,
        ...(params.organizationId && { organizationId: params.organizationId }),
      },
    }
  );
  return response.data;
};

// 2. 마음 건강 추이만 조회 (필터 변경 시)
export const getFavTrends = async (
  params: FavTrendsRequest
): Promise<FavTrendsResponse> => {
  const response = await apiClient.get<FavTrendsResponse>(
    "/dashboard/fav/trends",
    {
      params: {
        year: params.year,
        month: params.month,
        weeks: params.weeks,
        scoreType: params.scoreType,
        ...(params.organizationId && { organizationId: params.organizationId }),
      },
    }
  );
  return response.data;
};

// 3. 조직 목록 조회 (전체보기 - 페이지네이션)
export const getFavOrganizations = async (
  params: FavOrganizationsRequest
): Promise<FavOrganizationsResponse> => {
  const response = await apiClient.get<FavOrganizationsResponse>(
    "/dashboard/fav/organizations",
    {
      params: {
        year: params.year,
        month: params.month,
        parentOrgId: params.parentOrgId ?? null,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
      },
    }
  );
  return response.data;
};

// 4. 상태별 분류 요약 조회
export const getFavStatusSummary = async (
  params: FavStatusSummaryRequest
): Promise<FavStatusSummaryResponse> => {
  const response = await apiClient.get<FavStatusSummaryResponse>(
    "/dashboard/fav/status-summary",
    {
      params: {
        year: params.year,
        month: params.month,
      },
    }
  );
  return response.data;
};

// 5. 상태별 분류 상세 조회 (페이지네이션)
export const getFavStatusDetail = async (
  params: FavStatusDetailRequest
): Promise<FavStatusDetailResponse> => {
  const response = await apiClient.get<FavStatusDetailResponse>(
    "/dashboard/fav/status-detail",
    {
      params: {
        year: params.year,
        month: params.month,
        statusCategory: params.statusCategory,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  );
  return response.data;
};
