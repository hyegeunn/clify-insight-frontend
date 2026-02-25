import { useTranslation } from "react-i18next";
import styles from "./BaseLoader.module.scss";

const BaseLoader = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.loader}></div>
      <p className={styles.text}>{t("message.loading")}</p>
    </div>
  );
};

export default BaseLoader;

