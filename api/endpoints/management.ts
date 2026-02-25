import apiClient from "../client";
import type {
  ApiResponse,
  Member,
  MemberListRequest,
  MemberListResponse,
  EmployeeListRequest,
  EmployeeListResponse,
  InactiveEmployeeListRequest,
  InactiveEmployeeListResponse,
  MemberSearchRequest,
  OrganizationFilterItem,
  OrganizationsRequest,
  OrganizationApiResponse,
  MemberFilterOptionsResponse,
  CreateMemberRequest,
  CreateEmployeeRequest,
  UpdateMemberRequest,
  UpdateMemberRoleRequest,
} from "@/types";

// 1. 멤버 삭제
export const deleteMember = async (
  memberId: number
): Promise<ApiResponse<object>> => {
  const response = await apiClient.delete<ApiResponse<object>>(
    `/members/${memberId}`
  );
  return response.data;
};

// 2. 멤버 조회
export const getMember = async (
  memberId: number
): Promise<ApiResponse<Member>> => {
  const response = await apiClient.get<ApiResponse<Member>>(
    `/members/${memberId}`
  );
  return response.data;
};

// 3. 멤버 목록 조회
export const getMemberList = async (
  params?: MemberListRequest
): Promise<ApiResponse<MemberListResponse>> => {
  const response = await apiClient.get<ApiResponse<MemberListResponse>>(
    "/members",
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }
  );
  return response.data;
};

// 4. 임직원 목록 조회
export const getEmployeeList = async (
  params?: EmployeeListRequest
): Promise<ApiResponse<EmployeeListResponse>> => {
  const response = await apiClient.get<ApiResponse<EmployeeListResponse>>(
    "/members/employees",
    {
      params: {
        searchKeyword: params?.searchKeyword,
        organizationId: params?.organizationId,
        status: params?.status,
        role: params?.role,
        sortBy: params?.sortBy ?? "name",
        sortDirection: params?.sortDirection ?? "asc",
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }
  );
  return response.data;
};

// 4-1. 비활성 임직원 목록 조회
export const getInactiveEmployeeList = async (
  params?: InactiveEmployeeListRequest
): Promise<ApiResponse<InactiveEmployeeListResponse>> => {
  const response = await apiClient.get<ApiResponse<InactiveEmployeeListResponse>>(
    "/members/employees/inactive",
    {
      params: {
        searchKeyword: params?.searchKeyword,
        organizationId: params?.organizationId,
        role: params?.role,
        sortBy: params?.sortBy ?? "name",
        sortDirection: params?.sortDirection ?? "asc",
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }
  );
  return response.data;
};

// 5. 멤버 검색
export const searchMembers = async (
  params?: MemberSearchRequest
): Promise<ApiResponse<MemberListResponse>> => {
  const response = await apiClient.get<ApiResponse<MemberListResponse>>(
    "/members/search",
    {
      params: {
        keyword: params?.keyword,
        status: params?.status,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }
  );
  return response.data;
};

// 6. 임직원 목록 소속 필터 조회
export const getOrganizationsForFilter = async (
  params: OrganizationsRequest
): Promise<ApiResponse<OrganizationFilterItem[]>> => {
  const response = await apiClient.get<ApiResponse<OrganizationFilterItem[]>>(
    "/members/organizations",
    {
      params: {
        companyId: params.companyId,
        searchKeyword: params.searchKeyword,
      },
    }
  );
  return response.data;
};

// 7. 소속 조회
export const getOrganizations = async (
  companyId: number
): Promise<ApiResponse<OrganizationApiResponse[]>> => {
  const response = await apiClient.get<ApiResponse<OrganizationApiResponse[]>>(
    `/members/organization/${companyId}`
  );
  return response.data;
};

// 8. 멤버 필터 옵션 조회
export const getMemberFilterOptions = async (): Promise<
  ApiResponse<MemberFilterOptionsResponse>
> => {
  const response = await apiClient.get<
    ApiResponse<MemberFilterOptionsResponse>
  >("/members/filter-options");
  return response.data;
};

// 9. 전체 멤버 수 조회
export const getTotalMemberCount = async (): Promise<ApiResponse<number>> => {
  const response = await apiClient.get<ApiResponse<number>>(
    "/members/count/total"
  );
  return response.data;
};

// 10. 활성 멤버 수 조회
export const getActiveMemberCount = async (): Promise<ApiResponse<number>> => {
  const response = await apiClient.get<ApiResponse<number>>(
    "/members/count/active"
  );
  return response.data;
};

// 11. 멤버 권한 변경
export const updateMemberRole = async (
  memberId: number,
  data: UpdateMemberRoleRequest
): Promise<ApiResponse<Member>> => {
  const response = await apiClient.patch<ApiResponse<Member>>(
    `/members/${memberId}/role`,
    data
  );
  return response.data;
};

// 12. 멤버 비활성화
export const deactivateMember = async (
  memberId: number
): Promise<ApiResponse<Member>> => {
  const response = await apiClient.patch<ApiResponse<Member>>(
    `/members/${memberId}/deactivate`
  );
  return response.data;
};

// 13. 멤버 활성화
export const activateMember = async (
  memberId: number
): Promise<ApiResponse<Member>> => {
  const response = await apiClient.patch<ApiResponse<Member>>(
    `/members/${memberId}/activate`
  );
  return response.data;
};

// 14. 멤버 생성
export const createMember = async (
  data: CreateMemberRequest
): Promise<ApiResponse<Member>> => {
  const response = await apiClient.post<ApiResponse<Member>>("/members", data);
  return response.data;
};

// 15. 임직원 추가
export const createEmployee = async (
  data: CreateEmployeeRequest
): Promise<ApiResponse<Member>> => {
  const response = await apiClient.post<ApiResponse<Member>>(
    "/members/employees",
    data
  );
  return response.data;
};

// 16. 멤버 수정
export const updateMember = async (
  memberId: number,
  data: UpdateMemberRequest
): Promise<ApiResponse<Member>> => {
  const response = await apiClient.put<ApiResponse<Member>>(
    `/members/${memberId}`,
    data
  );
  return response.data;
};
