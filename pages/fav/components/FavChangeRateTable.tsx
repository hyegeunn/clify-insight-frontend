import type { FavChangeRateTableProps } from "@/types/pages/fav";
import { BaseIcon } from "@/components/common";
import styles from "./FavChangeRateTable.module.scss";

const FavChangeRateTable = ({ data, onRowClick }: FavChangeRateTableProps) => {
  const displayData = data.slice(0, 5);

  const getChangeRateColor = (rate: number) => {
    if (rate > 0) return styles.up;
    if (rate < 0) return styles.down;
    return "";
  };

  const getChangeRateSymbol = (rate: number) => {
    if (rate > 0) return "↑ ";
    if (rate < 0) return "↓ ";
    return "";
  };

  const getChangeRateDisplay = (rate: number) => {
    if (rate === 0) return "-";
    return `${getChangeRateSymbol(rate)}${Math.abs(rate)}`;
  };

  return (
    <div className={styles.container}>
      {displayData.map((row) => (
        <div key={row.rank} className={styles.row}>
          <div className={styles.rankColumn}>{row.rank}</div>
          <div className={styles.departmentColumn}>
            <div
              className={styles.departmentNameWrapper}
              onClick={() => onRowClick?.(row)}
            >
              {row.departmentName}
              <BaseIcon name="chevronRight" size={16} color="#A3A3A3" />
            </div>
          </div>
          <div className={styles.changeRateColumn}>
            <span className={`${styles.changeRate} ${getChangeRateColor(row.changeRate)}`}>
              {getChangeRateDisplay(row.changeRate)}
            </span>
            <span className={styles.beforeAfter}>{row.beforeAfter}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavChangeRateTable;
