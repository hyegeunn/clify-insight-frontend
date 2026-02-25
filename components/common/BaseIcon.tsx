import type { BaseIconProps } from "@/types";
import { ICONS } from "@/utils";
import BaseTooltip from "./BaseTooltip";

const BaseIcon = ({
  name,
  size = 20,
  color = "currentColor",
  className,
  tooltip,
  ...props
}: BaseIconProps) => {
  const icon = ICONS[name];
  if (!icon) {
    return null;
  }

  const {
    paths,
    stroke,
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    viewBox,
    rects,
  } = icon;
  const isStrokeIcon = Boolean(stroke);

  const svgElement = (
    <svg
      width={size}
      height={size}
      viewBox={viewBox ?? "0 0 24 24"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
      {...props}
    >
      {rects?.map((rect, index) => (
        <rect
          key={`rect-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          rx={rect.rx}
          fill={rect.fill ?? "none"}
          stroke={rect.stroke}
          strokeWidth={rect.strokeWidth}
        />
      ))}

      {paths.map((path, index) => (
        <path
          key={`path-${index}`}
          d={path}
          fill={isStrokeIcon ? "none" : color}
          stroke={isStrokeIcon ? color : "none"}
          strokeWidth={isStrokeIcon ? strokeWidth ?? 1.5 : undefined}
          strokeLinecap={isStrokeIcon ? strokeLinecap ?? "round" : undefined}
          strokeLinejoin={isStrokeIcon ? strokeLinejoin ?? "round" : undefined}
        />
      ))}
    </svg>
  );

  if (tooltip) {
    return <BaseTooltip content={tooltip}>{svgElement}</BaseTooltip>;
  }

  return svgElement;
};

export default BaseIcon;
