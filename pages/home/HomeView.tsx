import { useTranslation } from "react-i18next";
import {
  // BaseReportDownload,
  BaseCardHeader,
  BaseDateRangeSelector,
  BaseLineChart,
  BasePageHeader,
  BaseSettlementCard,
  BaseSummaryCard,
  BaseEmptyChart,
} from "@/components/common";
import HomeDepartmentTable from "./components/HomeDepartmentTable";
import HomeSolutionUsageTable from "./components/HomeSolutionUsageTable";
import type { HomeViewProps } from "@/types/pages/home";
import { getSelectedMonthLabel } from "@/utils/date";
import styles from "./HomeView.module.scss";

const HomeView = ({
  chartXAxisData,
  chartSeriesData,
  solutionUsageData,
  departmentData,
  summaryCards,
  settlementCards,
  selectedDate,
  startDate,
  endDate,
  onDateChange,
  onNavigateToFavDiagnosis,
  onNavigateToRiskDepartments,
}: HomeViewProps) => {
  const { t, i18n } = useTranslation("pages/home");
  const currentLanguage = i18n.language;
  const selectedMonth = getSelectedMonthLabel(selectedDate, currentLanguage, startDate);

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
      <div className={styles.cardGrid}>
        {summaryCards.map((card, index) => (
          <BaseSummaryCard
            key={index}
            title={card.title}
            value={card.value}
            subValue={card.subValue}
            description={card.description}
            icon={card.icon}
            tag={card.tag}
          />
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{selectedMonth} {t("section.diagnosis")}</h2>
        <div className={styles.sectionContent}>
          <div className={styles.lineChartCard}>
            <BaseCardHeader
              title={t("card.favTrend")}
              onMoreClick={onNavigateToFavDiagnosis}
            />
            {!chartXAxisData.length || !chartSeriesData.length ? (
              <BaseEmptyChart />
            ) : (
              <BaseLineChart
                xAxisData={chartXAxisData}
                seriesData={chartSeriesData}
                tooltipId="home-diagnosis-chart-tooltip"
              />
            )}
          </div>
          <div className={styles.riskDepartmentCard}>
            <BaseCardHeader
              title={t("card.riskDepartment")}
              onMoreClick={onNavigateToRiskDepartments}
            />
            <div className={styles.tableContent}>
              <HomeDepartmentTable data={departmentData} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{selectedMonth} {t("section.usage")}</h2>
        <div className={styles.sectionContentUsage}>
          <div className={styles.solutionUsageCard}>
            <BaseCardHeader title={t("card.solutionUsage")} />
            <div className={styles.cardContent}>
              <HomeSolutionUsageTable data={solutionUsageData} />
            </div>
          </div>
          <div className={styles.settlementCard}>
            <BaseCardHeader
              title={t("card.settlement")}
            />
            <div className={styles.settlementGrid}>
              {settlementCards.map((card, index) => (
                <BaseSettlementCard
                  key={index}
                  title={card.title}
                  tooltip={card.tooltip}
                  mainContent={card.mainContent}
                  trendData={card.trendData}
                  tag={card.tag}
                  percentage={card.percentage}
                  subContent={card.subContent || ""}
                  mainContentColor={card.mainContentColor}
                  percentageColor={card.percentageColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
