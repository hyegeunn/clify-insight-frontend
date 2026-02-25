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
  BaseOrganizationCard,
  BaseStatusCard,
  BaseDonutChart,
  BaseLineChart,
  BaseEmptyChart,
  BasePagination,
} from "@/components/common";
import FavRankingTable from "./components/FavRankingTable";
import FavChangeRateTable from "./components/FavChangeRateTable";
import FavDetailClassificationCard from "./components/FavDetailClassificationCard";
import FavUsageStatusTable from "./components/FavUsageStatusTable";
import type { FavViewProps } from "@/types/pages/fav";
import styles from "./FavView.module.scss";

const FavView = ({
  activeTab,
  direction,
  chartXAxisData,
  chartSeriesData,
  rankingData,
  changeRateData,
  companyScoreData,
  organizationDataList,
  statusCardDataList,
  donutChartData,
  detailClassificationCards,
  participatingTeams,
  participatingMembers,
  nonParticipatingTeams,
  nonParticipatingMembers,
  usageStatusData,
  usageCurrentPage,
  usageTotalPages,
  selectedDate,
  startDate,
  endDate,
  isCompanyDashboard,
  organizationName,
  onTabChange,
  onNavigateToList,
  onDateChange,
  onScoreTypeChange,
  onWeeksChange,
  sortBy,
  sortDirection,
  onSort,
  onUsagePageChange,
  onOrganizationClick,
  onBackToCompany,
  hasNoData = false,
}: FavViewProps) => {
  const { t } = useTranslation("pages/fav");
  const isEmptyStatusSummary =
    hasNoData ||
    statusCardDataList.every(
      (card) => (card.teamCount ?? 0) === 0 && (card.totalMembers ?? 0) === 0
    );
  return (
    <div className={styles.container}>
      <BasePageHeader
        title={
          !isCompanyDashboard ? (
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
          ) : (
            t("title")
          )
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

      {isCompanyDashboard && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "dashboard" ? styles.active : ""
            }`}
            onClick={() => onTabChange("dashboard")}
          >
            {t("tab.dashboard")}
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "status" ? styles.active : ""
            }`}
            onClick={() => onTabChange("status")}
          >
            {t("tab.classification")}
          </button>
          {/* TODO:: 부서별 이용 현황 탭 오픈 전까지 임시 숨김 처리 */}
          {/* <button
            className={`${styles.tab} ${
              activeTab === "usage" ? styles.active : ""
            }`}
            onClick={() => onTabChange("usage")}
          >
            부서별 이용 현황
          </button> */}
        </div>
      )}

      <div
        className={`${styles.content} ${styles[`slide-${direction}`]}`}
        key={activeTab}
      >
        {activeTab === "dashboard" && (
          <div className={styles.dashboard}>
            {/* 첫 번째 행 */}
            <div className={styles.firstRow}>
              <div className={styles.companyScore}>
                <BaseFavCardHeader
                  title={
                    isCompanyDashboard
                      ? t("section.companyScore")
                      : `${organizationName} ${t("section.organizationScore")}`
                  }
                  description={t("label.averageScore")}
                  tooltip={t("label.scoreDescription")}
                  rightContent={
                    !companyScoreData.isMasked && !hasNoData ? (
                      <div className={styles.participationInfo}>
                        <BaseIcon name="user" size={18} color="#666666" />
                        <div className={styles.participationText}>
                          <span className={styles.totalCount}>
                            {t("label.totalCount", {
                              count: companyScoreData.totalCount,
                            })}
                          </span>
                          <span className={styles.separator}>|</span>
                          <span className={styles.label}>
                            {t("label.participation")}
                          </span>
                          <span className={styles.participated}>
                            {t("label.participationCount", {
                              count: companyScoreData.participatedCount,
                              rate: companyScoreData.participationRate,
                            })}
                          </span>
                        </div>
                      </div>
                    ) : null
                  }
                />
                {/* 컨텐츠 영역 */}
                <div className={styles.cardContent}>
                  {hasNoData ? (
                    <BaseEmptyChart />
                  ) : (
                    <div className={styles.healthScoreContent}>
                      {/* 왼쪽: 전사 마음 건강 점수 */}
                      <div className={styles.overallScore}>
                        {/* 점수 표시 영역 */}
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

                      {/* 오른쪽: 스트레스, 불안, 우울 */}
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
                          />
                          <BaseCircularProgress
                            value={companyScoreData.anxietyValue}
                            status={companyScoreData.anxietyStatus}
                            indicatorType="anxiety"
                            label={t("label.anxiety")}
                          />
                          <BaseCircularProgress
                            value={companyScoreData.depressionValue}
                            status={companyScoreData.depressionStatus}
                            indicatorType="depression"
                            label={t("label.depression")}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.healthTrend}>
                <BaseFavCardHeader
                  title={t("section.trend")}
                  description={t("label.trendDescription")}
                  rightContent={
                    <div className={styles.trendControls}>
                      <BaseSelectBox
                        options={[
                          t("select.overall"),
                          t("select.stress"),
                          t("select.anxiety"),
                          t("select.depression"),
                        ]}
                        defaultValue={t("select.overall")}
                        width={94}
                        height={34}
                        onChange={onScoreTypeChange}
                      />
                      <BaseToggle
                        tabs={[
                          t("toggle.week1"),
                          t("toggle.week4"),
                          t("toggle.week8"),
                        ]}
                        defaultTab={t("toggle.week4")}
                        height={34}
                        onChange={onWeeksChange}
                      />
                    </div>
                  }
                />
                <div className={styles.cardContent}>
                  {hasNoData ? (
                    <BaseEmptyChart />
                  ) : (
                    <BaseLineChart
                      xAxisData={chartXAxisData}
                      seriesData={chartSeriesData}
                      tooltipId="fav-diagnosis-chart-tooltip"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 두 번째 행 */}
            <div className={styles.secondRow}>
              <div className={styles.scoreSummary}>
                <BaseFavCardHeader
                  title={t("section.summary")}
                  description={t("label.summaryDescription")}
                  rightContent={
                    <button
                      className={styles.viewAllButton}
                      onClick={onNavigateToList}
                    >
                      {t("button.viewAll")}
                    </button>
                  }
                />
                <div className={styles.cardContent}>
                  {hasNoData ? (
                    <BaseEmptyChart />
                  ) : (
                    <div className={styles.organizationCards}>
                      {organizationDataList.map((org, index) => (
                        <BaseOrganizationCard
                          key={index}
                          label={org.label}
                          organizationName={org.organizationName}
                          organizationId={org.organizationId}
                          score={org.score}
                          diff={org.diff}
                          employees={org.employees}
                          attentionIndicator={org.attentionIndicator}
                          comparisonText={org.comparisonText}
                          onClick={onOrganizationClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.rankingSummary}>
                <div className={styles.cardHeader}>
                  <BaseFavCardHeader
                    title={t("section.ranking")}
                    description={t("label.rankingDescription")}
                    descriptionRightContent={
                      <div className={styles.riskIndicators}>
                        <div className={styles.riskItem}>
                          <div
                            className={styles.riskDot}
                            style={{ backgroundColor: "#FFA81B" }}
                          />
                          <span className={styles.riskLabel}>
                            {t("label.warning")}
                          </span>
                        </div>
                        <div className={styles.riskItem}>
                          <div
                            className={styles.riskDot}
                            style={{ backgroundColor: "#EA1D1D" }}
                          />
                          <span className={styles.riskLabel}>
                            {t("label.risk")}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </div>
                <div className={styles.cardContentFullWidth}>
                  {hasNoData ? (
                    <BaseEmptyChart />
                  ) : (
                    <FavRankingTable
                      data={rankingData}
                      sortKey={sortBy ?? undefined}
                      sortDirection={sortDirection}
                      onSort={onSort}
                      onRowClick={(row) => {
                        if (row.organizationId) {
                          onOrganizationClick(row.organizationId);
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              <div className={styles.changeRate}>
                <div className={styles.cardHeader}>
                  <BaseFavCardHeader
                    title={t("section.changeRate")}
                    description={t("label.changeRateDescription")}
                  />
                </div>
                <div className={styles.cardContentFullWidth}>
                  {hasNoData ? (
                    <BaseEmptyChart />
                  ) : changeRateData.length === 0 ? (
                    <BaseEmptyChart
                      message={t("emptyChart.insufficientComparisonData")}
                    />
                  ) : (
                    <FavChangeRateTable
                      data={changeRateData}
                      onRowClick={(row) => {
                        if (row.organizationId) {
                          onOrganizationClick(row.organizationId);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "status" && (
          <div className={styles.statusClassification}>
            {/* 첫 번째 행 */}
            <div className={styles.statusFirstRow}>
              <div className={styles.statusSummary}>
                <BaseFavCardHeader
                  title={t("section.classificationSummary")}
                  description={t("label.classificationDescription")}
                />
                <div className={styles.cardContent}>
                  {isEmptyStatusSummary ? (
                    <BaseEmptyChart />
                  ) : (
                    <div className={styles.statusCardGrid}>
                      {statusCardDataList.map((statusCard, index) => (
                        <BaseStatusCard key={index} data={statusCard} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.statusDistribution}>
                <BaseFavCardHeader
                  title={t("section.distribution")}
                  rightContent={
                    <div className={styles.distributionInfo}>
                      {t("label.participationSummary", {
                        participatedTeam: participatingTeams,
                        participatedCount: participatingMembers,
                        nonParticipatedTeam: nonParticipatingTeams,
                        nonParticipatedCount: nonParticipatingMembers,
                      })}
                    </div>
                  }
                />
                <div className={styles.cardContent}>
                  {donutChartData.every((item) => item.value === 0) ? (
                    <BaseEmptyChart />
                  ) : (
                    <BaseDonutChart data={donutChartData} size={175} />
                  )}
                </div>
              </div>
            </div>

            {/* 두 번째 행 */}
            <div className={styles.statusSecondRow}>
              <div className={styles.statusDetail}>
                <BaseFavCardHeader
                  title={t("section.classificationDetail")}
                  description={t("label.classificationDetailDescription")}
                />
                <div className={styles.cardContent}>
                  <div className={styles.detailCardGrid}>
                    {detailClassificationCards.map((card, index) => (
                      <FavDetailClassificationCard
                        key={index}
                        label={card.label}
                        scoreRange={card.scoreRange}
                        dotColor={card.dotColor}
                        data={card.data}
                        onRowClick={onOrganizationClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "usage" && (
          <div className={styles.usageStatus}>
            <div className={styles.usageContainer}>
              <BaseFavCardHeader
                title={t("section.departmentUsage")}
                tooltip={t("label.usageDescription")}
              />
              <div className={styles.usageTableWrapper}>
                <FavUsageStatusTable data={usageStatusData} />
              </div>
              <div className={styles.paginationWrapper}>
                <BasePagination
                  currentPage={usageCurrentPage}
                  totalPages={usageTotalPages}
                  onPageChange={onUsagePageChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FavView;
