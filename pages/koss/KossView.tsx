import { useTranslation } from "react-i18next";
import {
  BasePageHeader,
  BaseDateRangeSelector,
  // BaseReportDownload,
  BaseProgressBar,
  BaseSummaryCard,
  BaseFavCardHeader,
  BaseSearchInput,
  BaseFilterSelect,
  BaseTable,
  BasePagination,
} from "@/components/common";
import type { KossEmployeeRow, KossViewProps } from "@/types/pages/koss";
import styles from "./KossView.module.scss";

const KossView = <T extends KossEmployeeRow>({
  currentPage,
  totalPages,
  progressItems,
  employeeHeaders,
  employeeData,
  summaryCards,
  filterOptions,
  selectedDate,
  startDate,
  endDate,
  onPageChange,
  onDateChange,
}: KossViewProps<T>) => {
  const { t } = useTranslation("pages/koss");

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
        {/* 첫 번째 행: 4개 카드 */}
        <div className={styles.firstRow}>
          {summaryCards.map((card, index) => (
            <BaseSummaryCard
              key={index}
              title={card.title}
              value={card.value}
              subValue={card.subValue}
              description={card.description}
            />
          ))}
        </div>

        {/* 두 번째 행: 부서별 참여현황과 임직원별 참여현황 */}
        <div className={styles.secondRow}>
          <div className={styles.participationSection}>
            <BaseFavCardHeader
              title={t("section.departmentParticipation")}
              description={t("label.sortBy")}
            />
            <div className={styles.participationContent}>
              <BaseProgressBar
                items={progressItems}
                labelWidth="128px"
                valueSectionWidth="90px"
              />
            </div>
          </div>

          <div className={styles.employeeSection}>
            <BaseFavCardHeader
              title={t("section.employeeParticipation")}
              rightContent={
                <div className={styles.filterControls}>
                  <BaseSearchInput
                    placeholder={t("placeholder.search")}
                    height={34}
                    onChange={(value: string) => {
                      console.log("검색:", value);
                      // TODO:: 검색 기능 구현
                    }}
                  />
                  <BaseFilterSelect
                    label={t("filter.department")}
                    placeholder={t("placeholder.select")}
                    options={filterOptions.departments}
                    height={34}
                    onChange={(value: string) => {
                      console.log("부서:", value);
                      // TODO:: 부서 필터 기능 구현
                    }}
                  />
                  <BaseFilterSelect
                    label={t("filter.status")}
                    placeholder={t("placeholder.select")}
                    options={filterOptions.statuses}
                    height={34}
                    onChange={(value: string) => {
                      console.log("상태:", value);
                      // TODO:: 상태 필터 기능 구현
                    }}
                  />
                </div>
              }
            />
            <div className={styles.employeeContent}>
              <BaseTable<T>
                headers={employeeHeaders}
                data={employeeData}
                headerHeight={34}
                rowHeight={43}
                bodyFontSize={13}
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
      </div>
    </div>
  );
};

export default KossView;
