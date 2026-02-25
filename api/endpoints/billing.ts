import apiClient from "../client";
import type {
  ApiResponse,
  BillingRequest,
  BillingResponse,
} from "@/types";

// 정산 데이터 조회
export const getBillingData = async (
  params: BillingRequest
): Promise<ApiResponse<BillingResponse>> => {
  const response = await apiClient.get<ApiResponse<BillingResponse>>(
    "/billing",
    {
      params,
    }
  );
  return response.data;
};

// 정산 내역 다운로드
export const downloadBillingReport = async (params: BillingRequest): Promise<Blob> => {
  const response = await apiClient.get("/billing/download", {
    params,
    responseType: "blob",
  });
  return response.data;
};
