"use client";

import { Bar } from "react-chartjs-2";

export default function GoalChart({ data }) {
  return (
    <Bar
      data={{
        labels: data.labels,
        datasets: [
          {
            label: "% hoàn thành",
            data: data.values,
            backgroundColor: "rgba(34,197,94,0.7)",
          },
        ],
      }}
    />
  );
}
