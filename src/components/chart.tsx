// components/AreaChart.tsx
"use client"; // if using Next 13 app router and TSX server components; otherwise remove

import React, { useRef, useEffect, useMemo } from "react";
import { Chart as ChartJS, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import "../";

// make sure chartjs-config.ts has run somewhere before rendering this component
// import '../lib/chartjs-config'; // if you put registration there

type Props = {
  data: number[]; // simple array of numbers
  labels?: string[]; // optional labels matching data length
  height?: number; // optional canvas height
};

export default function AreaChart({ data, labels, height = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate labels if none passed (e.g., Day 1, Day 2...)
  const xLabels = useMemo(() => {
    if (labels && labels.length === data.length) return labels;
    return data.map((_, i) => `#${i + 1}`);
  }, [data, labels]);

  // chart data structure
  const chartData = useMemo(() => {
    return {
      labels: xLabels,
      datasets: [
        {
          label: "Value",
          data,
          fill: true, // fill area under line
          tension: 0.3, // smoothing 0..1
          borderWidth: 2,
          pointRadius: 2,
          // backgroundColor will be set dynamically to gradient in useEffect
          backgroundColor: undefined as string | CanvasGradient | undefined,
          borderColor: "rgba(34, 197, 94, 1)", // example: green
        },
      ],
    };
  }, [data, xLabels]);

  // options — adjust animation here
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { display: true },
      y: { display: true, beginAtZero: true },
    },
    animations: {
      tension: {
        duration: 800,
        easing: "easeOutQuart",
        from: 0.3,
        to: 0.3,
      },
      y: {
        duration: 600,
        easing: "easeOutCubic",
      },
    },
  };

  // Create gradient and apply to dataset background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // vertical gradient from semi-transparent borderColor -> transparent
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 200);
    gradient.addColorStop(0, "rgba(34,197,94,0.25)"); // top
    gradient.addColorStop(0.6, "rgba(34,197,94,0.08)");
    gradient.addColorStop(1, "rgba(34,197,94,0)"); // bottom

    // directly mutate dataset backgroundColor
    if (chartRef.current) {
      // if you keep a chart ref, you could set it there; but simpler:
    }

    // Because chartData is memoized, mutate the underlying dataset for backgroundColor
    // (react-chartjs-2 will pick it up on render)
    (chartData.datasets[0] as any).backgroundColor = gradient;

    // force update by updating a Chart key — but react-chartjs-2 will redraw when props change
    // No need for manual chart.update() here.
  }, [data, chartData, height]);

  // use ref prop on canvas via `innerRef` (react-chartjs-2 exposes canvas through ref)
  // But easiest: supply a `ref` via `forwarded` canvas by using getElement or plugin — react-chartjs-2 v4
  // We'll use the `ref` prop available through `Line`'s `ref` to access canvas element.
  const chartRef = useRef<ChartJS | null>(null);

  return (
    <div style={{ height }}>
      <Line
        ref={chartRef as any}
        datasetIdKey="id"
        data={chartData}
        options={options}
        // get the canvas node to create gradient — we attach a small callback ref:
        // react-chartjs-2 renders a canvas, and you can grab it by querying the DOM inside useEffect.
        // We'll set the canvasRef via an inline callback:
        redraw={false}
        // The library doesn't expose direct canvasRef prop; we attach a ref by searching this component's canvas after mount
      />
      {/* Hidden canvas used only for gradient sizing if you prefer to draw with exact height:
          Alternatively, you can get canvas from chartRef.current and set gradient there.
          For simplicity, the gradient creation in effect uses a separate canvasRef if needed. */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={600}
        height={height}
      />
    </div>
  );
}
