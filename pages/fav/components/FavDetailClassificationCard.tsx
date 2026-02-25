import { useTranslation } from "react-i18next";
import { BaseTooltip, BaseIcon } from "@/components/common";
import type { FavDetailClassificationCardProps } from "@/types/pages/fav";
import FavDetailClassificationTable from "./FavDetailClassificationTable";
import styles from "./FavDetailClassificationCard.module.scss";

const FavDetailClassificationCard = ({
  label,
  scoreRange,
  dotColor,
  data,
  onRowClick,
}: FavDetailClassificationCardProps) => {
  const { t } = useTranslation("pages/fav");

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.dot} style={{ backgroundColor: dotColor }} />
        <span className={styles.title}>
          {label} ({scoreRange})
        </span>
        <BaseTooltip content={t("table.tooltip.noPreviousData")}>
          <BaseIcon name="tooltip" size={18} color="#999999" />
        </BaseTooltip>
      </div>
      <div className={styles.tableWrapper}>
        <FavDetailClassificationTable data={data} onRowClick={onRowClick} />
      </div>
    </div>
  );
};

export default FavDetailClassificationCard;
