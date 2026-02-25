import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BaseIcon, BaseTable } from "@/components/common";
import type { HeaderConfig, RowData } from "@/types";
import type {
  HomeDepartmentData,
  HomeDepartmentTableProps,
  HomeDepartmentTableRow,
  HomeRiskLevel,
} from "@/types/pages/home";

const MASK_THRESHOLD = 3;

const RISK_VARIANT_MAP: Record<
  HomeRiskLevel,
  "danger" | "warning" | "success"
> = {
  high: "danger",
  warning: "warning",
  good: "success",
};

const calculateRiskLevelFromScore = (favScore?: number | null): HomeRiskLevel | null => {
  if (favScore === undefined || favScore === null) {
    return null;
  }

  if (favScore < 40) {
    return "high";
  }

  if (favScore < 60) {
    return "warning";
  }

  return "good";
};

const resolveRiskLevel = (
  riskLevel?: HomeRiskLevel | null,
  favScore?: number | null
): HomeRiskLevel | null => riskLevel ?? calculateRiskLevelFromScore(favScore);

const getRiskVariant = (
  riskLevel: HomeRiskLevel | null
): "danger" | "warning" | "success" | "normal" => {
  if (!riskLevel) {
    return "normal";
  }

  return RISK_VARIANT_MAP[riskLevel];
};

const shouldMask = (employeeCount: number): boolean =>
  employeeCount <= MASK_THRESHOLD;

const HomeDepartmentTable = <T extends HomeDepartmentData>({
  data,
}: HomeDepartmentTableProps<T>) => {
  const { t } = useTranslation("pages/home");

  const getRiskLabel = (riskLevel: HomeRiskLevel | null): string => {
    if (!riskLevel) {
      return "-";
    }

    return t(`table.riskLevel.${riskLevel}`);
  };

  const headers: HeaderConfig<HomeDepartmentTableRow>[] = useMemo(
    () => [
      { key: "department", label: t("table.header.department"), width: "30.4%", align: "left" },
      { key: "riskLevel", label: t("table.header.riskLevel"), width: "14.4%", align: "left" },
      {
        key: "totalEmployees",
        label: t("table.header.totalEmployees"),
        width: "18.4%",
        align: "left",
      },
      {
        key: "participatedEmployees",
        label: t("table.header.participatedEmployees"),
        width: "18.4%",
        align: "left",
      },
      {
        key: "participationRate",
        label: t("table.header.participationRate"),
        width: "18.4%",
        align: "left",
        icon: (
          <BaseIcon
            name="tooltip"
            size={16}
            tooltip={t("tooltip.participationRate")}
          />
        ),
      },
    ],
    [t]
  );

  const tableData: RowData<HomeDepartmentTableRow>[] = data.map((dept) => {
    const isMasked = shouldMask(dept.totalEmployees);
    const riskLevel = resolveRiskLevel(dept.riskLevel, dept.favScore);

    return {
      department: dept.department,
      riskLevel:
        {
          type: "tag",
          value: getRiskLabel(riskLevel),
          variant: getRiskVariant(riskLevel),
          align: "left",
        },
      totalEmployees: isMasked
        ? { type: "text", value: "***", align: "left" }
        : { type: "text", value: `${dept.totalEmployees}${t("unit.people")}`, align: "left" },
      participatedEmployees: isMasked
        ? { type: "text", value: "***", align: "left" }
        : {
            type: "text",
            value: `${dept.participatedEmployees}${t("unit.people")}`,
            align: "left",
          },
      participationRate: isMasked
        ? { type: "text", value: "***", align: "left" }
        : { type: "text", value: `${dept.participationRate}%`, align: "left" },
    };
  });

  return (
    <BaseTable<HomeDepartmentTableRow> headers={headers} data={tableData} />
  );
};

export default HomeDepartmentTable;
