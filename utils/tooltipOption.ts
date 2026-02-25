import * as echarts from "echarts";
import { COLORS } from "@/constants/colors";

interface TooltipParams {
  dataIndex: number;
  value: number | [unknown, number];
}

export const createTooltipOption = (
  tooltipClassName: string,
  chart: echarts.ECharts
): echarts.TooltipComponentOption => ({
  className: tooltipClassName,
  trigger: "item" as const,
  borderWidth: 0,
  padding: 0,
  transitionDuration: 0.3,

  position: (pos, params, dom) => {
    const p = params as TooltipParams;
    const idx: number = p.dataIndex;
    const val: number = Array.isArray(p.value) ? p.value[1] : p.value;

    const px = chart.convertToPixel({ xAxisIndex: 0 }, idx) as number;
    const py = chart.convertToPixel({ yAxisIndex: 0 }, val) as number;

    if (!dom) return pos;
    const el = dom as HTMLElement;
    const x = Math.round(px - el.offsetWidth / 2);
    const y = Math.round(py - el.offsetHeight - 12);

    return [x, y];
  },
  formatter: (params: unknown): string => {
    const p = params as TooltipParams;
    const v = Array.isArray(p.value) ? p.value[1] : p.value;
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
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        transition: opacity 0.3s ease-in-out !important;

      ">
        ${v}
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
});
