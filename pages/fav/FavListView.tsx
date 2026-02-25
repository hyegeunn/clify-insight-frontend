import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BasePageHeader,
  BaseDateRangeSelector,
  // BaseReportDownload,
  BaseTable,
  BaseFavCardHeader,
  BasePagination,
  BaseIcon,
} from "@/components/common";
import type { FavListViewProps, FavListTableRow } from "@/types/pages/fav";
import styles from "./FavListView.module.scss";

const FavListView = ({
  selectedDate,
  startDate,
  endDate,
  currentPage,
  totalPages,
  sortKey,
  sortDirection,
  headers,
  data,
  organizationName,
  onDateChange,
  onSort,
  onPageChange,
  onRowClick,
}: FavListViewProps) => {
  const { t } = useTranslation("pages/fav");
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <BasePageHeader
        title={
          <div className={styles.titleWithBack}>
            <BaseIcon
              name="back"
              size={20}
              color="#171717"
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer" }}
            />
            {organizationName}
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
        <div className={styles.cardHeader}>
          <BaseFavCardHeader
            title={t("list.title")}
            tooltip={t("list.tooltip.privacyProtection")}
            description={t("list.tooltip.clickDescription")}
            descriptionRightContent={
              <div className={styles.riskIndicators}>
                <div className={styles.riskItem}>
                  <div
                    className={styles.riskDot}
                    style={{ backgroundColor: "#FFA81B" }}
                  />
                  <span className={styles.riskLabel}>{t("list.indicator.warning")}</span>
                  <BaseIcon
                    name="tooltip"
                    size={18}
                    color="#999999"
                    tooltip={t("list.tooltip.warningTooltip")}
                  />
                </div>
                <div className={styles.riskItem}>
                  <div
                    className={styles.riskDot}
                    style={{ backgroundColor: "#EA1D1D" }}
                  />
                  <span className={styles.riskLabel}>{t("list.indicator.risk")}</span>
                  <BaseIcon
                    name="tooltip"
                    size={18}
                    color="#999999"
                    tooltip={t("list.tooltip.riskTooltip")}
                  />
                </div>
              </div>
            }
          />
        </div>

        <BaseTable<FavListTableRow>
          headers={headers}
          data={data}
          onSort={onSort}
          defaultSortKey={sortKey}
          defaultSortDirection={sortDirection}
          enableRowHover
          enableRowPointer
          onRowClick={onRowClick}
          headerHeight={34}
          rowHeight={42}
        />

        {data.length > 0 && (
          <div className={styles.pagination}>
            <BasePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FavListView;
