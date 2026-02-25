import { useTranslation } from "react-i18next";
import { BaseModal, BaseButton } from "@/components/common";
import type { DeleteEmployeeModalProps } from "@/types/pages/management";
import type { EmployeeListItem } from "@/types";
import styles from "../ManagementView.module.scss";

const DeleteEmployeeModal = ({
  isOpen,
  onClose,
  onConfirm,
  employees,
}: DeleteEmployeeModalProps) => {
  const { t } = useTranslation("pages/management");
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal.deleteEmployee.title")}
      width={355}
      headerPadding="24px 24px 0 24px"
      headerBorder={false}
      contentPadding="12px 24px 40px 24px"
      footerPadding="0 24px 32px 24px"
      content={
        <div className={styles.deleteModalContent}>
          <p className={styles.deleteDescription}>
            {t("modal.deleteEmployee.description")}
          </p>
          <div className={styles.deleteEmployeeSection}>
            <div className={styles.deleteEmployeeTitle}>
              {t("modal.deleteEmployee.employeeListTitle")} ({t("modal.deleteEmployee.count", { count: employees.length })})
            </div>
            <div className={styles.deleteEmployeeListWrapper}>
              {employees.map((employee: EmployeeListItem, index: number) => (
                <div key={index} className={styles.deleteEmployeeInfo}>
                  <div className={styles.deleteEmployeeName}>{employee.name}</div>
                  <div className={styles.deleteEmployeeDetail}>
                    {employee.organization}
                  </div>
                  <div className={styles.deleteEmployeeDetail}>{employee.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      footer={
        <BaseButton
          variant="custom"
          backgroundColor="#E53E3E"
          hoverBackgroundColor="#C53030"
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
          {t("modal.deleteEmployee.button.submit")}
        </BaseButton>
      }
    />
  );
};

export default DeleteEmployeeModal;
