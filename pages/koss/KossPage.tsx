import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import KossView from "./KossView";
import type { ProgressBarItem } from "@/types";
import type {
  KossEmployeeHeaders,
  KossEmployeeRow,
  KossEmployeeTableData,
  KossSummaryCardData,
  KossFilterOptions,
} from "@/types/pages/koss";
import styles from "./KossView.module.scss";
import { useDateRange } from "@/hooks";

const TOTAL_PAGES = 10;

const PROGRESS_ITEMS: ProgressBarItem[] = [
  { label: "영업 1팀", value: 67, maxValue: 80 },
  { label: "개발부문", value: 79, maxValue: 100 },
  { label: "기획·디자인", value: 38, maxValue: 50 },
  { label: "영업지원", value: 33, maxValue: 45 },
  { label: "고객공감", value: 70, maxValue: 100 },
  { label: "데이터분석", value: 33, maxValue: 50 },
  { label: "제품관리", value: 67, maxValue: 80 },
  { label: "R&D", value: 67, maxValue: 80 },
  { label: "매직사업", value: 40, maxValue: 80 },
];

const EMPLOYEE_DATA: KossEmployeeTableData<KossEmployeeRow> = [
  {
    name: "김하늘",
    department: "개발본부",
    email: "haneul.kim@company.com",
    status: { type: "tag", value: "completed", variant: "success" },
    responseDate: "2025-09-07",
  },
  {
    name: "이민서",
    department: "영업본부",
    email: "minseo.lee@company.com",
    status: { type: "tag", value: "completed", variant: "success" },
    responseDate: "2025-09-05",
  },
  {
    name: "박주연",
    department: "경영지원",
    email: "juyun.park@company.com",
    status: { type: "tag", value: "notCompleted", variant: "danger" },
    responseDate: "-",
  },
  {
    name: "최유진",
    department: "기획·디자인",
    email: "yujin.choi@company.com",
    status: { type: "tag", value: "notCompleted", variant: "danger" },
    responseDate: "-",
  },
  {
    name: "정세훈",
    department: "고객성공",
    email: "sehun.jung@company.com",
    status: { type: "tag", value: "completed", variant: "success" },
    responseDate: "2025-09-03",
  },
  {
    name: "최유진",
    department: "기획·디자인",
    email: "yujin.choi@company.com",
    status: { type: "tag", value: "notCompleted", variant: "danger" },
    responseDate: "-",
  },
  {
    name: "이민서",
    department: "영업본부",
    email: "minseo.lee@company.com",
    status: { type: "tag", value: "completed", variant: "success" },
    responseDate: "2025-09-11",
  },
  {
    name: "최유진",
    department: "기획·디자인",
    email: "yujin.choi@company.com",
    status: { type: "tag", value: "notCompleted", variant: "danger" },
    responseDate: "-",
  },
];

const FILTER_OPTIONS: KossFilterOptions = {
  departments: ["경영관리", "프로덕트", "사업개발", "영업", "기획", "사업기획"],
  statuses: ["completed", "notCompleted"],
};

const KossPage = () => {
  const { t } = useTranslation("pages/koss");
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const summaryCards: KossSummaryCardData[] = useMemo(
    () => [
      {
        title: t("card.testPeriod"),
        value: "2025.09.01~2025.09.30",
        description: t("card.periodGoal"),
      },
      {
        title: t("card.totalParticipants"),
        value: `350${t("unit.people")}`,
        description: t("card.totalEmployees"),
      },
      {
        title: t("card.participated"),
        value: `278${t("unit.people")}`,
        subValue: <span className={styles.subValue}>(79{t("unit.percent")})</span>,
        description: t("card.aggregationTime", { date: "9월 30일 16:04" }),
      },
      {
        title: t("card.notParticipated"),
        value: `72${t("unit.people")}`,
        subValue: <span className={styles.subValue}>(21{t("unit.percent")})</span>,
        description: t("card.aggregationTime", { date: "9월 30일 16:04" }),
      },
    ],
    [t]
  );

  const employeeHeaders: KossEmployeeHeaders<KossEmployeeRow> = useMemo(
    () => [
      { key: "name", label: t("table.header.name"), width: "15%", align: "left" },
      { key: "department", label: t("table.header.department"), width: "20%", align: "left" },
      { key: "email", label: t("table.header.email"), width: "35%", align: "left" },
      { key: "status", label: t("table.header.status"), width: "10%", align: "left" },
      { key: "responseDate", label: t("table.header.responseDate"), width: "20%", align: "left" },
    ],
    [t]
  );

  const employeeData: KossEmployeeTableData<KossEmployeeRow> = useMemo(
    () =>
      EMPLOYEE_DATA.map((employee) => {
        const status = employee.status;
        if (typeof status === "object" && "type" in status && status.type === "tag") {
          return {
            ...employee,
            status: {
              ...status,
              value: t(`status.${status.value}`),
            },
          };
        }
        return employee;
      }),
    [t]
  );

  const filterOptions: KossFilterOptions = useMemo(
    () => ({
      departments: FILTER_OPTIONS.departments,
      statuses: FILTER_OPTIONS.statuses.map((status) => t(`status.${status}`)),
    }),
    [t]
  );

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <KossView
      currentPage={currentPage}
      totalPages={TOTAL_PAGES}
      progressItems={PROGRESS_ITEMS}
      employeeHeaders={employeeHeaders}
      employeeData={employeeData}
      summaryCards={summaryCards}
      filterOptions={filterOptions}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      onPageChange={handlePageChange}
      onDateChange={handleDateChange}
    />
  );
};

export default KossPage;
