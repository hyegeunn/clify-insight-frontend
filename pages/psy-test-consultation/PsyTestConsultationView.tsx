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
  BaseLoader,
} from "@/components/common";
import { getSelectedMonthLabel } from "@/utils/date";
import styles from "./PsyTestConsultationView.module.scss";
import type { PsyTestConsultationTableRow, PsyTestConsultationViewProps } from "@/types/pages/psy-test-consultation";

const PsyTestConsultationView = <T extends PsyTestConsultationTableRow>({
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
  satisfactionData,
  satisfactionProgressData,
  mostUsedTestsProgressData,
  testTypeData,
  isTestTypeDataEmpty,
  isMostUsedTestsDataEmpty,
  isDepartmentTableEmpty,
  isSearchActive,
  isMostUsedTestsLoading,
  mostUsedTestsCurrentPage,
  mostUsedTestsTotalPages,
  onMostUsedTestsPageChange,
  selectedDate,
  startDate,
  endDate,
  onSort,
  onPageChange,
  onSearchChange,
  onSearch,
  onDateChange,
}: PsyTestConsultationViewProps<T>) => {
  const { t, i18n } = useTranslation("pages/psyTestConsultation");

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
                tooltipId="psy-test-consultation-usage-chart"
              />
            </div>
          </div>
          <div className={styles.rightCard}>
            <BaseCardHeader
              title={t("section.testTypeDistribution")}
            />
            {isTestTypeDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <BaseDonutChart
                data={testTypeData}
                size={200}
                legendPosition="bottom"
                legendUnit={t("unit.count")}
                showPercentageAndCount={true}
              />
            )}
          </div>
        </div>

        <div className={styles.secondRow}>
          <div className={styles.leftCard}>
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
                {t("tag.test", { count: satisfactionData.totalTests })}
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
          <div className={styles.rightCard}>
            <BaseCardHeader title={t("section.mostUsedTests")} />
            {isMostUsedTestsLoading ? (
              <div className={styles.loadingWrapper}>
                <BaseLoader />
              </div>
            ) : isMostUsedTestsDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <>
                <div className={styles.progressBarWrapper}>
                  <BaseProgressBar
                    items={mostUsedTestsProgressData}
                    labelWidth="200px"
                    valueSectionWidth="120px"
                    valueFormat="countWithPercentage"
                    labelFontSize="13px"
                    labelFontWeight={400}
                    labelLineHeight="130%"
                    innerGap="6px"
                  />
                </div>
                {mostUsedTestsTotalPages > 1 && (
                  <div className={styles.paginationWrapper}>
                    <BasePagination
                      currentPage={mostUsedTestsCurrentPage}
                      totalPages={mostUsedTestsTotalPages}
                      onPageChange={onMostUsedTestsPageChange}
                    />
                  </div>
                )}
              </>
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

export default PsyTestConsultationView;

