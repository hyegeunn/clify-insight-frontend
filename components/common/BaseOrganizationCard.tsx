import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { BaseOrganizationCardProps, IndicatorType } from "@/types";
import BaseIcon from "./BaseIcon";
import styles from "./BaseOrganizationCard.module.scss";

const DIFF_SYMBOL: Record<"up" | "down" | "flat", string> = {
  up: "↑",
  down: "↓",
  flat: "",
};

const BaseOrganizationCard = ({
  label,
  organizationName,
  organizationId,
  score,
  diff,
  employees,
  attentionIndicator,
  comparisonText,
  onClick,
}: BaseOrganizationCardProps) => {
  const { t } = useTranslation("pages/fav");
  const diffState = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const diffClassName =
    diffState === "flat" ? "" : diffState === "up" ? styles.up : styles.down;

  const indicatorLabelMap: Record<IndicatorType, string> = useMemo(
    () => ({
      stress: t("label.stress"),
      anxiety: t("label.anxiety"),
      depression: t("label.depression"),
    }),
    [t]
  );

  const isIndicatorType = (value: string | null): value is IndicatorType => {
    return value !== null && (value === "stress" || value === "anxiety" || value === "depression");
  };

  const getAttentionIndicatorDisplay = (indicator: string | null): string => {
    if (!indicator) return t("table.indicator.none");
    if (isIndicatorType(indicator)) {
      return indicatorLabelMap[indicator];
    }
    return indicator;
  };

  const handleClick = () => {
    if (onClick && organizationId) {
      onClick(organizationId);
    }
  };

  const isClickable = onClick && organizationId;

  return (
    <div className={styles.container}>
      <div className={styles.labelWrapper}>
        <div
          className={`${styles.labelContent} ${isClickable ? styles.clickable : ""}`}
          onClick={handleClick}
        >
          <div className={styles.label}>{label}</div>
          <BaseIcon name="chevronRight" size={20} color="#A3A3A3" />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.organizationName}>{organizationName}</div>
          <div className={styles.scoreWrapper}>
            <div className={styles.score}>
              {t("unit.score", { count: score })}
            </div>
            <div
              className={`${styles.diff} ${diffClassName}`}
              style={{
                color: diff === 0 ? "#AAAAAA" : undefined,
              }}
            >
              {diff === 0
                ? "-"
                : `${DIFF_SYMBOL[diffState]}${Math.abs(diff)}`}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {comparisonText === "-"
                ? t("comparison.sameShort")
                : t("comparison.comparedTo")}
            </span>
            <span className={styles.detailValue}>{comparisonText}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {t("organization.members")}
            </span>
            <span className={styles.detailValue}>
              {t("unit.people", { count: employees })}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {t("organization.indicator")}
            </span>
            <span className={styles.detailValue}>
              {getAttentionIndicatorDisplay(attentionIndicator)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseOrganizationCard;
