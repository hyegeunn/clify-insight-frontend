import { useEffect, useState } from "react";
import styles from "./BaseToast.module.scss";
import BaseIcon from "../BaseIcon";
import type { BaseToastProps } from "@/types/common";

const BaseToast = ({
  message,
  type = "info",
  duration = 3000,
  iconName,
  iconSize = 16,
  onClose,
}: BaseToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 400);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#2f6c46";
      case "error":
        return "#ea1d1d";
      case "warning":
        return "#ffa81b";
      case "info":
        return "#2f6c46";
      default:
        return "#2f6c46";
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[`toast--${type}`]} ${
        !isVisible ? styles["toast--hidden"] : ""
      }`}
    >
      <div className={styles.toast__content}>
        {iconName && (
          <span className={styles.toast__icon}>
            <BaseIcon name={iconName} size={iconSize} color={getIconColor()} />
          </span>
        )}
        <span className={styles.toast__message}>{message}</span>
      </div>
    </div>
  );
};

export default BaseToast;
