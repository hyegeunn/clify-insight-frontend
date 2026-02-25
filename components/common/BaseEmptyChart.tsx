import { useTranslation } from "react-i18next";
import Lottie from "lottie-react";
import chartEmptyAnimation from "@/assets/animations/chart_empty.json";
import styles from "./BaseEmptyChart.module.scss";

interface BaseEmptyChartProps {
  message?: string;
}

const BaseEmptyChart = ({ message }: BaseEmptyChartProps) => {
  const { t } = useTranslation();
  const displayMessage = message || t("message.noData");

  return (
    <div className={styles.emptyChartContainer}>
      <Lottie
        animationData={chartEmptyAnimation}
        loop={true}
        className={styles.animation}
      />
      <p className={styles.message}>{displayMessage}</p>
    </div>
  );
};

export default BaseEmptyChart;
