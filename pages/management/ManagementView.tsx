import { useTranslation } from "react-i18next";
import {
  BaseButton,
  BasePageHeader,
  BaseFilterSelect,
  BaseFilterReset,
  BaseSearchInput,
  BaseTable,
  BasePagination,
} from "@/components/common";
import AddEmployeeModal from "./components/AddEmployeeModal";
import DeleteEmployeeModal from "./components/DeleteEmployeeModal";
import ChangePermissionModal from "./components/ChangePermissionModal";
import DepartmentSelectModal from "./components/DepartmentSelectModal";
import { formatNumber } from "@/utils";
import styles from "./ManagementView.module.scss";
import type {
  ManagementEmployeeRow,
  ManagementViewProps,
  ManagementPermission,
} from "@/types/pages/management";

const ManagementView = <T extends ManagementEmployeeRow>({
  selectedDepartment,
  selectedStatus,
  selectedPermission,
  searchValue,
  onDepartmentChange,
  onStatusChange,
  onPermissionChange,
  onSearchChange,
  onSearch,
  onFilterReset,
  headers,
  data,
  selectedRows,
  onSelectRow,
  onSort,
  currentPage,
  totalPages,
  // totalEmployees,
  // totalMemberCount,
  onPageChange,
  isAddModalOpen,
  isDeleteModalOpen,
  isPermissionModalOpen,
  isDepartmentSelectModalOpen,
  // onOpenAddModal,
  onOpenDeleteModal,
  onOpenPermissionModal,
  onOpenDepartmentSelectModal,
  onCloseAddModal,
  onCloseDeleteModal,
  onClosePermissionModal,
  onCloseDepartmentSelectModal,
  onAddEmployee,
  onDeleteEmployee,
  onChangePermission,
  onSelectDepartment,
  onResetDepartment,
  departments,
  // departmentOptions,
  statusOptions,
  permissionOptions,
  employees,
  selectedDepartmentId,
  activeTab,
  inactiveCount,
  activeEmployeesCount,
  onTabChange,
  addEmployeeApiErrors,
}: ManagementViewProps<T>) => {
  const { t } = useTranslation("pages/management");

  // 선택된 직원 정보 (권한 변경용 - 1명만)
  const selectedEmployee =
    selectedRows.length === 1 ? employees[selectedRows[0]] : null;

  // 선택된 직원들 정보 (삭제용 - 여러명 가능)
  const selectedEmployees = selectedRows.map((index) => employees[index]);
  return (
    <div className={styles.container}>
      <BasePageHeader title={t("title")} />

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeaderWithTabs}>
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tab} ${
                  activeTab === "active" ? styles.active : ""
                }`}
                onClick={() => onTabChange("active")}
              >
                {t("tab.employeeList")} ({formatNumber(activeEmployeesCount)})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "inactive" ? styles.active : ""
                }`}
                onClick={() => onTabChange("inactive")}
              >
                {t("tab.inactive")} ({formatNumber(inactiveCount)})
              </button>
            </div>
          </div>

          <div className={styles.filterWrapper}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className={styles.filterLeft}>
                <BaseSearchInput
                  placeholder={t("placeholder.search")}
                  value={searchValue}
                  onChange={onSearchChange}
                  onSearch={onSearch}
                  height={34}
                />
                <BaseFilterSelect
                  label={t("filter.label.department")}
                  placeholder={t("placeholder.select")}
                  options={[]}
                  defaultValue={selectedDepartment}
                  width={152}
                  height={34}
                  onChange={onDepartmentChange}
                  onButtonClick={onOpenDepartmentSelectModal}
                />
                {activeTab === "active" && (
                  <BaseFilterSelect
                    label={t("filter.label.status")}
                    placeholder={t("placeholder.select")}
                    options={statusOptions}
                    defaultValue={selectedStatus}
                    width={152}
                    height={34}
                    onChange={onStatusChange}
                  />
                )}
                <BaseFilterSelect
                  label={t("filter.label.permission")}
                  placeholder={t("placeholder.select")}
                  options={permissionOptions}
                  defaultValue={selectedPermission}
                  width={152}
                  height={34}
                  onChange={onPermissionChange}
                />
              </div>
              <div className={styles.filterReset}>
                <BaseFilterReset onClick={onFilterReset} />
              </div>
            </div>

            {activeTab === "active" && (
              <div className={styles.filterRight}>
                <BaseButton
                  variant="custom"
                  icon="settings"
                  iconColor="#333333"
                  backgroundColor="#ffffff"
                  hoverBackgroundColor="#f6f7f8"
                  textColor="#333333"
                  onClick={onOpenPermissionModal}
                  disabled={selectedRows.length !== 1}
                  style={{
                    height: "34px",
                    padding: "0 12px",
                    border: "1px solid #D1D5DB",
                    whiteSpace: "nowrap",
                    opacity: selectedRows.length !== 1 ? 0.5 : 1,
                    cursor:
                      selectedRows.length !== 1 ? "not-allowed" : "pointer",
                  }}
                >
                  {t("button.changePermission")}
                </BaseButton>
                <BaseButton
                  variant="custom"
                  icon="userRemove"
                  iconColor="#333333"
                  backgroundColor="#ffffff"
                  hoverBackgroundColor="#f6f7f8"
                  textColor="#333333"
                  onClick={onOpenDeleteModal}
                  disabled={selectedRows.length === 0}
                  style={{
                    height: "34px",
                    padding: "0 12px",
                    border: "1px solid #D1D5DB",
                    whiteSpace: "nowrap",
                    opacity: selectedRows.length === 0 ? 0.5 : 1,
                    cursor:
                      selectedRows.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {t("button.deleteEmployee")}
                </BaseButton>
                {/* 임직원 추가 버튼 임시 주석 */}
                {/* <BaseButton
                  variant="custom"
                  icon="userAdd"
                  backgroundColor="#2F6C46"
                  hoverBackgroundColor="#52976d"
                  textColor="#ffffff"
                  onClick={onOpenAddModal}
                  style={{
                    height: "34px",
                    padding: "0 12px",
                    border: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("button.addEmployee")}
                </BaseButton> */}
              </div>
            )}
          </div>

          <div className={styles.tableWrapper}>
            <BaseTable<T>
              headers={headers}
              data={data}
              enableCheckbox
              selectedRows={selectedRows}
              onSelectRow={onSelectRow}
              onSort={onSort}
              defaultSortKey="name"
              defaultSortDirection="asc"
              headerHeight={34}
              rowHeight={43}
              enableRowHover
              emptyHeight={645}
            />
          </div>

          {data.length > 0 && (
            <div className={styles.paginationWrapper}>
              <BasePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onSubmit={onAddEmployee}
        departments={departments}
        apiErrors={addEmployeeApiErrors}
      />

      <DeleteEmployeeModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onDeleteEmployee}
        employees={selectedEmployees}
      />

      <ChangePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={onClosePermissionModal}
        onConfirm={onChangePermission}
        employeeName={selectedEmployee?.name}
        employeeDepartment={selectedEmployee?.organization}
        employeeEmail={selectedEmployee?.email}
        currentPermission={
          (selectedEmployee?.role === "ADMIN"
            ? t("permission.admin")
            : selectedEmployee?.role === "SUPER_ADMIN"
            ? t("permission.superAdmin")
            : t("permission.user")) as ManagementPermission | undefined
        }
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

export default ManagementView;
