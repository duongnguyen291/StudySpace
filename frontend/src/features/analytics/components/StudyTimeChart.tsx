"use client";

import { Line } from "react-chartjs-2";

export default function StudyTimeChart({ data }) {
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
