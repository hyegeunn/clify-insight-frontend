import { useTranslation } from "react-i18next";
import BaseIcon from "./BaseIcon";
import styles from "./BaseFilterReset.module.scss";

interface BaseFilterResetProps {
  onClick: () => void;
}

const BaseFilterReset = ({ onClick }: BaseFilterResetProps) => {
  const { t } = useTranslation();

  return (
    <button className={styles.resetButton} onClick={onClick}>
      <BaseIcon name="reset" color="#9D9D9D" size={16} />
      <span className={styles.resetText}>{t("button.reset")}</span>
    </button>
  );
};

export default BaseFilterReset;
