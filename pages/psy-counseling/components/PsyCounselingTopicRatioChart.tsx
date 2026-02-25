import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as echarts from "echarts";
import type { TopicRatioChartProps } from "@/types/pages/psy-counseling";
import styles from "./PsyCounselingTopicRatioChart.module.scss";

const PsyCounselingTopicRatioChart = ({ data }: TopicRatioChartProps) => {
  const { t } = useTranslation("pages/psyCounseling");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, null, {
      renderer: "canvas",
    });
    let isFirstResize = true;

    const sortedData = [...data].sort((a, b) => a.value - b.value);

    const option: echarts.EChartsOption = {
      grid: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        containLabel: false,
      },
      xAxis: {
        type: "value",
        min: 0,
        max: 100,
        interval: 10,
        axisLine: {
          show: true,
          lineStyle: {
            color: "#EEEEEE",
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
        },
        splitLine: {
          lineStyle: {
            color: "#EEEEEE",
            type: "dashed",
          },
        },
      },
      yAxis: {
        type: "category",
        data: sortedData.map((item) => item.topic),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#333333",
          fontFamily: "Pretendard",
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 15.4,
          align: "right",
        },
      },
      series: [
        {
          type: "bar",
          data: sortedData.map((item) => item.value),
          barWidth: 12,
          itemStyle: {
            color: "#2F6C46",
            borderRadius: [2, 2, 2, 2],
          },
          emphasis: {
            itemStyle: {
              color: "#2F6C46",
            },
          },
          label: {
            show: true,
            position: "right",
            color: "#666666",
            fontFamily: "Pretendard",
            fontSize: 13,
            fontWeight: 400,
            lineHeight: 20,
            distance: 8,
          },
        },
      ],
    };

    chart.setOption(option);

    // 차트 canvas 요소에 커서 스타일 적용
    const canvasElement = chartRef.current?.querySelector("canvas");
    if (canvasElement) {
      canvasElement.style.cursor = "default";
    }

    // ResizeObserver로 컨테이너 크기 변화 즉시 감지
    const resizeObserver = new ResizeObserver(() => {
      // 초기 마운트 시에는 resize 스킵 (애니메이션 보존)
      if (isFirstResize) {
        isFirstResize = false;
        return;
      }
      chart.resize();
      // resize 후에도 커서 스타일 유지
      const canvasElement = chartRef.current?.querySelector("canvas");
      if (canvasElement) {
        canvasElement.style.cursor = "default";
      }
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
      <div className={styles.header}>
        <span className={styles.unit}>{t("unit.percent")}</span>
      </div>
      <div ref={chartRef} className={styles.chart} />
    </div>
  );
};

export default PsyCounselingTopicRatioChart;
