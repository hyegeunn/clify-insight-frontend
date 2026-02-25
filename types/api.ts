// ===========================================
// API Types
// ===========================================

// Base Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorField {
  field: string;
  value: string;
  reason: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  errors?: ApiErrorField[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    username: string;
    name: string;
    role: string;
    email: string;
  };
  company: {
    id: number;
    name: string;
    logoFileName: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  position?: string;
  role: "admin" | "manager" | "user";
  companyId: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

// FAV (조직진단) Types
export type FavScoreType = "total" | "anxiety" | "depression" | "stress";
export type FavStatus = "위험" | "주의" | "양호";

// 1. FAV 대시보드 전체 조회 Request
export interface FavDashboardRequest {
  year: number;
  month: number;
  organizationId?: number;
}

// 전사 마음 건강 점수
export interface CompanyHealthScore {
  totalScore: number;
  anxietyScore: number;
  depressionScore: number;
  stressScore: number;
  status: FavStatus;
  totalEmployees: number;
  participatingMembers: number;
  participationRate: number;
  totalAnalysisCount: number;
  scoreChange: number | null;
}

// 주별 추이 데이터
export interface WeeklyTrendItem {
  weekLabel: string;
  weekStartDate: string;
  weekEndDate: string;
  totalScore: number;
  anxietyScore: number;
  depressionScore: number;
  stressScore: number;
  daysAnalyzed: number;
}

// 조직 점수 데이터
export interface OrganizationScoreItem {
  organizationId: number;
  organizationName: string;
  totalScore: number;
  anxietyScore: number;
  depressionScore: number;
  stressScore: number;
  rank: number;
  previousRank: number | null;
  rankChange: number | null;
  scoreChange: number | null;
  riskIndicator: "불안" | "우울" | "스트레스" | null;
  memberCount: number;
  analysisCount: number;
  status: FavStatus;
  companyAverage?: number;
}

// 최고/최저 조직 데이터
export interface TopRiskOrganizations {
  high: OrganizationScoreItem;
  low: OrganizationScoreItem;
}

// 메타데이터
export interface FavMetaData {
  requestedYear: number;
  requestedMonth: number;
  actualYear: number;
  actualMonth: number;
  hasData: boolean;
  daysAnalyzed: number;
  notice: string | null;
  futureDate: boolean;
}

// 평균 대비 점수 차이 (말단 부서 전용)
export interface ScoreComparisonItem {
  organizationScore: number;
  companyAverage: number;
  difference: number;
  parentAverage: number | null;
  differenceFromParent: number | null;
}

// 고위험군 비율 추이 (말단 부서 전용)
export interface HighRiskRatioTrendItem {
  month: string;
  highRiskRatio: number;
  highRiskCount: number;
  totalCount: number;
}

// FAV 대시보드 전체 조회 Response
export interface FavDashboardResponse {
  companyHealthScore: CompanyHealthScore;
  weeklyTrends: WeeklyTrendItem[];
  topRiskOrganizations: TopRiskOrganizations;
  organizationRankings: OrganizationScoreItem[];
  topChangeOrganizations: OrganizationScoreItem[];
  metaData: FavMetaData;
  isCompanyDashboard: boolean;
  hasChildren: boolean | null;
  organizationId?: number | null;
  organizationName?: string | null;
  scoreComparison?: ScoreComparisonItem;
  highRiskRatioTrends?: HighRiskRatioTrendItem[];
}

// 2. 마음 건강 추이 조회 Request
export interface FavTrendsRequest {
  year: number;
  month: number;
  weeks: 1 | 4 | 8;
  scoreType: FavScoreType;
  organizationId?: number;
}

// 마음 건강 추이 조회 Response Item
export interface FavTrendItem {
  weekLabel: string;
  weekStartDate: string;
  weekEndDate: string;
  score: number;
  daysAnalyzed: number;
}

export type FavTrendsResponse = FavTrendItem[];

// 4. 상태별 분류 요약 조회 Request
export interface FavStatusSummaryRequest {
  year: number;
  month: number;
}

// 상태별 분류 카테고리 데이터
export interface FavStatusCategoryData {
  category: string;
  teamCount: number;
  memberCount: number;
  changeFromPrevious: number;
}

// 구간별 구성비 데이터
export interface FavStatusDistributionData {
  teamCount: number;
  memberCount: number;
  percentage: number;
}

// 구간별 구성비
export interface FavDistribution {
  totalTeams: number;
  participatingTeams: number;
  good: FavStatusDistributionData;
  caution: FavStatusDistributionData;
  highRisk: FavStatusDistributionData;
}

export interface NonParticipatingOrg {
  organizationId: number;
  organizationName: string;
  memberCount: number;
}

// 상태별 분류 요약 조회 Response
export interface FavStatusSummaryResponse {
  year: number;
  month: number;
  organizationId: number | null;
  organizationName: string | null;
  highRisk: FavStatusCategoryData;
  caution: FavStatusCategoryData;
  good: FavStatusCategoryData;
  distribution: FavDistribution;
  nonParticipatingOrgs?: NonParticipatingOrg[];
}

// 5. 상태별 분류 상세 조회 Request
export type FavStatusCategory = "HIGH_RISK" | "CAUTION" | "GOOD";

export interface FavStatusDetailRequest {
  year: number;
  month: number;
  statusCategory: FavStatusCategory;
  page?: number;
  size?: number;
}

// 상태별 분류 상세 조회 Response Item
export interface FavStatusDetailItem {
  organizationId: number;
  organizationName: string;
  totalScore: number;
  anxietyScore: number;
  depressionScore: number;
  stressScore: number;
  scoreChange: number;
  participationRate: number;
  participatingMembers: number;
  totalMembers: number;
  status: string;
}

// 상태별 분류 상세 조회 Response (페이지네이션)
export interface FavStatusDetailResponse {
  content: FavStatusDetailItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  last: boolean;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// 3. 조직 목록 조회 Request (전체보기 - 페이지네이션)
export interface FavOrganizationsRequest {
  year: number;
  month: number;
  parentOrgId?: number | null;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// 조직 목록 조회 Response Item
export interface FavOrganizationListItem {
  organizationId: number;
  organizationName: string;
  totalScore: number;
  anxietyScore: number;
  depressionScore: number;
  stressScore: number;
  scoreChange: number | null;
  status: FavStatus;
  riskIndicator: "불안" | "우울" | "스트레스" | null;
  memberCount: number;
  hasChildren: boolean;
}

// 조직 목록 조회 Response (페이지네이션)
export interface FavOrganizationsResponse {
  parentOrgId?: number | null;
  parentOrgName?: string | null;
  organizations: {
    content: FavOrganizationListItem[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    last: boolean;
    totalPages: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
}

// Employee Usage Types
export interface EmployeeUsageRequest {
  startDate?: string;
  endDate?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface EmployeeUsage {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  usageCount: number;
  lastUsedAt: string;
  services: {
    serviceName: string;
    count: number;
  }[];
}

export interface EmployeeUsagePaymentsRequest {
  month: string;
  organizationId?: number;
  solutionId?: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  page: number;
  size: number;
}

export interface EmployeeUsageExcelRequest {
  month: string;
  organizationId?: number;
  solutionId?: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export interface EmployeeUsagePaymentsItem {
  memberId: number;
  employeeNumber: string;
  memberName: string;
  organizationName: string;
  usageCount: number;
  totalAmount: number;
  pointAmount: number;
  cardAmount: number;
  representativeSolutionName: string;
  lastUsedDate: string;
}

export interface EmployeeUsagePaymentsResponse {
  employees: EmployeeUsagePaymentsItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  targetMonth: string;
  sortField: string;
  sortDirection: "asc" | "desc";
}

export type EmployeeUsagePaymentMethod = "POINT" | "CARD" | "MIXED";

export interface EmployeeUsageContractHistoryItem {
  paymentId: number;
  serviceName: string;
  amount: number;
  paymentMethod: EmployeeUsagePaymentMethod;
  paidAt: string;
}

export interface EmployeeUsageContractHistoryResponse {
  employeeNumber: string;
  memberName: string;
  contractStartDate: string;
  contractEndDate: string;
  totalCount: number;
  items: EmployeeUsageContractHistoryItem[];
}

// Team Usage Types
export interface TeamUsageRequest {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TeamUsage {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  totalUsageCount: number;
  averageUsagePerEmployee: number;
  topServices: {
    serviceName: string;
    count: number;
  }[];
}

export interface TeamUsagePaymentsRequest {
  month: string;
  teamName?: string;
  solutionId?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
  page?: number;
  size?: number;
}

export interface TeamUsageExcelRequest {
  month: string;
  teamName?: string;
  solutionId?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

export interface TeamUsagePaymentsItem {
  teamId: number;
  teamName: string;
  teamSize: number;
  usedEmployees: number;
  participationRate: number;
  usageCount: number;
  totalAmount: number;
  pointAmount: number;
  cardAmount: number;
  representativeProduct: string;
  recentUsedAt: string | null;
}

export interface TeamUsagePaymentsResponse {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  targetMonth: string;
  sortField: string;
  sortDirection: "ASC" | "DESC";
  items: TeamUsagePaymentsItem[];
}

export interface SettlementSummaryRequest {
  month?: string;
}

export interface SettlementSummaryResponse {
  currentMonthUsageAmount: number;
  periodStartDate: string;
  periodEndDate: string;
  prepaymentBudget: number;
  remainingBudget: number;
  budgetDepletionRate: number;
  paymentType: string;
  monthlySubscriptionFee: number;
  personalPaymentAmount?: number;
}

// Product Usage Status Types
export interface ProductUsageStatusRequest {
  month?: string;
  organizationId?: number;
}

export interface ProductUsageStatusExcelRequest {
  month: string;
}

export interface ProductUsageStatusItem {
  productName?: string | null;
  usageCount?: number | null;
  userCount?: number | null;
  totalAmount?: number | null;
  ratio?: number | null;
}

export interface ProductUsageStatusResponse {
  items?: ProductUsageStatusItem[];
  data?: ProductUsageStatusItem[];
  total?: {
    totalUsageCount: number;
    totalUserCount: number;
    totalAmount: number;
    totalRatio: number;
  } | null;
}

export type ProductUsageStatusApiData =
  | ProductUsageStatusResponse
  | ProductUsageStatusItem[];

export interface MonthlyUsageRequest {
  year: number;
  page?: number;
  size?: number;
}

export interface MonthlyUsageItem {
  period: string;
  usageCount: number;
  totalAmount: number;
  pointAmount: number;
  cardAmount: number;
  monthOverMonth: number | null;
}

export interface MonthlyUsageResponse {
  content: MonthlyUsageItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  period: string;
}

export interface MonthlyUsageExcelRequest {
  year: number;
}

// Billing Types
export interface BillingRequest {
  startDate?: string;
  endDate?: string;
}

export interface BillingResponse {
  totalAmount: number;
  period: {
    startDate: string;
    endDate: string;
  };
  services: {
    serviceName: string;
    usageCount: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

// Management Types
export interface ManagerListRequest {
  department?: string;
  status?: "active" | "inactive";
  role?: "admin" | "manager" | "user";
  search?: string;
  page?: number;
  limit?: number;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  position?: string;
  role: "admin" | "manager" | "user";
  status: "active" | "inactive";
  createdAt: string;
}

export interface CreateManagerRequest {
  name: string;
  email: string;
  phone?: string;
  department: string;
  position?: string;
  role: "admin" | "manager" | "user";
}

export interface UpdateManagerRequest {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: "admin" | "manager" | "user";
  status?: "active" | "inactive";
}

export interface DeleteManagerRequest {
  ids: string[];
}

// Common Request Types
export interface DateRangeRequest {
  startDate: string;
  endDate: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface SortRequest {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Member (임직원) Types
export type MemberRole = "SUPER_ADMIN" | "ADMIN" | "USER";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface Member {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: MemberRole;
  status: MemberStatus;
  statusDescription: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface MemberListRequest {
  page?: number;
  size?: number;
}

export interface MemberListResponse {
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  content: Member[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
  };
  last: boolean;
  empty: boolean;
}

export interface EmployeeListItem {
  id: number;
  name: string;
  organization: string;
  email: string;
  phone: string;
  usageCount: number;
  joinDate: string;
  lastUsedDate: string | null;
  role: MemberRole;
  jobPosition: string | null;
  birthDate: string | null;
  gender: string | null;
  status: boolean;
}

export interface EmployeeListRequest {
  searchKeyword?: string;
  organizationId?: number;
  status?: boolean;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  sortBy?: "name" | "organization" | "usageCount";
  sortDirection?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface EmployeeListResponse {
  content: EmployeeListItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  inactiveMemberCount: number;
}

export interface InactiveEmployeeListRequest {
  searchKeyword?: string;
  organizationId?: number;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  sortBy?: "name" | "organization" | "usageCount";
  sortDirection?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface InactiveEmployeeListResponse {
  content: EmployeeListItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  inactiveMemberCount: number;
}

export interface MemberSearchRequest {
  keyword?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING";
  page?: number;
  size?: number;
}

export interface OrganizationFilterItem {
  id: number;
  orgName: string;
}

export interface OrganizationsRequest {
  companyId: number;
  searchKeyword?: string;
}

export interface FilterOption {
  id: number;
  name: string;
  code: string;
}

export interface MemberFilterOptionsResponse {
  affiliations: FilterOption[];
  solutions: FilterOption[];
}

export interface CreateMemberRequest {
  email: string;
  name: string;
  phone: string;
  memo?: string;
}

export interface CreateEmployeeRequest {
  name: string;
  employeeNumber: string;
  organizationId: number;
  phone: string;
  jobPosition: string;
  birthDate: string;
  gender: string;
}

export interface UpdateMemberRequest {
  name: string;
  phone: string;
  memo?: string;
}

export interface UpdateMemberRoleRequest {
  role: "ADMIN" | "USER";
}

// Organization Hierarchy Types (API Response)
export interface OrganizationApiResponse {
  id: number;
  companyId: number;
  orgName: string;
  orgLevel: 1 | 2 | 3;
  children: OrganizationApiResponse[];
}

// ===========================================
// Reservations API Types
// ===========================================

// 카테고리 코드 타입
export type CategoryCode = "COUNSELING" | "ASSESSMENT" | "COACHING" | "PARTNERSHIP" | "ASSESSMENT_COUNSELING";

// 1. 카테고리별 대시보드 데이터 조회
export interface ReservationDashboardRequest {
  categoryCode: CategoryCode;
  month: string; // YYYY-MM 형식
}

export interface WeeklyDataItem {
  weekLabel: string;
  totalUsage: number;
}

export interface ReservationDashboardResponse {
  period: string;
  totalUsageCount: number;
  totalUserCount: number;
  newUserCount: number;
  newUserUsageCount: number;
  weeklyData: WeeklyDataItem[];
}

// 2. 상담 유형별 분포 조회
export interface ConsultationTypeDistributionRequest {
  categoryCode: CategoryCode;
  month: string; // YYYY-MM 형식
}

export interface ConsultationTypeItem {
  consultationType: string;
  count: number;
  percentage: number;
}

export type ConsultationTypeDistributionResponse = ConsultationTypeItem[];

// 3. 만족도 대시보드 조회
export interface SatisfactionRequest {
  categoryCode: CategoryCode;
  month: string; // YYYY-MM 형식
}

export interface SatisfactionDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface SatisfactionSummary {
  totalConsultations: number;
  respondedCount: number;
  responseRate: number;
}

export interface SatisfactionResponse {
  averageRating: number;
  summary: SatisfactionSummary;
  distributions: SatisfactionDistribution[];
}

// 4. 주제 비율 조회
export interface TopicRatiosRequest {
  categoryCode: CategoryCode;
  month: string; // YYYY-MM 형식
  page?: number;
  size?: number;
}

export interface TopicItem {
  topicName: string;
  count: number;
  percentage: number;
}

export interface RankItem {
  topicName: string;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  firstRank: RankItem | null;
  secondRank: RankItem | null;
}

export interface TopicRatiosResponse {
  categoryCode: CategoryCode;
  categoryName: string;
  month: string;
  totalCount: number;
  topics: TopicItem[];
  monthlyTrends: MonthlyTrendItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    first: boolean;
    last: boolean;
  };
}

// 5. 부서별 이용현황 조회
export interface DepartmentUsageStatusRequest {
  categoryCode: CategoryCode;
  month: string; // YYYY-MM 형식
  departmentSearch?: string;
  page?: number;
  size?: number;
  sortBy?: "usageCount" | "departmentName";
  sortDirection?: "ASC" | "DESC";
}

export interface DepartmentUsageItem {
  rank: number;
  departmentName: string;
  usageCount: number;
  cancellationCount: number;
  noShowCount: number;
  newUserCount: number;
  revisitUserCount: number;
  previousMonthComparison: number;
  comparisonDirection: "UP" | "DOWN" | "SAME";
}

export interface DepartmentUsageStatusResponse {
  departments: DepartmentUsageItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  period: string;
}

// ===========================================
// Payments API Types
// ===========================================

// 검사별 이용 현황 조회
export interface AssessmentUsageRequest {
  month: string; // YYYY-MM 형식
  sortBy?: "rank" | "usageCount";
  sortDirection?: "ASC" | "DESC";
  page?: number;
  size?: number;
}

export interface AssessmentUsageItem {
  rank: number;
  solutionId: number;
  solutionName: string;
  usageCount: number;
}

export interface AssessmentUsageResponse {
  assessments: AssessmentUsageItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

// 검사별 이용 현황 상세보기 조회
export interface AssessmentUsageDetailResponse {
  title: string;
  description: string;
  questions: number;
  recommended: string;
}

// 제휴서비스 - 서비스별 상세 현황 조회
export interface ServiceDetailRequest {
  month: string; // YYYY-MM 형식
  sortField?: "rank" | "serviceName" | "totalAmount";
  sortDirection?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface ServiceDetailItem {
  rank: number;
  serviceName: string;
  userCount: number;
  purchaseCount: number;
  totalAmount: number;
  repurchaseRate: number;
}

export interface ServiceDetailResponse {
  services: ServiceDetailItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  targetMonth: string;
  sortField: string;
  sortDirection: string;
}

// 제휴서비스 - 대시보드 조회
export interface PartnershipDashboardRequest {
  month: string; // YYYY-MM 형식
}

export interface PartnershipDashboardResponse {
  period: string;
  totalUserCount: number;
  totalPurchaseCount: number;
  totalPurchaseAmount: number;
  weeklyData: WeeklyDataItem[];
}

// 제휴서비스 - 부서별 이용현황 조회
export interface PartnershipDepartmentUsageRequest {
  month: string; // YYYY-MM 형식
  departmentName?: string;
  page?: number;
  size?: number;
}

export interface PartnershipDepartmentUsageItem {
  departmentName: string;
  usageCount: number;
  usageRatio: number;
}

export interface PartnershipDepartmentUsageResponse {
  content: PartnershipDepartmentUsageItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  period: string;
}

// Home Dashboard Types
export interface HomeDashboardRequest {
  year: number;
  month: number;
}

export interface HomeDashboardResponse {
  targetYearMonth: string;
  requestedYearMonth: string;
  actualYearMonth: string;
  isFutureDate: boolean;
  hasData: boolean;
  companyInfo: {
    companyId: number;
    companyName: string;
    activeUserCount: number;
    totalMemberCount: number;
    contractStartDate: string;
    contractEndDate: string;
    daysUntilExpiry: number;
    pointsPerEmployee: number;
    remainingBudget: number;
    totalBudget: number;
  };
  favDiagnosis: {
    timeSeriesChart: {
      labels: string[];
      anxietyScores: number[];
      depressionScores: number[];
      stressScores: number[];
    };
    riskDepartments: {
      rank: number;
      departmentId?: number | null;
      departmentName: string;
      riskLevel: string;
      averageScore?: number | null;
      totalMembers?: number | null;
      participatedMembers?: number | null;
      participationRate?: number | null;
      totalEmployees?: number | null;
      participantCount?: number | null;
      favScore?: number | null;
    }[];
  };
  usageBilling: {
    solutionUsages: {
      categoryName: string;
      usageCount: number;
      userCount: number;
      amount: number;
      percentage: number;
    }[];
    billingInfo: {
      expectedBillingAmount: number;
      contractBudget: number;
      remainingBudget: number;
      billingDate: string;
      paymentMethod: string;
      monthlySubscriptionPerAccount: number | null;
      totalCardPayment?: number;
    };
  };
}
