import { useTranslation } from "react-i18next";
import {
  BaseDateRangeSelector,
  BasePageHeader,
  BaseCardHeader,
  BaseTable,
  BasePagination,
  BaseSearchInput,
  BaseFilterReset,
  BaseButton,
} from "@/components/common";
import type {
  TeamUsageRow,
  TeamUsageViewProps,
} from "@/types/pages/team-usage";
import styles from "./TeamUsageView.module.scss";

const TeamUsageView = <T extends TeamUsageRow>({
  headers,
  tableData,
  currentPage,
  totalPages,
  totalTeams,
  isExcelDownloading,
  selectedDate,
  startDate,
  endDate,
  onPageChange,
  onSort,
  onDateChange,
  searchKeyword,
  onSearchKeywordChange,
  onSearchKeywordSubmit,
  onFilterReset,
  onExcelDownload,
}: TeamUsageViewProps<T>) => {
  const { t } = useTranslation("pages/teamUsage");

  return (
    <div className={styles.container}>
      <BasePageHeader
        title={t("title")}
        action={
          <>
            <BaseDateRangeSelector
              selectedDate={selectedDate}
              startDate={startDate}
              endDate={endDate}
              onDateChange={onDateChange}
            />
            <BaseButton
              variant="custom"
              icon="download"
              iconPosition="left"
              iconSize={16}
              iconColor="#FFFFFF"
              disabled={isExcelDownloading}
              onClick={onExcelDownload}
            >
              {isExcelDownloading ? t("button.downloading") : t("button.downloadExcel")}
            </BaseButton>
          </>
        }
      />

      <div className={styles.content}>
        <div className={styles.card}>
          <BaseCardHeader title={t("card.teamList", { count: totalTeams })} />

          <div className={styles.filterWrapper}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <BaseSearchInput
                placeholder={t("placeholder.search")}
                value={searchKeyword}
                onChange={onSearchKeywordChange}
                onSearch={onSearchKeywordSubmit}
              />
              <div className={styles.filterReset}>
                <BaseFilterReset onClick={onFilterReset} />
              </div>
            </div>
          </div>

          <BaseTable<T>
            headers={headers}
            data={tableData}
            onSort={onSort}
            headerHeight={34}
            rowHeight={37}
            bodyFontSize={13}
            bodyLineHeight="130%"
            bodyTextColor="#333333"
            enableRowHover
          />

          <div className={styles.paginationWrapper}>
            <BasePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamUsageView;
