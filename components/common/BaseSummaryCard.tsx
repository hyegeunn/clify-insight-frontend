import type { BaseSummaryCardProps } from "@/types";
import BaseCardHeader from "./BaseCardHeader";
import styles from "./BaseSummaryCard.module.scss";

const BaseSummaryCard = ({
  title,
  onMoreClick,
  value,
  subValue,
  description,
  icon,
  tag,
}: BaseSummaryCardProps) => {
  return (
    <div className={styles.card}>
      <BaseCardHeader title={title} onMoreClick={onMoreClick} tag={tag} />
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.valueWrapper}>
            <span className={styles.value}>{value}</span>
            {subValue && <span className={styles.subValue}>{subValue}</span>}
          </div>
          <p className={styles.description}>{description}</p>
        </div>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
      </div>
    </div>
  );
}

export default BaseSummaryCard;

