import { useTranslation } from "react-i18next";
// import React from "react";
import {
  BasePageHeader,
  BaseDateRangeSelector,
  // BaseReportDownload,
  BaseCardHeader,
  BaseStatCard,
  BaseLineChart,
  BaseDonutChart,
  BaseSearchInput,
  BaseTable,
  BasePagination,
  BaseProgressBar,
  BaseEmptyChart,
} from "@/components/common";
import PsyCounselingTopicRatioChart from "./components/PsyCounselingTopicRatioChart";
import PsyCounselingMonthlyTrendChart from "./components/PsyCounselingMonthlyTrendChart";
import { getSelectedMonthLabel } from "@/utils/date";
import type {
  PsyCounselingTableRow,
  PsyCounselingViewProps,
} from "@/types/pages/psy-counseling";
import styles from "./PsyCounselingView.module.scss";

const PsyCounselingView = <T extends PsyCounselingTableRow>({
  currentPage,
  totalPages,
  searchValue,
  sortKey,
  sortDirection,
  headers,
  data,
  statsCards,
  xAxisData,
  seriesData,
  satisfactionData,
  satisfactionProgressData,
  topicRatioData,
  monthlyTrendData,
  counselingTypeData,
  isCounselingTypeDataEmpty,
  isTopicRatioDataEmpty,
  isMonthlyTrendDataEmpty,
  isDepartmentTableEmpty,
  isSearchActive,
  selectedDate,
  startDate,
  endDate,
  onSort,
  onPageChange,
  onSearchChange,
  onSearch,
  onDateChange,
}: PsyCounselingViewProps<T>) => {
  const { t, i18n } = useTranslation("pages/psyCounseling");

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
                  value={card.value}
                  // hasAlert={card.hasAlert}
                />
              ))}
            </div>
            <div className={styles.chartContainer}>
              <BaseLineChart
                xAxisData={xAxisData}
                seriesData={seriesData}
                tooltipId="psy-counseling-usage-chart"
              />
            </div>
          </div>
          <div className={styles.rightCard}>
            <BaseCardHeader title={t("section.typeDistribution")} />
            {isCounselingTypeDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <BaseDonutChart
                data={counselingTypeData}
                size={200}
                legendPosition="bottom"
                legendUnit={t("unit.session")}
              />
            )}
          </div>
        </div>

        <div className={styles.secondRow}>
          <div className={styles.cardOne}>
            <BaseCardHeader
              title={t("section.satisfaction")}
              tooltip={t("label.satisfactionNote")}
            />
            <div className={styles.satisfactionScore}>
              <span className={styles.scoreValue}>
                {satisfactionData.score}
              </span>
              <span className={styles.scoreMax}>
                / {satisfactionData.maxScore}
              </span>
            </div>
            <div className={styles.tagContainer}>
              <div className={styles.tag}>
                {t("label.counselingCount", { count: satisfactionData.totalCounseling })}
              </div>
              <div className={styles.tag}>
                {t("label.responseCount", { count: satisfactionData.totalResponse })}
              </div>
              <div className={styles.tag}>
                {t("label.responseRate", { rate: satisfactionData.responseRate })}
              </div>
            </div>
            <div className={styles.progressBarWrapper}>
              <BaseProgressBar
                items={satisfactionProgressData}
                labelWidth="30px"
                valueSectionWidth="70px"
                // valueFormat="count"
              />
            </div>
          </div>
          <div className={styles.cardTwo}>
            <BaseCardHeader title={t("section.topicRatio")} />
            {isTopicRatioDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <div className={styles.chartContent}>
                <PsyCounselingTopicRatioChart data={topicRatioData} />
              </div>
            )}
          </div>
          <div className={styles.cardThree}>
            <BaseCardHeader title={t("section.monthlyTrend")} />
            {isMonthlyTrendDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <div className={styles.chartContent}>
                <PsyCounselingMonthlyTrendChart data={monthlyTrendData} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.thirdRow}>
          <div className={styles.fullWidthCard}>
            <div className={styles.cardHeaderWrapper}>
              <BaseCardHeader title={t("section.departmentUsage")} />
              <BaseSearchInput
                placeholder={t("placeholder.search")}
                value={searchValue}
                onChange={onSearchChange}
                onSearch={onSearch}
                height={34}
                disabled={isDepartmentTableEmpty && !isSearchActive}
              />
            </div>
            {isDepartmentTableEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart
                  message={isSearchActive ? t("message.noSearchResult") : t("message.noData")}
                />
              </div>
            ) : (
              <>
                <BaseTable<T>
                  headers={headers}
                  data={data}
                  onSort={onSort}
                  defaultSortKey={sortKey}
                  defaultSortDirection={sortDirection}
                  headerHeight={34}
                  rowHeight={37}
                  bodyFontSize={13}
                  bodyLineHeight="130%"
                  bodyTextColor="#333333"
                  emptyHeight={295}
                />
                <div className={styles.paginationWrapper}>
                  <BasePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsyCounselingView;
