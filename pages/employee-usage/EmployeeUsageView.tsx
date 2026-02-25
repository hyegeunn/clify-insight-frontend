import { useTranslation } from "react-i18next";
import {
  BaseDateRangeSelector,
  BasePageHeader,
  BaseCardHeader,
  BaseFilterSelect,
  BaseFilterReset,
  BaseTable,
  BasePagination,
  BaseModal,
  BaseButton,
} from "@/components/common";
import DepartmentSelectModal from "@/pages/management/components/DepartmentSelectModal";
import type {
  EmployeeUsageRecord,
  EmployeeUsageViewProps,
} from "@/types/pages/employee-usage";
import styles from "./EmployeeUsageView.module.scss";

const EmployeeUsageView = ({
  headers,
  tableData,
  currentPage,
  totalPages,
  selectedDepartment,
  departmentOptions,
  employeeTotalCount,
  isModalOpen,
  selectedEmployee,
  detailHistory,
  detailHistoryCount,
  detailHistoryLoading,
  selectedDate,
  startDate,
  endDate,
  isExcelDownloading,
  sortKey,
  sortDirection,
  onSortChange,
  onPageChange,
  onFilterReset,
  onRowClick,
  onDownloadExcel,
  onCloseModal,
  onDateChange,
  isDepartmentSelectModalOpen,
  onOpenDepartmentSelectModal,
  onCloseDepartmentSelectModal,
  onSelectDepartment,
  onResetDepartment,
  departments,
  selectedDepartmentId,
}: EmployeeUsageViewProps) => {
  const { t } = useTranslation("pages/employeeUsage");

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
            <BaseButton
              variant="custom"
              icon="download"
              iconPosition="left"
              iconSize={16}
              iconColor="#FFFFFF"
              onClick={onDownloadExcel}
              disabled={isExcelDownloading}
            >
              {isExcelDownloading ? t("button.downloading") : t("button.downloadExcel")}
            </BaseButton>
          </>
        }
      />

      <div className={styles.content}>
        <div className={styles.card}>
          <BaseCardHeader
            title={t("card.employeeList", { count: employeeTotalCount })}
          />

          <div className={styles.filterWrapper}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <BaseFilterSelect
                label={t("filter.department")}
                placeholder={t("placeholder.select")}
                options={departmentOptions}
                defaultValue={selectedDepartment}
                width={152}
                height={34}
                onChange={() => {}}
                onButtonClick={onOpenDepartmentSelectModal}
              />
              <div className={styles.filterReset}>
                <BaseFilterReset onClick={onFilterReset} />
              </div>
            </div>
          </div>

          <BaseTable<EmployeeUsageRecord>
            key={`${String(sortKey)}-${sortDirection}`}
            headers={headers}
            data={tableData}
            defaultSortKey={sortKey}
            defaultSortDirection={sortDirection}
            headerHeight={34}
            rowHeight={37}
            bodyFontSize={13}
            bodyLineHeight="130%"
            bodyTextColor="#333333"
            enableRowHover
            enableRowPointer
            onSort={onSortChange}
            onRowClick={onRowClick}
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

      <BaseModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title={
          selectedEmployee
            ? t("modal.title", { employeeName: selectedEmployee.employeeNumber })
            : t("modal.usageHistory")
        }
        width={388}
        height={500}
        content={
          <>
            <div className={styles.detailCounter}>
              {t("modal.totalCount", { count: detailHistoryCount ?? detailHistory.length })}
            </div>
            <div className={styles.detailList}>
              {detailHistoryLoading ? (
                <div className={styles.detailPlaceholder}>
                  {t("modal.loading")}
                </div>
              ) : detailHistory.length === 0 ? (
                <div className={styles.detailPlaceholder}>
                  {t("modal.noData")}
                </div>
              ) : (
                detailHistory.map((item, index) => (
                  <div
                    key={`${item.title}-${item.paidAt}-${index}`}
                    className={styles.detailItem}
                  >
                    <div className={styles.detailLeft}>
                      <div className={styles.detailTitle}>{item.title}</div>
                      <div className={styles.detailDate}>{item.paidAt}</div>
                    </div>
                    <div className={styles.detailRight}>
                      <div className={styles.detailAmount}>{item.amount}</div>
                      <div className={styles.detailPayment}>
                        {item.paymentType === 'POINT' ? t("paymentType.point") : item.paymentType === 'CARD' ? t("paymentType.personal") : t("paymentType.mixed")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        }
        contentPadding="16px 24px"
      />

      <DepartmentSelectModal
        isOpen={isDepartmentSelectModalOpen}
        onClose={onCloseDepartmentSelectModal}
        onConfirm={onSelectDepartment}
        onReset={onResetDepartment}
        selectedDepartment={selectedDepartment}
        selectedDepartmentId={selectedDepartmentId}
        departments={departments}
      />
    </div>
  );
};

export default EmployeeUsageView;
