import { useTranslation } from "react-i18next";
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
import PsyCounselingMonthlyTrendChart from "../psy-counseling/components/PsyCounselingMonthlyTrendChart";
import { getSelectedMonthLabel } from "@/utils/date";
import type {
  CoachingTableRow,
  CoachingViewProps,
} from "@/types/pages/coaching";
import styles from "./CoachingView.module.scss";

const CoachingView = ({
  headers,
  data,
  currentPage,
  totalPages,
  searchValue,
  sortKey,
  sortDirection,
  statsCards,
  xAxisData,
  seriesData,
  donutChartData,
  satisfactionData,
  satisfactionProgressData,
  mostSelectedTopicsProgressData,
  monthlyTrendData,
  isCoachingTypeDataEmpty,
  isMostSelectedTopicsDataEmpty,
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
}: CoachingViewProps) => {
  const { t, i18n } = useTranslation("pages/coaching");

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
                tooltipId="coaching-usage-chart"
              />
            </div>
          </div>
          <div className={styles.rightCard}>
            <BaseCardHeader title={t("section.coachingTypeDistribution")} />
            {isCoachingTypeDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <BaseDonutChart
                data={donutChartData}
                size={200}
                legendPosition="bottom"
                showPercentageOnly={true}
              />
            )}
          </div>
        </div>

        <div className={styles.secondRow}>
          <div className={styles.cardOne}>
            <BaseCardHeader
              title={t("section.satisfaction")}
              tooltip={t("tooltip.satisfactionNote")}
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
                {t("tag.coaching", { count: satisfactionData.totalCoaching })}
              </div>
              <div className={styles.tag}>
                {t("tag.response", { count: satisfactionData.totalResponse })}
              </div>
              <div className={styles.tag}>
                {t("tag.responseRate", { rate: satisfactionData.responseRate })}
              </div>
            </div>
            <div className={styles.progressBarWrapper}>
              <BaseProgressBar
                items={satisfactionProgressData}
                labelWidth="30px"
                valueSectionWidth="70px"
                valueFormat="default"
              />
            </div>
          </div>
          <div className={styles.cardTwo}>
            <BaseCardHeader title={t("section.mostSelectedTopics")} />
            {isMostSelectedTopicsDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <div className={styles.progressBarWrapper}>
                <BaseProgressBar
                  items={mostSelectedTopicsProgressData}
                  layout="vertical"
                  valueSectionWidth="120px"
                  valueFormat="countWithPercentage"
                  labelFontSize="13px"
                  labelFontWeight={400}
                  labelLineHeight="130%"
                />
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
                <BaseEmptyChart message={t("message.noSearchResult")} />
              </div>
            ) : (
              <>
                <BaseTable<CoachingTableRow>
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

export default CoachingView;
