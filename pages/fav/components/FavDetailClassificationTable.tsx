import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  FavDetailClassificationTableProps,
  FavDetailClassificationTableRow,
} from "@/types/pages/fav";
import BaseTable from "@/components/common/BaseTable/BaseTable";
import BasePagination from "@/components/common/BasePagination";
import BaseIcon from "@/components/common/BaseIcon";
import type { HeaderConfig, RowData } from "@/types/common";
import styles from "./FavDetailClassificationTable.module.scss";

const FavDetailClassificationTable = ({
  data,
  emptyMessage,
  emptyHeight = 210,
  onRowClick,
}: FavDetailClassificationTableProps) => {
  const { t } = useTranslation("pages/fav");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const headers: HeaderConfig<FavDetailClassificationTableRow>[] = [
    { key: "departmentName", label: t("table.header.department"), width: "42.6%", align: "left" },
    { key: "score", label: t("table.header.score"), width: "19.1%", align: "left" },
    { key: "monthlyChange", label: t("table.header.beforeAfter"), width: "19.1%", align: "left" },
    {
      key: "participationRate",
      label: t("usage.header.participationRate"),
      width: "19.1%",
      align: "left",
      icon: (
        <BaseIcon
          name="tooltip"
          size={16}
          tooltip={t("usage.tooltip.participationRate")}
        />
      ),
    },
  ];

  const handleRowClick = (row: RowData<FavDetailClassificationTableRow>) => {
    const item = currentData.find((d) => d.departmentName === row.departmentName.value);
    if (item?.organizationId && onRowClick) {
      onRowClick(item.organizationId);
    }
  };

  const tableData: RowData<FavDetailClassificationTableRow>[] = currentData.map((item) => ({
    departmentName: { type: "text", value: item.departmentName, align: "left" },
    score: { type: "text", value: t("unit.score", { count: item.score }), align: "left" },
    monthlyChange: { type: "change", value: item.monthlyChange, align: "left" },
    participationRate: item.isMasked
      ? { type: "text", value: "-", align: "left" }
      : { type: "text", value: `${item.participationRate}%`, align: "left" },
  }));

  const finalEmptyMessage = emptyMessage || t("usage.emptyMessage");

  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <BaseTable
          headers={headers}
          data={[]}
          headerHeight={34}
          rowHeight={42}
          emptyMessage={finalEmptyMessage}
          emptyHeight={emptyHeight}
        />
        <div className={styles.paginationWrapper}>
          <BasePagination currentPage={1} totalPages={1} onPageChange={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BaseTable
        headers={headers}
        data={tableData}
        headerHeight={34}
        rowHeight={42}
        onRowClick={onRowClick ? handleRowClick : undefined}
      />
      <div className={styles.paginationWrapper}>
        <BasePagination
          currentPage={currentPage}
          totalPages={Math.max(totalPages, 1)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default FavDetailClassificationTable;
