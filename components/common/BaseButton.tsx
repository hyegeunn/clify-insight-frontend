import { useState, type CSSProperties, type MouseEventHandler } from "react";
import type { BaseButtonProps } from "@/types";
import { COLORS } from "@/constants/colors";
import BaseIcon from "./BaseIcon";
import styles from "./BaseButton.module.scss";

const BaseButton = ({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  icon,
  iconPosition = "left",
  iconGap = 8,
  iconSize = 16,
  iconColor,
  width,
  height = 34,
  backgroundColor = COLORS.primary,
  hoverBackgroundColor = COLORS.primaryHover,
  textColor = COLORS.white,
  fontSize = 12,
  fontWeight = 500,
  borderRadius = 8,
  style,
  onMouseEnter,
  onMouseLeave,
  type = "button",
  ...props
}: BaseButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const customStyle: CSSProperties = {};

  if (variant === "custom") {
    if (width !== undefined) {
      customStyle.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      customStyle.height = typeof height === "number" ? `${height}px` : height;
    }

    customStyle.backgroundColor = isHovered
      ? hoverBackgroundColor
      : backgroundColor;
    customStyle.color = textColor;

    if (fontSize !== undefined) {
      customStyle.fontSize =
        typeof fontSize === "number" ? `${fontSize}px` : fontSize;
    }

    if (fontWeight !== undefined) {
      customStyle.fontWeight = fontWeight;
    }

    if (borderRadius !== undefined) {
      customStyle.borderRadius =
        typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
    }
  }

  const buttonClass = [
    styles.button,
    variant === "custom" ? styles.custom : styles[variant],
    variant === "custom" ? undefined : styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contentGap: CSSProperties = icon ? { gap: `${iconGap}px` } : {};

  const handleMouseEnter: MouseEventHandler<HTMLButtonElement> = (event) => {
    setIsHovered(true);
    onMouseEnter?.(event);
  };

  const handleMouseLeave: MouseEventHandler<HTMLButtonElement> = (event) => {
    setIsHovered(false);
    onMouseLeave?.(event);
  };

  const resolvedIconColor = iconColor ?? textColor ?? "currentColor";

  return (
    <button
      type={type}
      className={buttonClass}
      style={{ ...customStyle, ...contentGap, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <BaseIcon name={icon} size={iconSize} color={resolvedIconColor} />
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <BaseIcon name={icon} size={iconSize} color={resolvedIconColor} />
      )}
    </button>
  );
};

export default BaseButton;
