"use client";

import { useId } from "react";
import type { ChartPoint } from "@/types";

/** Gráfica de línea con área (SVG, responsive, sin dependencias). */
export function LineChart({
  data,
  height = 110,
  color = "#65ff4f",
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
}) {
  const gradientId = useId();
  const width = 320;
  const pad = 10;

  if (data.length === 0) {
    return <div style={{ height }} />;
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (d.value - min) / range);
    return [x, y] as const;
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  const area = `${line} L ${last[0].toFixed(1)} ${height - pad} L ${points[0][0].toFixed(1)} ${height - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Gráfica de progreso"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />
    </svg>
  );
}

/** Gráfica de barras (divs flex, responsive). */
export function BarChart({
  data,
  height = 110,
  color = "#65ff4f",
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${Math.max(6, (d.value / max) * (height - 18))}px`,
              background: color,
            }}
          />
          <span className="text-[10px] text-zinc-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
