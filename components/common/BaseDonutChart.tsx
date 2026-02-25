import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BaseDonutChartProps } from "@/types";
import styles from "./BaseDonutChart.module.scss";

const ANIMATION_DELAY_MS = 100;
const SEGMENT_ANIMATION_DURATION = 0.8;
const SEGMENT_STAGGER = 0.15;
const PERCENTAGE_FADE_DELAY = 0.4;
const MIN_PERCENTAGE_FOR_LABEL = 10;

const BaseDonutChart = ({
  data,
  size = 175,
  legendPosition = "right",
  textColor = "#000000",
  legendUnit = "%",
  showPercentageAndCount = false,
  showPercentageOnly = false,
}: BaseDonutChartProps) => {
  const { t } = useTranslation("pages/fav");
  const { t: tCommon } = useTranslation("common");
  const [isAnimated, setIsAnimated] = useState(false);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  const strokeWidth = 50;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const safeTotal = total === 0 ? 1 : total;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsAnimated(true),
      ANIMATION_DELAY_MS
    );
    return () => window.clearTimeout(timer);
  }, []);

  let currentAngle = -90;

  return (
    <div
      className={`${styles.container} ${
        legendPosition === "bottom" ? styles.layoutBottom : styles.layoutRight
      }`}
    >
      <div className={styles.chartWrapper}>
        <svg width={size} height={size} className={styles.chart}>
          {data.map((item, index) => {
            const calculatedPercentage = (item.value / safeTotal) * 100;
            const percentage = item.percentage !== undefined ? item.percentage : calculatedPercentage;
            const angle = (percentage / 100) * 360;
            const strokeDasharray = `${
              (percentage / 100) * circumference
            } ${circumference}`;
            const rotation = currentAngle;

            const textAngle = currentAngle + angle / 2;
            const textRadius = radius;
            const textX =
              center + textRadius * Math.cos((textAngle * Math.PI) / 180);
            const textY =
              center + textRadius * Math.sin((textAngle * Math.PI) / 180);

            currentAngle += angle;

            const segmentLength = (percentage / 100) * circumference;
            const animationDelay = index * SEGMENT_STAGGER;

            return (
              <g key={`${item.label}-${index}`}>
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={isAnimated ? 0 : segmentLength}
                  transform={`rotate(${rotation} ${center} ${center})`}
                  style={{
                    transition: `stroke-dashoffset ${SEGMENT_ANIMATION_DURATION}s ease ${animationDelay}s`,
                  }}
                />
                {percentage >= MIN_PERCENTAGE_FOR_LABEL && (
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`${styles.percentageText} ${
                      isAnimated ? styles.fadeIn : ""
                    }`}
                    style={{
                      animationDelay: `${
                        animationDelay + PERCENTAGE_FADE_DELAY
                      }s`,
                      fill: item.textColor ?? textColor,
                    }}
                  >
                    {Math.round(percentage)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.legend}>
        {data.map((item, index) => {
          const calculatedPercentage = (item.value / (total === 0 ? 1 : total)) * 100;
          const percentage = item.percentage !== undefined ? item.percentage : calculatedPercentage;
          let legendDetails = "";

          if (item.teamCount !== undefined) {
            const teamText = t("unit.team", { count: item.teamCount });
            const peopleText = t("unit.people", { count: item.value });
            legendDetails = `(${teamText}, ${peopleText})`;
          } else if (showPercentageOnly) {
            legendDetails = `(${Math.round(percentage)}%)`;
          } else if (showPercentageAndCount) {
            legendDetails = `(${Math.round(percentage)}%, ${item.value}${tCommon("unit.count")})`;
          } else {
            legendDetails = `(${item.value}${legendUnit})`;
          }

          return (
            <div key={`${item.label}-${index}`} className={styles.legendItem}>
              <div
                className={styles.legendDot}
                style={{ backgroundColor: item.color }}
              />
              <div className={styles.legendContent}>
                <span className={styles.legendLabel}>{item.label}</span>
                <span className={styles.legendDetails}>
                  {legendDetails}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BaseDonutChart;
