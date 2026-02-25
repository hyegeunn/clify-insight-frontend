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
import styles from "./PsyTestView.module.scss";
import type {
  PsyTestTableRow,
  PsyTestViewProps,
  AssessmentUsageRow,
} from "@/types/pages/psy-test";

const PsyTestView = <T extends PsyTestTableRow>({
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
  // satisfactionData, // TODO:: 검사 만족도 - 추후 사용 예정
  // satisfactionProgressData, // TODO:: 검사 만족도 - 추후 사용 예정
  mostUsedTestsProgressData,
  testTypeData,
  monthlyTrendData,
  isTestTypeDataEmpty,
  isMostUsedTestsDataEmpty,
  isMonthlyTrendDataEmpty,
  isDepartmentTableEmpty,
  isSearchActive,
  assessmentHeaders,
  assessmentData,
  assessmentCurrentPage,
  assessmentTotalPages,
  assessmentSortKey,
  assessmentSortDirection,
  isAssessmentTableEmpty,
  selectedDate,
  startDate,
  endDate,
  onSort,
  onPageChange,
  onSearchChange,
  onSearch,
  onAssessmentSort,
  onAssessmentPageChange,
  onAssessmentRowClick,
  onDateChange,
}: PsyTestViewProps<T>) => {
  const { t, i18n } = useTranslation("pages/psyTest");

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
              title={t("section.monthlyUsage", {
                month: getSelectedMonthLabel(selectedDate, i18n.language, startDate),
              })}
            />
            <div className={styles.statsGrid}>
              {statsCards.map((card, index) => (
                <BaseStatCard
                  key={index}
                  label={t(`label.${card.label}`)}
                  value={card.value}
                  // hasAlert={card.hasAlert}
                />
              ))}
            </div>
            <div className={styles.chartContainer}>
              <BaseLineChart
                xAxisData={xAxisData}
                seriesData={seriesData}
                tooltipId="psy-test-usage-chart"
              />
            </div>
          </div>
          <div className={styles.rightCard}>
            <BaseCardHeader
              title={t("section.typeDistribution")}
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
          {/* TODO:: 검사 만족도 - 추후 사용 예정
          <div className={styles.leftCard}>
            <BaseCardHeader
              title="검사 만족도"
              tooltip="비대면 심리검사 만족도만 집계에 포함됩니다"
            />
            <div className={styles.satisfactionScore}>
              <span className={styles.scoreValue}>
                {satisfactionData?.score}
              </span>
              <span className={styles.scoreMax}>
                / {satisfactionData?.maxScore}
              </span>
            </div>
            <div className={styles.tagContainer}>
              <div className={styles.tag}>
                {t("label.testCount", { count: satisfactionData?.totalTests || 0 })}
              </div>
              <div className={styles.tag}>
                {t("label.responseCount", { count: satisfactionData?.totalResponse || 0 })}
              </div>
              <div className={styles.tag}>
                {t("label.responseRate", { rate: satisfactionData?.responseRate || "0%" })}
              </div>
            </div>
            <div className={styles.progressBarWrapper}>
              <BaseProgressBar
                items={satisfactionProgressData || []}
                labelWidth="30px"
                valueSectionWidth="70px"
                valueFormat="count"
              />
            </div>
          </div>
          */}
          <div className={styles.leftCard}>
            <BaseCardHeader title={t("section.topTests")} />
            {isMostUsedTestsDataEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <div className={styles.progressBarWrapper}>
                <BaseProgressBar
                  items={mostUsedTestsProgressData}
                  layout="vertical"
                  valueFormat="countWithPercentage"
                  labelFontSize="13px"
                  labelFontWeight={600}
                  labelLineHeight="130%"
                  labelColor="#333333"
                  itemGap="28px"
                />
              </div>
            )}
          </div>
          <div className={styles.rightCard}>
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
          <div className={styles.leftCard}>
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
          <div className={styles.rightCard}>
            <div className={styles.cardHeaderWrapper}>
              <BaseCardHeader
                title={t("section.testUsage")}
                tooltip={t("label.testDetailNote")}
              />
            </div>
            {isAssessmentTableEmpty ? (
              <div className={styles.emptyChartWrapper}>
                <BaseEmptyChart />
              </div>
            ) : (
              <>
                <BaseTable<AssessmentUsageRow>
                  headers={assessmentHeaders}
                  data={assessmentData}
                  onSort={onAssessmentSort}
                  defaultSortKey={assessmentSortKey}
                  defaultSortDirection={assessmentSortDirection}
                  headerHeight={34}
                  rowHeight={37}
                  bodyFontSize={13}
                  bodyLineHeight="130%"
                  bodyTextColor="#333333"
                  emptyHeight={295}
                  customRowClassName={styles.assessmentTableRow}
                  onRowClick={onAssessmentRowClick}
                />
                <div className={styles.paginationWrapper}>
                  <BasePagination
                    currentPage={assessmentCurrentPage}
                    totalPages={assessmentTotalPages}
                    onPageChange={onAssessmentPageChange}
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

export default PsyTestView;
