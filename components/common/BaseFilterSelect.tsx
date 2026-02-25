import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { BaseFilterSelectProps, DropdownPosition } from "@/types";
import BaseIcon from "./BaseIcon";
import styles from "./BaseFilterSelect.module.scss";

const BaseFilterSelect = ({
  label,
  placeholder,
  options,
  defaultValue,
  width,
  height = 34,
  onChange,
  onButtonClick,
}: BaseFilterSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue || "");
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    onChange?.(value);
  };

  const handleToggle = () => {
    // onButtonClick이 있으면 드롭다운 대신 해당 핸들러 실행
    if (onButtonClick) {
      onButtonClick();
      return;
    }

    // 빈 배열일 때는 드롭다운 열지 않음
    if (options.length === 0) {
      return;
    }

    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={styles.filterSelectContainer}
        style={width ? { width: `${width}px` } : undefined}
      >
        <button
          type="button"
          className={`${styles.selectButton} ${isOpen ? styles.open : ""}`}
          onClick={handleToggle}
          style={{ height: `${height}px` }}
        >
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{selectedValue || placeholder}</span>
          <BaseIcon
            name="chevronDown"
            size={16}
            color="#9D9D9D"
            className={`${styles.chevronIcon} ${isOpen ? styles.rotated : ""}`}
          />
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={styles.optionsWrapper}
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 9999,
            }}
          >
            {options.map((option) => (
              <button
                type="button"
                key={option}
                className={`${styles.option} ${
                  option === selectedValue ? styles.selected : ""
                }`}
                onClick={() => handleSelect(option)}
                style={{ height: `${height}px` }}
              >
                {option}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default BaseFilterSelect;
