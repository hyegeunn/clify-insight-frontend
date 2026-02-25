import { useTranslation } from "react-i18next";
import type { BaseCardHeaderProps } from "@/types";
import BaseIcon from "./BaseIcon";
import styles from "./BaseCardHeader.module.scss";

const BaseCardHeader = ({ title, subtitle, onMoreClick, tooltip, tag }: BaseCardHeaderProps) => {
  const { t } = useTranslation("common");

  return (
    <div className={styles.header}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        {tooltip && <BaseIcon name="tooltip" size={16} color="#9095A0" tooltip={tooltip} />}
        {tag && (
          <span className={`${styles.tag} ${styles[`tag${tag.type}`]}`}>
            {tag.text}
          </span>
        )}
      </div>
      {onMoreClick && (
        <button type="button" className={styles.more} onClick={onMoreClick}>
          {t("common.more")}
        </button>
      )}
    </div>
  );
};

export default BaseCardHeader;
