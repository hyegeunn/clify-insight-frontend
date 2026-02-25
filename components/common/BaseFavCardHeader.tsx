import type { BaseFavCardHeaderProps } from "@/types";
import BaseIcon from "./BaseIcon";
import styles from "./BaseFavCardHeader.module.scss";

const BaseFavCardHeader = ({
  title,
  description,
  tooltip,
  rightContent,
  descriptionRightContent,
}: BaseFavCardHeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{title}</h3>
          {tooltip && (
            <BaseIcon name="tooltip" size={16} color="#9095A0" tooltip={tooltip} />
          )}
        </div>
        {(description || descriptionRightContent) && (
          <div className={styles.descriptionRow}>
            {description && <p className={styles.description}>{description}</p>}
            {descriptionRightContent && (
              <div className={styles.descriptionRightContent}>
                {descriptionRightContent}
              </div>
            )}
          </div>
        )}
      </div>
      {rightContent && <div className={styles.rightSection}>{rightContent}</div>}
    </div>
  );
};

export default BaseFavCardHeader;
