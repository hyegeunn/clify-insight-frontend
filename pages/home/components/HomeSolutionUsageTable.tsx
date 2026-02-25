import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BaseTable, BaseIcon } from "@/components/common";
import { toTextCell, formatCount, formatCurrency } from "@/utils";
import type { HeaderConfig, RowData } from "@/types";
import type {
  HomeSolutionUsageData,
  HomeSolutionUsageTableProps,
  HomeSolutionUsageTableRow,
} from "@/types/pages/home";

const HomeSolutionUsageTable = <T extends HomeSolutionUsageData>({
  data,
  className = "",
}: HomeSolutionUsageTableProps<T>) => {
  const { t } = useTranslation("pages/home");

  const headers: HeaderConfig<HomeSolutionUsageTableRow>[] = useMemo(
    () => [
      {
        key: "solutionName",
        label: t("table.header.item"),
        width: "40%",
        align: "left",
      },
      {
        key: "usageCount",
        label: t("table.header.usageCount"),
        width: "20%",
        align: "left",
      },
      {
        key: "participantCount",
        label: t("table.header.participants"),
        width: "20%",
        align: "left",
      },
      {
        key: "amount",
        label: t("table.header.amount"),
        width: "30%",
        align: "left",
      },
      {
        key: "ratio",
        label: t("table.header.ratio"),
        width: "20%",
        align: "left",
        icon: <BaseIcon name="tooltip" size={16} tooltip={t("tooltip.ratioFormula")} />,
      },
    ],
    [t]
  );

  const tableData: RowData<HomeSolutionUsageTableRow>[] = data.map((item) => ({
    solutionName: toTextCell(item.solutionName),
    usageCount: toTextCell(formatCount(item.usageCount)),
    participantCount: toTextCell(formatCount(item.participantCount)),
    amount: toTextCell(formatCurrency(item.amount)),
    ratio: toTextCell(item.ratio),
  }));

  const totalRowIndex = tableData.length - 1;

  return (
    <BaseTable<HomeSolutionUsageTableRow>
      headers={headers}
      data={tableData}
      headerHeight={34}
      rowHeight={37}
      totalRowIndex={totalRowIndex}
      totalRowHeight={45}
      className={className}
    />
  );
};

export default HomeSolutionUsageTable;
