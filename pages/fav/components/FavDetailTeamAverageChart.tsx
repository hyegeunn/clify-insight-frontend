import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as echarts from "echarts";
import { createTooltipOption } from "@/utils/tooltipOption";
import type { FavDetailScoreComparisonData } from "@/types/pages/fav";

interface FavDetailTeamAverageChartProps {
  data: FavDetailScoreComparisonData | null;
}

const FavDetailTeamAverageChart = ({
  data,
}: FavDetailTeamAverageChartProps) => {
  const { t } = useTranslation("pages/fav");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    let isFirstResize = true;

    const scoreData = data;

    // X축 카테고리 (동일 레벨 평균, 조직 점수)
    const categories = [
      t("detail.sameLevelAverage"),
      t("detail.organizationScore"),
    ];

    // 막대 데이터 (전사 평균: 회색, 조직 점수: 녹색)
    const barData = scoreData
      ? [
          {
            value: scoreData.companyAverage,
            itemStyle: {
              color: "#CCCCCC",
              borderRadius: [4, 4, 0, 0] as [number, number, number, number],
            },
          },
          {
            value: scoreData.organizationScore,
            itemStyle: {
              color: "#2F6C46",
              borderRadius: [4, 4, 0, 0] as [number, number, number, number],
            },
          },
        ]
      : [
          {
            value: 0,
            itemStyle: {
              color: "#CCCCCC",
              borderRadius: [4, 4, 0, 0] as [number, number, number, number],
            },
          },
          {
            value: 0,
            itemStyle: {
              color: "#2F6C46",
              borderRadius: [4, 4, 0, 0] as [number, number, number, number],
            },
          },
        ];

    const option: echarts.EChartsOption = {
      grid: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontFamily: "Pretendard",
          fontSize: 11,
          fontWeight: 400,
          color: "#A3A3A3",
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontFamily: "Pretendard",
          fontSize: 11,
          fontWeight: 400,
          color: "#A3A3A3",
        },
        splitLine: {
          lineStyle: {
            color: "#F0F0F0",
          },
        },
      },
      tooltip: createTooltipOption("team-average-chart-tooltip", chart),
      series: [
        {
          type: "bar",
          data: barData,
          barWidth: 44,
          label: {
            show: false,
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

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

export default FavDetailTeamAverageChart;
