import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as echarts from "echarts";
import { COLORS } from "@/constants/colors";
import type { MonthlyTrendChartProps } from "@/types/pages/psy-counseling";
import styles from "./PsyCounselingMonthlyTrendChart.module.scss";

const PsyCounselingMonthlyTrendChart = ({ data }: MonthlyTrendChartProps) => {
  const { t } = useTranslation("pages/psyCounseling");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, null, {
      renderer: "canvas",
    });
    let isFirstResize = true;

    const option: echarts.EChartsOption = {
      tooltip: {
        className: "monthly-trend-tooltip",
        trigger: "item" as const,
        borderWidth: 0,
        padding: 0,
        transitionDuration: 0.3,
        position: "top",

        formatter: (params: unknown) => {
          const p = params as { data?: { value: number; topicName: string } };
          const topicName = p.data?.topicName || "";
          const value = p.data?.value || 0;

          if (!topicName || value === 0) return "";

          return `
            <div style="
              position: relative;
              background: ${COLORS.textSecondary};
              color: ${COLORS.white};
              border-radius: 4px;
              font-family: Pretendard;
              font-weight: 400;
              font-size: 11px;
              box-sizing: border-box;
              min-width: 38px;
              height: 24px;
              padding: 0 8px;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
              white-space: nowrap;
              transition: opacity 0.3s ease-in-out !important;
            ">
              ${topicName} (${value}%)
              <div style="
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: -4px;
                width: 10px;
                height: 6px;
                background: ${COLORS.textSecondary};
                clip-path: polygon(50% 100%, 0 0, 100% 0);
              "></div>
            </div>
          `;
        },
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.month),
        axisLine: {
          show: true,
          lineStyle: {
            color: "#EEEEEE",
            type: "solid",
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#A3A3A3",
          fontFamily: "Pretendard",
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 19.5,
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLine: {
          show: true,
          lineStyle: {
            color: "#EEEEEE",
            type: "solid",
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#A3A3A3",
          fontFamily: "Pretendard",
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 15.4,
          align: "right",
        },
        splitLine: {
          lineStyle: {
            color: "#EEEEEE",
            type: "solid",
          },
        },
      },
      series: [
        {
          name: t("chart.legend.first"),
          type: "bar",
          data: data.map((item) => ({
            value: item.firstValue,
            topicName: item.firstTopicName,
          })),
          barWidth: 38,
          barGap: "100%",
          itemStyle: {
            color: "#2F6C46",
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: t("chart.legend.second"),
          type: "bar",
          data: data.map((item) => ({
            value: item.secondValue,
            topicName: item.secondTopicName,
          })),
          barWidth: 38,
          itemStyle: {
            color: "#70B78B",
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };

    chart.setOption(option);

    // ResizeObserver로 컨테이너 크기 변화 즉시 감지
    const resizeObserver = new ResizeObserver(() => {
      // 초기 마운트 시에는 resize 스킵 (애니메이션 보존)
      if (isFirstResize) {
        isFirstResize = false;
        return;
      }
      chart.resize();
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [data, t]);

  return (
    <div className={styles.container}>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.first}`} />
          <span className={styles.legendText}>{t("chart.legend.first")}</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.second}`} />
          <span className={styles.legendText}>{t("chart.legend.second")}</span>
        </div>
      </div>
      <div ref={chartRef} className={styles.chart} />
    </div>
  );
};

export default PsyCounselingMonthlyTrendChart;
