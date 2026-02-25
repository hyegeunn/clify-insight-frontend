import { useEffect, type MouseEvent } from "react";
import type { BaseModalProps } from "@/types";
import { COLORS } from "@/constants/colors";
import BaseIcon from "./BaseIcon";
import styles from "./BaseModal.module.scss";

const DEFAULT_SECTION_PADDING = "24px";
const DEFAULT_MODAL_PADDING = 24;

const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  content,
  footer,
  width = 600,
  height,
  padding = DEFAULT_MODAL_PADDING,
  headerPadding,
  contentPadding,
  footerPadding,
  headerBorder = false,
  footerBorder = true,
  footerBorderColor,
}: BaseModalProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const isStructuredMode = content !== undefined || footer !== undefined;
  const displayContent = isStructuredMode ? content : children;

  const resolvePadding = (value?: number | string, fallback?: string) => {
    if (value === undefined) {
      return fallback;
    }
    return typeof value === "number" ? `${value}px` : value;
  };

  const resolvedHeightStyle =
    height !== undefined
      ? typeof height === "number"
        ? `${height}px`
        : height
      : "auto";

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.open : ""}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`${styles.modal} ${isOpen ? styles.open : ""}`}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: resolvedHeightStyle,
          padding: isStructuredMode ? "0" : `${padding}px`,
        }}
      >
        {title && (
          <div
            className={`${styles.header} ${
              headerBorder ? styles.headerBorder : ""
            }`}
            style={{
              padding: isStructuredMode
                ? resolvePadding(
                    headerPadding,
                    `${DEFAULT_SECTION_PADDING} ${DEFAULT_SECTION_PADDING} 0 ${DEFAULT_SECTION_PADDING}`
                  )
                : undefined,
            }}
          >
            <div className={styles.headerWrapper}>
              <h3 className={styles.title}>{title}</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
              >
                <BaseIcon
                  name="close"
                  size={28}
                  color={COLORS.textPrimary}
                />
              </button>
            </div>
          </div>
        )}
        <div
          className={styles.content}
          style={{
            padding: isStructuredMode
              ? resolvePadding(contentPadding, "0")
              : undefined,
            flex: isStructuredMode ? "1 1 auto" : undefined,
            overflow: isStructuredMode ? "auto" : "visible",
            maxHeight:
              !isStructuredMode && typeof height === "number"
                ? `${height - 28 - 16 - padding * 2}px`
                : !isStructuredMode
                ? "calc(90vh - 28px - 16px - 48px)"
                : undefined,
          }}
        >
          {displayContent}
        </div>
        {footer && (
          <div
            className={`${styles.footer} ${
              footerBorder ? styles.footerBorder : ""
            }`}
            style={{
              padding: resolvePadding(
                footerPadding,
                `0 ${DEFAULT_SECTION_PADDING} ${DEFAULT_SECTION_PADDING} ${DEFAULT_SECTION_PADDING}`
              ),
              borderTopColor: footerBorderColor,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
