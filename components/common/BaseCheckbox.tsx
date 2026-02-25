import type { BaseCheckboxProps } from "@/types";
import { COLORS } from "@/constants/colors";
import styles from "./BaseCheckbox.module.scss";

const SIZE_MAP: Record<
  Exclude<BaseCheckboxProps["size"], number | undefined>,
  number
> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const BaseCheckbox = ({
  label,
  id,
  className,
  size = "md",
  ...props
}: BaseCheckboxProps) => {
  const resolvedSize =
    typeof size === "number" ? size : SIZE_MAP[size] ?? SIZE_MAP.md;
  const wrapperClassName = [styles.checkboxWrapper, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      <div
        className={styles.checkboxContainer}
        style={{ width: resolvedSize, height: resolvedSize }}
      >
        <input type="checkbox" id={id} className={styles.checkbox} {...props} />
        <div
          className={styles.checkboxCustom}
          style={{ width: resolvedSize, height: resolvedSize }}
        >
          <svg
            className={styles.checkIcon}
            width={resolvedSize * 0.6}
            height={resolvedSize * 0.6}
            viewBox="0 0 19 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6.66667L7.91111 13.2L17.2 2"
              stroke={COLORS.white}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  );
};

export default BaseCheckbox;
