import type { BasePageHeaderProps } from "@/types";
import styles from "./BasePageHeader.module.scss";

const BasePageHeader = ({ title, action }: BasePageHeaderProps) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default BasePageHeader;

