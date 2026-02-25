import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BasePageHeader,
  BaseDateRangeSelector,
  // BaseReportDownload,
  BaseFavCardHeader,
  BaseIcon,
  BaseToggle,
  BaseSelectBox,
  BaseCircularProgress,
  BaseLineChart,
} from "@/components/common";
import FavDetailTeamAverageChart from "./components/FavDetailTeamAverageChart";
import FavDetailRiskTrendChart from "./components/FavDetailRiskTrendChart";
import type { FavDetailViewProps } from "@/types/pages/fav";
import styles from "./FavDetailView.module.scss";

const FavDetailView = ({
  selectedDate,
  startDate,
  endDate,
  chartXAxisData,
  chartSeriesData,
  satisfactionValue,
  companyScoreData,
  scoreComparisonData,
  highRiskRatioXAxisData,
  highRiskRatioSeriesData,
  organizationName = "",
  hasNoData = false,
  onDateChange,
  onSelectChange,
  onToggleChange,
  onBackToCompany,
}: FavDetailViewProps) => {
  const { t } = useTranslation("pages/fav");

  // 고위험군 비율 변화 차트 props를 useMemo로 감싸서 불필요한 리렌더링 방지
  const memoizedHighRiskRatioXAxisData = useMemo(
    () => highRiskRatioXAxisData,
    [highRiskRatioXAxisData]
  );

  const memoizedHighRiskRatioSeriesData = useMemo(
    () => highRiskRatioSeriesData,
    [highRiskRatioSeriesData]
  );

  return (
    <div className={styles.container}>
      <BasePageHeader
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BaseIcon
              name="back"
              size={20}
              color="#171717"
              onClick={onBackToCompany}
              style={{ cursor: "pointer" }}
            />
            {organizationName || t("noOrganization")}
          </div>
        }
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
        <div className={styles.mainContainer}>
          {/* Left Group */}
          <div className={styles.leftGroup}>
            {/* 조직 마음 건강 점수 */}
            <div className={styles.companyScore}>
              <BaseFavCardHeader
                title={t("detail.organizationHealthScore", { name: organizationName })}
                description={t("detail.organizationHealthDescription")}
                tooltip={t("detail.scoreTooltip")}
                rightContent={
                  !companyScoreData.isMasked ? (
                    <div className={styles.participationInfo}>
                      <BaseIcon name="user" size={18} color="#666666" />
                      <div className={styles.participationText}>
                        <span className={styles.totalCount}>
                          {t("detail.total")} {t("unit.people", { count: companyScoreData.totalCount })}
                        </span>
                        <span className={styles.separator}>{t("detail.separator")}</span>
                        <span className={styles.label}>{t("detail.participation")}</span>
                        <span className={styles.participated}>
                          {t("detail.participationInfo", {
                            count: companyScoreData.participatedCount,
                            rate: companyScoreData.participationRate
                          })}
                        </span>
                      </div>
                    </div>
                  ) : null
                }
              />
              <div className={styles.cardContent}>
                <div className={styles.healthScoreContent}>
                  {/* Left: Company mental health score */}
                  <div className={styles.overallScore}>
                    <div className={styles.scoreDisplay}>
                      <div className={styles.scoreInfo}>
                        <div className={styles.scoreValue}>
                          {companyScoreData.score}
                          {t("unit.point")}
                        </div>
                        <div
                          className={styles.scoreChange}
                          style={{
                            color:
                              companyScoreData.scoreDiff === 0
                                ? "#AAAAAA"
                                : undefined,
                          }}
                        >
                          {companyScoreData.scoreDiff === 0
                            ? "-"
                            : `${companyScoreData.scoreDiff > 0 ? "↑" : "↓"} ${Math.abs(companyScoreData.scoreDiff)}`}
                        </div>
                      </div>
                      {companyScoreData.comparisonText && (
                        <div className={styles.scoreDescription}>
                          {companyScoreData.comparisonText}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Stress, Anxiety, Depression */}
                  {companyScoreData.isMasked ? (
                    <div className={styles.maskedMessage}>
                      {t("detail.maskedMessage")}
                    </div>
                  ) : (
                    <div className={styles.indicators}>
                      <BaseCircularProgress
                        value={companyScoreData.stressValue}
                        status={companyScoreData.stressStatus}
                        indicatorType="stress"
                        label={t("label.stress")}
                        customStatusLabel={hasNoData ? "-" : undefined}
                      />
                      <BaseCircularProgress
                        value={companyScoreData.anxietyValue}
                        status={companyScoreData.anxietyStatus}
                        indicatorType="anxiety"
                        label={t("label.anxiety")}
                        customStatusLabel={hasNoData ? "-" : undefined}
                      />
                      <BaseCircularProgress
                        value={companyScoreData.depressionValue}
                        status={companyScoreData.depressionStatus}
                        indicatorType="depression"
                        label={t("label.depression")}
                        customStatusLabel={hasNoData ? "-" : undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 두 번째 행 - 응답률 & 팀 평균 대비 차이 */}
            <div className={styles.bottomRow}>
              <div className={styles.responseRate}>
                <BaseFavCardHeader
                  title={t("detail.responseRate")}
                  description={t("detail.responseRateDescription")}
                />
                <div className={styles.cardContent}>
                  {companyScoreData.isMasked ? (
                    <div className={styles.maskedMessage}>
                      {t("detail.maskedMessage")}
                    </div>
                  ) : (
                    <div className={styles.responseRateContent}>
                      <BaseCircularProgress
                        value={satisfactionValue}
                        customSize={162}
                        customColor="#2F6C46"
                        customBackgroundColor="#F0F0F0"
                        showStatus={false}
                        showPercentage={true}
                      />
                      <div className={styles.responseDescription}>
                        {t("detail.responseParticipation", {
                          total: companyScoreData.totalCount,
                          participated: companyScoreData.participatedCount
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.teamAverage}>
                <BaseFavCardHeader
                  title={t("detail.teamAverageDiff")}
                  description={t("detail.teamAverageDiffDescription")}
                />
                <div className={styles.cardContent}>
                  <FavDetailTeamAverageChart data={scoreComparisonData} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Group */}
          <div className={styles.rightGroup}>
            {/* 마음 건강 추이 */}
            <div className={styles.healthTrend}>
              <BaseFavCardHeader
                title={t("detail.healthTrend")}
                description={t("detail.healthTrendDescription")}
                rightContent={
                  <div className={styles.trendControls}>
                    <BaseSelectBox
                      options={[
                        t("select.overall"),
                        t("select.stress"),
                        t("select.anxiety"),
                        t("select.depression")
                      ]}
                      defaultValue={t("select.overall")}
                      width={94}
                      height={34}
                      onChange={onSelectChange}
                    />
                    <BaseToggle
                      tabs={[t("toggle.week1"), t("toggle.week4"), t("toggle.week8")]}
                      defaultTab={t("toggle.week4")}
                      height={34}
                      onChange={onToggleChange}
                    />
                  </div>
                }
              />
              <div className={styles.cardContent}>
                <BaseLineChart
                  xAxisData={chartXAxisData}
                  seriesData={chartSeriesData}
                  tooltipId="fav-detail-diagnosis-chart-tooltip"
                />
              </div>
            </div>

            {/* 고위험군 비율 변화 */}
            <div className={styles.riskTrend}>
              <BaseFavCardHeader
                title={t("detail.riskTrend")}
                description={t("detail.riskTrendDescription")}
              />
              <div className={styles.cardContent}>
                <FavDetailRiskTrendChart
                  xAxisData={memoizedHighRiskRatioXAxisData}
                  seriesData={memoizedHighRiskRatioSeriesData}
                  tooltipId="risk-trend-chart-tooltip"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavDetailView;
