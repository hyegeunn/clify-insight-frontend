import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FavRankingTableProps, FavAttentionIndicator } from "@/types/pages/fav";
import { BaseIcon, BaseTooltip } from "@/components/common";
import styles from "./FavRankingTable.module.scss";

const ATTENTION_COLOR_MAP: Record<FavAttentionIndicator, string> = {
  stress: "#FFA81B",
  anxiety: "#FFA81B",
  depression: "#EA1D1D",
};

const FavRankingTable = ({
  data,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
}: FavRankingTableProps) => {
  const { t } = useTranslation("pages/fav");

  const attentionLabelMap: Record<FavAttentionIndicator, string> = useMemo(
    () => ({
      stress: t("table.indicator.stress"),
      anxiety: t("table.indicator.anxiety"),
      depression: t("table.indicator.depression"),
    }),
    [t]
  );

  const handleSort = (key: string) => {
    if (!onSort) return;

    // 같은 컬럼 클릭 시 방향 전환, 다른 컬럼 클릭 시 desc로 시작
    const newDirection =
      key === sortKey ? (sortDirection === "asc" ? "desc" : "asc") : "desc";
    onSort(key, newDirection);
  };

  const getDiffColor = (diff: number) => {
    if (diff > 0) return styles.up;
    if (diff < 0) return styles.down;
    return "";
  };

  const getDiffSymbol = (diff: number) => {
    if (diff > 0) return "↑ ";
    if (diff < 0) return "↓ ";
    return "";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.rankColumn}>
          <span className={styles.headerLabel}>{t("table.header.rank")}</span>
        </div>
        <div className={styles.departmentColumn}>
          <span className={styles.headerLabel}>
            {t("table.header.department")}
          </span>
        </div>
        <div
          className={`${styles.scoreColumn} ${onSort ? styles.sortable : ""}`}
          onClick={() => handleSort("score")}
        >
          <span className={styles.headerLabel}>{t("table.header.score")}</span>
          {onSort && sortKey === "score" && (
            <span className={styles.sortIcon}>
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div className={styles.indicatorColumn}>
          <span className={styles.headerLabel}>
            {t("table.header.indicator")}
          </span>
          <BaseTooltip content={t("table.tooltip.indicator")}>
            <BaseIcon name="tooltip" size={16} color="#666666" />
          </BaseTooltip>
        </div>
      </div>

      <div className={styles.body}>
        {data.map((row) => {
          const attentionLabel = row.attentionIndicator
            ? attentionLabelMap[row.attentionIndicator]
            : t("table.indicator.none");
          const attentionColor = row.attentionIndicator
            ? ATTENTION_COLOR_MAP[row.attentionIndicator]
            : "#CCCCCC";

          return (
            <div key={row.rank} className={styles.row}>
              <div className={styles.rankColumn}>
                <span className={styles.rankNumber}>{row.rank}</span>
              </div>
              <div className={styles.departmentColumn}>
                <div
                  className={styles.departmentNameWrapper}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.departmentName}
                  <BaseIcon name="chevronRight" size={16} color="#A3A3A3" />
                </div>
              </div>
              <div className={styles.scoreColumn}>
                <span className={styles.score}>
                  {t("unit.score", { count: row.score })}
                </span>
                <span
                  className={`${styles.diff} ${getDiffColor(row.diff)}`}
                  style={{
                    color: row.diff === 0 ? "#AAAAAA" : undefined,
                  }}
                >
                  {row.diff === 0
                    ? "-"
                    : `${getDiffSymbol(row.diff)}${Math.abs(row.diff)}`}
                </span>
              </div>
              <div className={styles.indicatorColumn}>
                <div className={styles.dot} style={{ backgroundColor: attentionColor }} />
                <span className={row.attentionIndicator ? styles.indicatorText : styles.none}>
                  {attentionLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavRankingTable;
