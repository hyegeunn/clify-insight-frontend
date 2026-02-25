import { forwardRef } from "react";
import type { BaseInputProps } from "@/types";
import styles from "./BaseInput.module.scss";

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ error, className, ...props }, ref) => {
    const inputClassName = [styles.input, error ? styles.error : "", className ?? ""]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.inputWrapper}>
        <input
          ref={ref}
          className={inputClassName}
          {...props}
        />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;
