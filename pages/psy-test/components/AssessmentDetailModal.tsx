import { useTranslation } from "react-i18next";
import { BaseModal } from "@/components/common";
import styles from "./AssessmentDetailModal.module.scss";
import type { AssessmentUsageDetail } from "@/types/pages/psy-test";

interface AssessmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: AssessmentUsageDetail | null;
  isLoading?: boolean;
}

const AssessmentDetailModal = ({
  isOpen,
  onClose,
  detail,
  isLoading = false,
}: AssessmentDetailModalProps) => {
  const { t } = useTranslation("pages/psyTest");

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={detail?.title || t("modal.title")}>
      <div className={styles.modalContent}>
        {isLoading ? (
          <div className={styles.loading}>{t("message.loading")}</div>
        ) : detail ? (
          <>
            <div className={styles.section}>
              <div className={styles.label}>{t("label.testIntro")}</div>
              <div className={styles.value}>{detail.description}</div>
            </div>

            <div className={styles.section}>
              <div className={styles.label}>{t("label.questionCount")}</div>
              <div className={styles.value}>{detail.questions}{t("unit.question")}</div>
            </div>

            <div className={styles.section}>
              <div className={styles.label}>{t("label.recommended")}</div>
              <div className={styles.value}>{detail.recommended}</div>
            </div>
          </>
        ) : (
          <div className={styles.error}>{t("message.errorLoadingDetail")}</div>
        )}
      </div>
    </BaseModal>
  );
};

export default AssessmentDetailModal;
