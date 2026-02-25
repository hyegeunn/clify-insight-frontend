import type { BaseStatCardProps } from "@/types";
import BaseIcon from "./BaseIcon";
import styles from "./BaseStatCard.module.scss";

const BaseStatCard = ({ label, value, hasAlert }: BaseStatCardProps) => {
  return (
    <div className={styles.statCard}>
      {hasAlert && (
        <div className={styles.alert}>
          <BaseIcon name="alert" size={24} color="#FF4D4D" />
        </div>
      )}
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}

export default BaseStatCard;

