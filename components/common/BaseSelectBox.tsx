import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { BaseSelectBoxProps } from "@/types";
import { COLORS } from "@/constants/colors";
import BaseIcon from "./BaseIcon";
import styles from "./BaseSelectBox.module.scss";

const BaseSelectBox = ({
  options,
  defaultValue,
  width = 94,
  height = 34,
  hoverBackgroundColor = COLORS.primaryLight,
  hoverTextColor = COLORS.primary,
  onChange,
  disabled = false,
}: BaseSelectBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(() => {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return options[0] ?? "";
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  const handleSelect = (value: string) => {
    if (disabled) {
      return;
    }
    setSelectedValue(value);
    setIsOpen(false);
    onChange?.(value);
  };

  const handleOptionHover = (
    event: ReactMouseEvent<HTMLButtonElement>,
    isSelected: boolean
  ) => {
    if (isSelected) {
      return;
    }
    const target = event.currentTarget;
    if (event.type === "mouseenter") {
      target.style.backgroundColor = hoverBackgroundColor;
      target.style.color = hoverTextColor;
    } else if (event.type === "mouseleave") {
      target.style.backgroundColor = "";
      target.style.color = "";
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.selectContainer}
      style={{ width: `${width}px` }}
    >
      <button
        type="button"
        className={`${styles.selectButton} ${disabled ? styles.disabled : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{ height: `${height}px` }}
        disabled={disabled}
      >
        <div className={styles.textWrapper}>
          <span className={styles.selectedText}>{selectedValue}</span>
        </div>
        <BaseIcon
          name="chevronDown"
          size={16}
          color={COLORS.gray500}
          className={`${styles.chevronIcon} ${isOpen ? styles.open : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={styles.optionsWrapper}
          style={{ top: `${height + 8}px` }}
        >
          {options.map((option) => {
            const isSelected = option === selectedValue;
            return (
              <button
                type="button"
                key={option}
                className={`${styles.option} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => handleSelect(option)}
                style={{
                  height: `${height}px`,
                  ...(isSelected && {
                    backgroundColor: hoverBackgroundColor,
                    color: hoverTextColor,
                  }),
                }}
                onMouseEnter={(event) => handleOptionHover(event, isSelected)}
                onMouseLeave={(event) => handleOptionHover(event, isSelected)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BaseSelectBox;
