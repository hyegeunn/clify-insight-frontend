import { useMemo, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import PartnerView from "./PartnerView";
import { BaseLoader } from "@/components/common";
import { solutionApi } from "@/api";
import { convertToYearMonthFormat } from "@/utils/date";
import { isEmpty } from "@/utils/validation";
import type {
  PartnerDepartmentData,
  PartnerDepartmentHeaders,
  PartnerDepartmentRow,
  PartnerPageState,
  PartnerServiceData,
  PartnerServiceHeaders,
  PartnerServiceRow,
  PartnerSortDirection,
  PartnerStatsCardData,
} from "@/types/pages/partner";
import { useDateRange, useTableData } from "@/hooks";

const INITIAL_PAGE_STATE: PartnerPageState = {
  currentDeptPage: 1,
  currentServicePage: 1,
  searchValue: "",
  deptSortKey: "rank",
  deptSortDirection: "desc",
  serviceSortKey: "rank",
  serviceSortDirection: "desc",
};

const PartnerPage = () => {
  const { t } = useTranslation("pages/partner");
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const [pageState, setPageState] =
    useState<PartnerPageState>(INITIAL_PAGE_STATE);

  const [searchTrigger, setSearchTrigger] = useState("");

  // 중복 호출 방지를 위한 ref
  const lastDashboardFetchKeyRef = useRef<string | null>(null);
  const lastDeptTableFetchKeyRef = useRef<string | null>(null);
  const lastServiceTableFetchKeyRef = useRef<string | null>(null);

  // Custom Hook을 사용한 테이블 데이터 관리
  const departmentTable = useTableData<PartnerDepartmentRow>();

  // API 관련 states
  const [isLoading, setIsLoading] = useState(true);
  const [chartXAxisData, setChartXAxisData] = useState<string[]>([]);
  const [chartSeriesData, setChartSeriesData] = useState<number[]>([]);
  const [statsCards, setStatsCards] = useState<PartnerStatsCardData[]>([]);
  const [departmentRows, setDepartmentRows] = useState<PartnerDepartmentRow[]>([]);
  const [totalDeptPages, setTotalDeptPages] = useState(1);
  const [serviceRows, setServiceRows] = useState<PartnerServiceRow[]>([]);
  const [totalServicePages, setTotalServicePages] = useState(1);

  const departmentHeaders: PartnerDepartmentHeaders<PartnerDepartmentRow> =
    useMemo(
      () => [
        {
          key: "rank",
          label: t("table.header.rank"),
          width: "25%",
          align: "left",
        },
        {
          key: "department",
          label: t("table.header.department"),
          width: "25%",
          align: "left",
        },
        {
          key: "usage",
          label: t("table.header.usage"),
          width: "25%",
          align: "left",
        },
        {
          key: "ratio",
          label: t("table.header.ratio"),
          width: "25%",
          align: "left",
        },
      ],
      [t]
    );

  const serviceHeaders: PartnerServiceHeaders<PartnerServiceRow> = useMemo(
    () => [
      {
        key: "rank",
        label: t("table.header.rank"),
        width: "10%",
        align: "left",
        sortable: true,
      },
      {
        key: "serviceName",
        label: t("table.header.serviceName"),
        width: "30%",
        align: "left",
        sortable: true,
      },
      {
        key: "userCount",
        label: t("table.header.userCount"),
        width: "15%",
        align: "left",
      },
      {
        key: "purchaseCount",
        label: t("table.header.purchaseCount"),
        width: "15%",
        align: "left",
      },
      {
        key: "totalAmount",
        label: t("table.header.totalAmount"),
        width: "15%",
        align: "left",
        sortable: true,
      },
      {
        key: "repurchaseRate",
        label: t("table.header.repurchaseRate"),
        width: "15%",
        align: "left",
      },
    ],
    [t]
  );

  // 1. 제휴서비스 대시보드 조회 (라인차트 + 통계카드)
  const fetchPartnershipDashboard = async (month: string) => {
    try {
      const response = await solutionApi.getPartnershipDashboard({
        month,
      });

      if (response.success && response.data) {
        const { weeklyData, totalUserCount, totalPurchaseCount, totalPurchaseAmount } = response.data;

        // 라인차트 데이터 변환
        setChartXAxisData(weeklyData.map((item) => item.weekLabel));
        setChartSeriesData(weeklyData.map((item) => item.totalUsage));

        // 통계카드 데이터 변환
        setStatsCards([
          { label: t("card.userCount"), value: totalUserCount },
          { label: t("card.purchaseCount"), value: totalPurchaseCount },
          { label: t("card.purchaseAmount"), value: totalPurchaseAmount },
        ]);
      }
    } catch (error) {
      console.error("제휴서비스 대시보드 조회 실패:", error);
    }
  };

  // 2. 부서별 이용현황 조회 (테이블)
  const fetchPartnershipDepartmentUsage = async (month: string, page: number, searchKeyword?: string) => {
    try {
      const response = await solutionApi.getPartnershipDepartmentUsage({
        month,
        departmentName: searchKeyword !== "" ? searchKeyword : undefined,
        page: page - 1, // API는 0부터 시작
        size: 10,
      });

      if (response.success && response.data) {
        const { content, totalPages: apiTotalPages } = response.data;

        // 빈 데이터 체크
        if (isEmpty(content)) {
          departmentTable.setData([], true);
          setTotalDeptPages(apiTotalPages);
          return;
        }

        // 테이블 데이터 변환
        const rows: PartnerDepartmentRow[] = content.map((dept, index) => ({
          id: `dept-${index}`,
          rank: index + 1 + (page - 1) * 10,
          department: dept.departmentName,
          usage: dept.usageCount,
          ratio: `${dept.usageRatio}%`,
        }));

        setDepartmentRows(rows);
        departmentTable.setData(rows, false);
        setTotalDeptPages(apiTotalPages);
      }
    } catch (error) {
      console.error("부서별 이용현황 조회 실패:", error);
    }
  };

  // 3. 서비스별 상세 현황 조회 (테이블)
  const fetchServiceDetailData = async (month: string, page: number) => {
    try {
      const response = await solutionApi.getServiceDetail({
        month,
        sortField: pageState.serviceSortKey === "serviceName" ? "serviceName" : "totalAmount",
        sortDirection: pageState.serviceSortDirection === "asc" ? "asc" : "desc",
        page: page - 1, // API는 0부터 시작
        size: 10,
      });

      if (response.success && response.data) {
        const { services, totalPages: apiTotalPages } = response.data;

        // 테이블 데이터 변환
        const rows: PartnerServiceRow[] = services.map((service, index) => ({
          id: `service-${index}`,
          rank: index + 1 + (page - 1) * 10,
          serviceName: service.serviceName,
          userCount: service.userCount,
          purchaseCount: service.purchaseCount,
          totalAmount: `₩${service.totalAmount.toLocaleString()}`,
          repurchaseRate: `${Math.round(service.repurchaseRate)}%`,
        }));

        setServiceRows(rows);
        setTotalServicePages(apiTotalPages);
      }
    } catch (error) {
      console.error("서비스별 상세 현황 조회 실패:", error);
    }
  };

  // 날짜가 변경될 때만 차트 및 카드 데이터 조회
  useEffect(() => {
    const month = convertToYearMonthFormat(selectedDate);
    if (!month) return;

    // 중복 호출 방지
    const fetchKey = `dashboard-${month}`;
    if (lastDashboardFetchKeyRef.current === fetchKey) {
      return;
    }
    lastDashboardFetchKeyRef.current = fetchKey;

    setIsLoading(true);
    Promise.all([
      fetchPartnershipDashboard(month),
    ]).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // 날짜, 부서 페이지, 검색이 변경될 때 부서 테이블 데이터만 조회
  useEffect(() => {
    const month = convertToYearMonthFormat(selectedDate);
    if (!month) return;

    // 중복 호출 방지
    const fetchKey = `dept-table-${month}-${pageState.currentDeptPage}-${searchTrigger}`;
    if (lastDeptTableFetchKeyRef.current === fetchKey) {
      return;
    }
    lastDeptTableFetchKeyRef.current = fetchKey;

    fetchPartnershipDepartmentUsage(month, pageState.currentDeptPage, searchTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, pageState.currentDeptPage, searchTrigger]);

  // 날짜, 서비스 페이지, 소팅이 변경될 때 서비스 테이블 데이터만 조회
  useEffect(() => {
    const month = convertToYearMonthFormat(selectedDate);
    if (!month) return;

    // 중복 호출 방지
    const fetchKey = `service-table-${month}-${pageState.currentServicePage}-${pageState.serviceSortKey}-${pageState.serviceSortDirection}`;
    if (lastServiceTableFetchKeyRef.current === fetchKey) {
      return;
    }
    lastServiceTableFetchKeyRef.current = fetchKey;

    fetchServiceDetailData(month, pageState.currentServicePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, pageState.currentServicePage, pageState.serviceSortKey, pageState.serviceSortDirection]);

  // 차트 및 카드 데이터 메모이제이션 (날짜가 변경될 때만 업데이트)
  const memoizedChartXAxisData = useMemo(() => chartXAxisData, [chartXAxisData]);
  const memoizedChartSeriesData = useMemo(() => chartSeriesData, [chartSeriesData]);
  const memoizedStatsCards = useMemo(() => statsCards, [statsCards]);

  // 테이블 데이터 메모이제이션
  const departmentData: PartnerDepartmentData<PartnerDepartmentRow> = useMemo(
    () => departmentRows,
    [departmentRows]
  );

  const serviceData: PartnerServiceData<PartnerServiceRow> = useMemo(
    () => serviceRows,
    [serviceRows]
  );

  const handleDeptSort = (
    key: keyof PartnerDepartmentRow,
    direction: PartnerSortDirection
  ) => {
    setPageState((prev) => ({
      ...prev,
      deptSortKey: key,
      deptSortDirection: direction,
    }));
  };

  const handleServiceSort = (
    key: keyof PartnerServiceRow,
    direction: PartnerSortDirection
  ) => {
    setPageState((prev) => ({
      ...prev,
      serviceSortKey: key,
      serviceSortDirection: direction,
    }));
  };

  const handleDeptPageChange = (page: number) => {
    setPageState((prev) => ({
      ...prev,
      currentDeptPage: page,
    }));
  };

  const handleServicePageChange = (page: number) => {
    setPageState((prev) => ({
      ...prev,
      currentServicePage: page,
    }));
  };

  const handleSearch = (value: string) => {
    setPageState((prev) => ({
      ...prev,
      searchValue: value,
    }));
  };

  const handleSearchTrigger = (value: string) => {
    setSearchTrigger(value);
    handleDeptPageChange(1);
  };

  // 모든 hooks 호출 후 조건부 렌더링
  if (isLoading && chartXAxisData.length === 0 && statsCards.length === 0) {
    return <BaseLoader />;
  }

  return (
    <PartnerView
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      currentDeptPage={pageState.currentDeptPage}
      totalDeptPages={totalDeptPages}
      currentServicePage={pageState.currentServicePage}
      totalServicePages={totalServicePages}
      searchValue={pageState.searchValue}
      deptSortKey={pageState.deptSortKey}
      deptSortDirection={pageState.deptSortDirection}
      serviceSortKey={pageState.serviceSortKey}
      serviceSortDirection={pageState.serviceSortDirection}
      statsCards={memoizedStatsCards}
      xAxisData={memoizedChartXAxisData}
      seriesData={memoizedChartSeriesData}
      departmentHeaders={departmentHeaders}
      departmentData={departmentData}
      serviceHeaders={serviceHeaders}
      serviceData={serviceData}
      isDepartmentTableEmpty={departmentTable.isEmpty}
      isSearchActive={searchTrigger !== ""}
      onDateChange={handleDateChange}
      onDeptSort={handleDeptSort}
      onServiceSort={handleServiceSort}
      onDeptPageChange={handleDeptPageChange}
      onServicePageChange={handleServicePageChange}
      onDeptSearchChange={handleSearch}
      onDeptSearch={handleSearchTrigger}
    />
  );
};

export default PartnerPage;
