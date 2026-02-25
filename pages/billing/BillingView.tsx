import { useTranslation } from "react-i18next";
import {
  BasePageHeader,
  BaseCardHeader,
  BaseSettlementCard,
  BaseTable,
  BaseIcon,
  BaseFilterSelect,
  BasePagination,
  BaseDateRangeSelector,
  BaseButton,
} from "@/components/common";
import { toTextCell, formatCount, formatCurrency } from "@/utils";
import type { RowData } from "@/types";
import type {
  BillingMonthlyHistoryRow,
  BillingSolutionUsageRow,
  BillingViewProps,
} from "@/types/pages/billing";
import styles from "./BillingView.module.scss";

const BillingView = ({
  settlementData,
  solutionUsageData,
  solutionUsageHeaders,
  monthlyHistoryHeaders,
  formattedMonthlyData,
  yearOptions,
  selectedYear,
  setSelectedYear,
  currentPage,
  setCurrentPage,
  totalPages,
  selectedDate,
  startDate,
  endDate,
  onDateChange,
  onSolutionUsageExcelDownload,
  isSolutionUsageExcelDownloading,
  onMonthlyHistoryExcelDownload,
  isMonthlyHistoryExcelDownloading,
}: BillingViewProps) => {
  const { t } = useTranslation("pages/billing");

  const solutionUsageTableData: RowData<BillingSolutionUsageRow>[] =
    solutionUsageData.map((item) => ({
      productName: toTextCell(item.productName),
      usageCount: toTextCell(formatCount(item.usageCount)),
      usageUsers: toTextCell(formatCount(item.usageUsers)),
      totalAmount: toTextCell(formatCurrency(item.totalAmount)),
      ratio: toTextCell(item.ratio),
    }));

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
              disabled={isSolutionUsageExcelDownloading}
              aria-busy={isSolutionUsageExcelDownloading}
              onClick={onSolutionUsageExcelDownload}
            >
              {t("button.downloadExcel")}
            </BaseButton>
          </>
        }
      />

      <div className={styles.section}>
        <div className={styles.firstRow}>
          <div className={styles.settlementCard}>
            <BaseCardHeader title={t("section.summary")} subtitle={t("section.summaryPeriod")} />
            <div className={styles.cardContent}>
              <div className={styles.settlementGrid}>
                {settlementData.map((item) => (
                  <BaseSettlementCard
                    key={item.title}
                    title={item.title}
                    tooltip={item.tooltip}
                    mainContent={item.mainContent}
                    trendData={item.trendData}
                    tag={item.tag}
                    percentage={item.percentage}
                    subContent={item.subContent}
                    mainContentColor={item.mainContentColor}
                    percentageColor={item.percentageColor}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={styles.solutionUsageCard}>
            <BaseCardHeader title={t("section.productUsage")} />
            <div className={styles.cardContent}>
              <BaseTable<BillingSolutionUsageRow>
                headers={solutionUsageHeaders}
                data={solutionUsageTableData}
                headerHeight={34}
                rowHeight={37}
                totalRowIndex={solutionUsageTableData.length - 1}
                totalRowHeight={45}
              />
            </div>
          </div>
        </div>

        <div className={styles.secondRow}>
          <div className={styles.monthlyHistoryCard}>
            <div className={styles.monthlyHistoryHeader}>
              <BaseCardHeader title={t("section.monthlyUsage")} />
              <div className={styles.filterActions}>
                <BaseFilterSelect
                  label={t("filter.year")}
                  placeholder={t("placeholder.select")}
                  options={yearOptions}
                  defaultValue={selectedYear}
                  width={136}
                  height={34}
                  onChange={setSelectedYear}
                />
                <button
                  type="button"
                  className={styles.downloadButton}
                  aria-label={t("aria.downloadHistory")}
                  onClick={onMonthlyHistoryExcelDownload}
                  disabled={isMonthlyHistoryExcelDownloading}
                  aria-busy={isMonthlyHistoryExcelDownloading}
                >
                  <BaseIcon name="download" size={20} color="#666666" />
                </button>
              </div>
            </div>
            <div className={styles.monthlyHistoryContent}>
              <BaseTable<BillingMonthlyHistoryRow>
                headers={monthlyHistoryHeaders}
                data={formattedMonthlyData}
                headerHeight={34}
                rowHeight={37}
              />
              <div className={styles.paginationWrapper}>
                <BasePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
