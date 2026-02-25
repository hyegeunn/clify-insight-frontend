import { useEffect, useRef, memo } from "react";
import * as echarts from "echarts";
import { createTooltipOption } from "@/utils";

interface FavDetailRiskTrendChartProps {
  xAxisData: string[];
  seriesData: number[];
  tooltipId?: string;
}

const FavDetailRiskTrendChart = memo(
  ({
    xAxisData,
    seriesData,
    tooltipId = "risk-trend-chart-tooltip",
  }: FavDetailRiskTrendChartProps) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
      if (!chartRef.current) {
        return;
      }

      // 기존 차트 인스턴스가 있으면 dispose
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }

      const chart = echarts.init(chartRef.current, null, {
        renderer: "canvas",
      });
      chartInstanceRef.current = chart;
      let isFirstResize = true;

      // series 객체 생성 (빨간색 커스터마이징)
      const seriesConfig: echarts.LineSeriesOption = {
        type: "line",
        data: seriesData,
        smooth: true,
        lineStyle: {
          color: "#EA1D1D", // 빨간색
          width: 3,
        },
        itemStyle: {
          color: "#FFFFFF",
          borderColor: "#EA1D1D", // 빨간색
          borderWidth: 3,
        },
        symbol: "circle",
        symbolSize: 7,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(234, 29, 29, 0.3)" }, // 빨간색 그라데이션
            { offset: 1, color: "rgba(234, 29, 29, 0.00)" }, // 빨간색 그라데이션
          ]),
        },
        markLine: {
          z: 0,
          symbol: "none",
          silent: true,
          animation: false,
          lineStyle: {
            color: "#F8F9FA",
            width: 1,
            type: "solid",
          },
          label: { show: false },
          data: xAxisData.map((_, index) => ({
            xAxis: index,
          })),
        },
      };

      const option: echarts.EChartsOption = {
        tooltip: {
          ...createTooltipOption(tooltipId, chart),
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
          data: xAxisData,
          boundaryGap: true,
          axisLine: {
            show: false,
            lineStyle: { color: "#F8F9FA" },
          },
          axisTick: { show: false },
          axisLabel: {
            color: "#AAAAAA",
            fontFamily: "Pretendard",
            fontSize: 11,
            fontWeight: 400,
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: "#F8F9FA",
              width: 1,
              type: "solid",
            },
          },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100,
          interval: 20,
          axisLine: {
            show: false,
            lineStyle: { color: "#F8F9FA" },
          },
          axisTick: { show: false },
          axisLabel: {
            color: "#AAAAAA",
            fontFamily: "Pretendard",
            fontSize: 11,
            fontWeight: 400,
            formatter: "{value}%",
          },
          splitLine: {
            lineStyle: { color: "#F8F9FA" },
          },
        },
        series: [seriesConfig],
      };

      chart.setOption(option);

      const resizeObserver = new ResizeObserver(() => {
        if (isFirstResize) {
          isFirstResize = false;
          return;
        }
        chart.resize();
      });

      resizeObserver.observe(chartRef.current);

      return () => {
        resizeObserver.disconnect();
        if (chartInstanceRef.current) {
          chartInstanceRef.current.dispose();
          chartInstanceRef.current = null;
        }
      };
    }, [xAxisData, seriesData, tooltipId]);

    return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
  }
);

FavDetailRiskTrendChart.displayName = "FavDetailRiskTrendChart";

export default FavDetailRiskTrendChart;
