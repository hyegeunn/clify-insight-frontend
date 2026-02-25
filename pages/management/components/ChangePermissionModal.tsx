import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BaseModal,
  BaseButton,
  BaseFilterSelect,
} from "@/components/common";
import type {
  ChangePermissionModalProps,
  ManagementPermission,
} from "@/types/pages/management";
import styles from "../ManagementView.module.scss";

const ChangePermissionModal = ({
  isOpen,
  onClose,
  onConfirm,
  employeeName = "김도윤",
  employeeDepartment = "경영지원팀",
  employeeEmail = "doyun@company.com",
  currentPermission = "일반",
}: ChangePermissionModalProps) => {
  const { t } = useTranslation("pages/management");
  const [selectedPermission, setSelectedPermission] =
    useState<ManagementPermission>(currentPermission);

  // currentPermission이 변경될 때 selectedPermission 업데이트
  useEffect(() => {
    const allOption = t("filter.options.all");
    if (currentPermission && currentPermission !== allOption) {
      setSelectedPermission(currentPermission);
    }
  }, [currentPermission, t]);

  const handleConfirm = () => {
    onConfirm(selectedPermission);
    onClose();
  };

  const permissionOptions = useMemo(
    () => [t("permission.user"), t("permission.admin")],
    [t]
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal.changePermission.title")}
      width={355}
      headerPadding="24px 24px 0 24px"
      headerBorder={false}
      contentPadding="24px 24px 40px 24px"
      footerPadding="0 24px 32px 24px"
      content={
        <div className={styles.permissionModalContent}>
          <div className={styles.deleteEmployeeSection}>
            <div className={styles.deleteEmployeeInfo}>
              <div className={styles.deleteEmployeeName}>{employeeName}</div>
              <div className={styles.deleteEmployeeDetail}>
                {employeeDepartment}
              </div>
              <div className={styles.deleteEmployeeDetail}>{employeeEmail}</div>
            </div>
          </div>
          <div className={styles.permissionGroup}>
            <label className={styles.label}>{t("modal.changePermission.label.permission")}</label>
            <div className={styles.permissionSelectWrapper}>
              <BaseFilterSelect
                label=""
                placeholder={t("modal.changePermission.placeholder.permission")}
                options={permissionOptions}
                defaultValue={selectedPermission}
                onChange={(value) =>
                  setSelectedPermission(value as ManagementPermission)
                }
                height={45}
              />
            </div>
          </div>
        </div>
      }
      footer={
        <BaseButton
          variant="custom"
          backgroundColor="#2F6C46"
          hoverBackgroundColor="#52976d"
          textColor="#ffffff"
          onClick={handleConfirm}
          style={{
            width: "100%",
            height: "51px",
            border: "none",
            fontSize: "15px",
            fontWeight: "600",
            lineHeight: "130%",
          }}
        >
          {t("modal.changePermission.button.submit")}
        </BaseButton>
      }
    />
  );
};

export default ChangePermissionModal;
