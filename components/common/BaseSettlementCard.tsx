import type { BaseSettlementCardProps } from "@/types";
import BaseTooltip from "./BaseTooltip";
import BaseIcon from "./BaseIcon";
import styles from "./BaseSettlementCard.module.scss";

const TREND_SYMBOL = {
  up: "↑",
  down: "↓",
} as const;

const BaseSettlementCard = ({
  title,
  tooltip,
  tag,
  mainContent,
  trendData,
  percentage,
  subContent,
  mainContentColor,
  percentageColor,
}: BaseSettlementCardProps) => {
  const trendClass =
    trendData?.type === "up"
      ? styles.trendUp
      : trendData?.type === "down"
      ? styles.trendDown
      : "";

  return (
    <div className={styles.card}>
      <div className={styles.titleSection}>
        <span className={styles.title}>{title}</span>
        {tooltip && (
          <BaseTooltip content={tooltip}>
            <BaseIcon name="tooltip" size={16} color="#9095A0" />
          </BaseTooltip>
        )}
        {tag && (
          <span className={`${styles.tag} ${styles[`tag${tag.type}`]}`}>
            {tag.text}
          </span>
        )}
      </div>

      <div className={styles.mainSection}>
        <span
          className={styles.mainContent}
          style={mainContentColor ? { color: mainContentColor } : undefined}
        >
          {mainContent}
        </span>
        {trendData && (
          <span className={`${styles.trend} ${trendClass}`}>
            {TREND_SYMBOL[trendData.type]} {trendData.value}%
          </span>
        )}
        {percentage && (
          <span
            className={styles.percentage}
            style={percentageColor ? { color: percentageColor } : undefined}
          >
            {percentage}
          </span>
        )}
      </div>

      <div className={styles.subSection}>
        <span className={styles.subContent}>{subContent}</span>
      </div>
    </div>
  );
};

export default BaseSettlementCard;
