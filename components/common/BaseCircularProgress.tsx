import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CircularProgressProps, HealthStatus } from "@/types";
import { STATUS_COLORS } from "@/types";
import { COLORS } from "@/constants/colors";
import BaseIcon from "./BaseIcon";
import BaseTooltip from "./BaseTooltip";
import styles from "./BaseCircularProgress.module.scss";

const DEFAULT_SIZE = 115;
const DEFAULT_STROKE_WIDTH = 11.13;
const ANIMATION_DELAY_MS = 100;
const ANIMATION_DURATION_MS = 800;
const ANIMATION_STEPS = 50;

const clampPercentage = (value: number) => Math.min(Math.max(value, 0), 100);

const BaseCircularProgress = ({
  value,
  status,
  indicatorType,
  label,
  tooltipContent,
  customSize,
  customColor,
  customBackgroundColor,
  showStatus = true,
  showPercentage = false,
  customStatusLabel,
}: CircularProgressProps) => {
  const { t } = useTranslation("pages/fav");
  const [isAnimated, setIsAnimated] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  const statusLabelMap: Record<HealthStatus, string> = useMemo(
    () => ({
      healthy: t("status.healthy"),
      good: t("status.good"),
      caution: t("status.caution"),
      vulnerable: t("status.vulnerable"),
      critical: t("status.critical"),
    }),
    [t]
  );

  const clampedValue = clampPercentage(value);
  const size = customSize ?? DEFAULT_SIZE;
  const strokeWidth = customSize ? customSize * 0.0968 : DEFAULT_STROKE_WIDTH;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const colorConfig = status ? STATUS_COLORS[status] : undefined;
  const gradientId = useMemo(
    () => `gradient-${indicatorType ?? "custom"}-${status ?? "custom"}`,
    [indicatorType, status]
  );

  const strokeColor = customColor ?? colorConfig?.stroke ?? COLORS.primary;
  const backgroundColor =
    customBackgroundColor ?? colorConfig?.background ?? COLORS.gray50;
  const textColor = customStatusLabel === "-" 
    ? COLORS.textSecondary 
    : (customColor ?? colorConfig?.text ?? COLORS.primary);

  useEffect(() => {
    setIsAnimated(false);
    setDisplayValue(0);

    const animationTimer = window.setTimeout(() => {
      setIsAnimated(true);
    }, ANIMATION_DELAY_MS);

    const stepValue = clampedValue / ANIMATION_STEPS;
    const stepDuration = ANIMATION_DURATION_MS / ANIMATION_STEPS;
    let currentStep = 0;

    const countTimer = window.setInterval(() => {
      currentStep += 1;
      if (currentStep < ANIMATION_STEPS) {
        setDisplayValue(Math.round(stepValue * currentStep));
      } else {
        setDisplayValue(clampedValue);
        window.clearInterval(countTimer);
      }
    }, stepDuration);

    return () => {
      window.clearTimeout(animationTimer);
      window.clearInterval(countTimer);
    };
  }, [clampedValue]);

  const strokeDashoffset = isAnimated
    ? circumference - (clampedValue / 100) * circumference
    : circumference;

  const tooltip = useMemo(() => {
    if (tooltipContent) return tooltipContent;
    if (!indicatorType || !status) return undefined;
    return t(`tooltip.${indicatorType}.${status}`);
  }, [tooltipContent, indicatorType, status, t]);

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <svg
          className={styles.chart}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{
                  stopColor: customColor
                    ? customColor
                    : colorConfig?.gradient?.start ??
                      colorConfig?.stroke ??
                      strokeColor,
                  stopOpacity: 1,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: customColor
                    ? customColor
                    : colorConfig?.gradient?.end ??
                      colorConfig?.stroke ??
                      strokeColor,
                  stopOpacity: 1,
                }}
              />
            </linearGradient>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={styles.progressCircle}
          />
        </svg>

        <div className={styles.valueWrapper}>
          <span className={styles.value} style={{ color: textColor }}>
            {showPercentage ? `${displayValue}%` : displayValue}
          </span>
        </div>
      </div>

      {(label || (showStatus && status)) && (
        <div className={styles.infoWrapper}>
          {label && (
            <div className={styles.labelWrapper}>
              <span className={styles.label}>{label}</span>
              {tooltip && (
                <BaseTooltip content={tooltip}>
                  <BaseIcon name="tooltip" size={16} color="#9095A0" />
                </BaseTooltip>
              )}
            </div>
          )}

          {showStatus && status && colorConfig && (
            <div
              className={styles.statusTag}
              style={{
                backgroundColor: customStatusLabel === "-" ? COLORS.gray50 : colorConfig.tagBackground,
                color: customStatusLabel === "-" ? COLORS.textSecondary : colorConfig.text,
              }}
            >
              {customStatusLabel ?? statusLabelMap[status]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BaseCircularProgress;
