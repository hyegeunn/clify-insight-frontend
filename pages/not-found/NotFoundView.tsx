import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BaseButton } from "@/components/common";
import styles from "./NotFoundView.module.scss";

const NotFoundView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("pages/notFound");

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>{t("errorCode")}</h1>
        <h2 className={styles.title}>{t("title")}</h2>
        <p className={styles.description}>
          {t("description.line1")}
          <br />
          {t("description.line2")}
        </p>
        <BaseButton
          variant="primary"
          size="large"
          onClick={handleGoHome}
          className={styles.homeButton}
        >
          {t("button.goHome")}
        </BaseButton>
      </div>
    </div>
  );
};

export default NotFoundView;
