import { useTranslation } from "react-i18next";
import type { BaseStatusCardProps } from "@/types";
import styles from "./BaseStatusCard.module.scss";

const MONTHLY_SYMBOL = {
  increase: "↑",
  decrease: "↓",
} as const;

const BaseStatusCard = ({ data }: BaseStatusCardProps) => {
  const { t } = useTranslation("pages/fav");
  const {
    label,
    scoreRange,
    teamCount,
    totalMembers,
    monthlyChange,
    dotColor,
    tagBgColor,
    tagTextColor,
    tagText,
  } = data;

  const changeState =
    monthlyChange > 0 ? "increase" : monthlyChange < 0 ? "decrease" : "none";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.dot} style={{ backgroundColor: dotColor }} />
          <span className={styles.label}>{label}</span>
          <div
            className={styles.tag}
            style={{ backgroundColor: tagBgColor, color: tagTextColor }}
          >
            {tagText}
          </div>
        </div>
        <span className={styles.scoreRange}>{scoreRange}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.teamCount}>{t("unit.team", { count: teamCount })}</div>
        <div className={styles.details}>
          <span className={styles.detailsText}>
            {t("unit.members", { count: totalMembers })} · {t("unit.monthlyChange")}
          </span>
          {changeState === "none" ? (
            <span className={styles.noChange}>-</span>
          ) : (
            <span
              className={`${styles.change} ${
                changeState === "increase" ? styles.increase : styles.decrease
              }`}
            >
              {MONTHLY_SYMBOL[changeState]} {Math.abs(monthlyChange)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseStatusCard;
