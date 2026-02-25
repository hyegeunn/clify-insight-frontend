import { useTranslation } from "react-i18next";
import {
  BasePageHeader,
  BaseDateRangeSelector,
  // BaseReportDownload,
  BaseCardHeader,
  BaseStatCard,
  BaseLineChart,
  BaseSearchInput,
  BaseTable,
  BasePagination,
  BaseEmptyChart,
} from "@/components/common";
import { getSelectedMonthLabel } from "@/utils/date";
import styles from "./PartnerView.module.scss";
import type {
  PartnerDepartmentRow,
  PartnerServiceRow,
  PartnerViewProps,
} from "@/types/pages/partner";

const PartnerView = <
  D extends PartnerDepartmentRow,
  S extends PartnerServiceRow
>({
  selectedDate,
  startDate,
  endDate,
  currentDeptPage,
  totalDeptPages,
  currentServicePage,
  totalServicePages,
  searchValue,
  deptSortKey,
  deptSortDirection,
  serviceSortKey,
  serviceSortDirection,
  statsCards,
  xAxisData,
  seriesData,
  departmentHeaders,
  departmentData,
  serviceHeaders,
  serviceData,
  isDepartmentTableEmpty,
  isSearchActive,
  onDateChange,
  onDeptSort,
  onServiceSort,
  onDeptPageChange,
  onServicePageChange,
  onDeptSearchChange,
  onDeptSearch,
}: PartnerViewProps<D, S>) => {
  const { t, i18n } = useTranslation("pages/partner");

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
            {/* <BaseReportDownload selectedDate={selectedDate} /> */}
          </>
        }
      />

      <div className={styles.content}>
        <div className={styles.firstRow}>
          <div className={styles.leftCard}>
            <BaseCardHeader
              title={t("section.monthlyUsage", { month: getSelectedMonthLabel(selectedDate, i18n.language, startDate) })}
            />
            <div className={styles.statsGrid}>
              {statsCards.map((card, index) => (
                <BaseStatCard
                  key={index}
                  label={card.label}
                  value={card.label === t("card.purchaseAmount") ? `₩${card.value.toLocaleString()}` : card.value}
                />
              ))}
            </div>
            <div className={styles.chartContainer}>
              <BaseLineChart
                xAxisData={xAxisData}
                seriesData={seriesData}
                tooltipId="partnership-usage-chart"
              />
            </div>
          </div>
          <div className={styles.rightCard}>
            <div className={styles.cardHeaderWrapper}>
              <BaseCardHeader title={t("section.departmentUsage")} />
              <BaseSearchInput
                placeholder={t("placeholder.search")}
                value={searchValue}
                onChange={onDeptSearchChange}
                onSearch={onDeptSearch}
                height={34}
                disabled={isDepartmentTableEmpty && !isSearchActive}
              />
            </div>
            {isDepartmentTableEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart message={t("message.noSearchResult")} />
              </div>
            ) : (
              <>
                <BaseTable<D>
                  headers={departmentHeaders}
                  data={departmentData}
                  onSort={onDeptSort}
                  defaultSortKey={deptSortKey}
                  defaultSortDirection={deptSortDirection}
                  headerHeight={34}
                  rowHeight={37}
                  bodyFontSize={13}
                  bodyLineHeight="130%"
                  bodyTextColor="#333333"
                  emptyHeight={218}
                />
                <div className={styles.paginationWrapper}>
                  <BasePagination
                    currentPage={currentDeptPage}
                    totalPages={totalDeptPages}
                    onPageChange={onDeptPageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.secondRow}>
          <div className={styles.fullWidthCard}>
            <div className={styles.cardHeaderWrapper}>
              <BaseCardHeader title={t("section.serviceDetail")} />
            </div>

            <BaseTable<S>
              headers={serviceHeaders}
              data={serviceData}
              onSort={onServiceSort}
              defaultSortKey={serviceSortKey}
              defaultSortDirection={serviceSortDirection}
              headerHeight={34}
              rowHeight={37}
              bodyFontSize={13}
              bodyLineHeight="130%"
              bodyTextColor="#333333"
              emptyHeight={295}
            />
            {serviceData.length > 0 && (
              <div className={styles.paginationWrapper}>
                <BasePagination
                  currentPage={currentServicePage}
                  totalPages={totalServicePages}
                  onPageChange={onServicePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerView;
