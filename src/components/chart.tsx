"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useRef } from "react";
import { resultData } from "@/mock/resultsData";
import { gpas } from "@/utils/studentDashboardStats";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export default function AreaChart() {
  const chartRef = useRef<ChartJS<"line">>(null);

  // demo CGPA progression data

  const labels = resultData.map((semester) => {
    const semesterOb = {
      semester: semester.semester.toLowerCase() === "harmattan" ? "1st" : "2nd",
      level: semester.student.level.split(" ")[0],
    };
    return `${semesterOb.level} ${semesterOb.semester}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "GPA",
        data: gpas,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        borderColor: "rgb(59,130,246)",
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = canvasCtx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );

          gradient.addColorStop(0, "rgba(59,130,246,0.45)");
          gradient.addColorStop(1, "rgba(59,130,246,0)");

          return gradient;
        },
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
      },
    },
    animations: {
      y: {
        duration: 800,
        easing: "easeOutQuart",
      },
    },
  };

  return (
    <div style={{ height: 300 }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
