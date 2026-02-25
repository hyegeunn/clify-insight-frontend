import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { BaseSearchInputProps } from "@/types";
import { COLORS } from "@/constants/colors";
import BaseIcon from "./BaseIcon";
import styles from "./BaseSearchInput.module.scss";

const BaseSearchInput = ({
  placeholder = "검색",
  value: controlledValue,
  onChange,
  onSearch,
  height = 34,
  disabled = false,
}: BaseSearchInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const value = controlledValue ?? internalValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = event.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleSearch = () => {
    if (disabled) return;
    onSearch?.(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`${styles.searchInputContainer} ${
        isFocused ? styles.focused : ""
      } ${disabled ? styles.disabled : ""}`}
      style={{ height: `${height}px` }}
    >
      <BaseIcon
        name="search"
        size={16}
        color={disabled ? "#D1D5DB" : COLORS.textSecondary}
        onClick={handleSearch}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      />
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
      />
    </div>
  );
};

export default BaseSearchInput;
