"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register required scales/elements once for react-chartjs-2
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface StudyTimeChartData {
  labels: string[];
  values: number[];
}

interface StudyTimeChartProps {
  data: StudyTimeChartData;
}

export default function StudyTimeChart({ data }: StudyTimeChartProps) {
  return (
    <Line
      data={{
        labels: data.labels,
        datasets: [
          {
            label: "Study Minute",
            data: data.values,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.25)",
            tension: 0.3,
          },
        ],
      }}
    />
  );
}
