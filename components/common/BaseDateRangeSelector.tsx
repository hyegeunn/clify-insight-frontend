import { useTranslation } from "react-i18next";
import type { BaseDateRangeSelectorProps } from "@/types";
import BaseDatePicker from "./BaseDatePicker";
import styles from "./BaseDateRangeSelector.module.scss";

const BaseDateRangeSelector = ({
  selectedDate,
  startDate,
  endDate,
  onDateChange,
}: BaseDateRangeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.dateRangeSelector}>
      <div className={styles.periodInfo}>
        <span className={styles.label}>
          {t("common.period")}: {startDate} ~ {endDate}
        </span>
      </div>
      <BaseDatePicker value={selectedDate} onChange={onDateChange} />
    </div>
  );
};

export default BaseDateRangeSelector;
