"use client";

interface GoalChartData {
  labels: string[];
  values: number[];
}

interface GoalChartProps {
  data: GoalChartData;
}

export default function GoalChart({ data }: GoalChartProps) {
  if (!data || !data.labels || !data.values) {
    return <div className="text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(...data.values, 100);
  const chartHeight = 250;
  const barWidth = 40;
  const gap = 20;
  const padding = 40;
  const totalWidth = data.labels.length * (barWidth + gap) + padding * 2;

  return (
    <div className="w-full h-auto p-6 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Completion %
      </h3>
      <svg
        viewBox={`0 0 ${totalWidth} ${chartHeight + padding}`}
        className="w-full h-auto"
      >
        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight + padding}
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* X-axis */}
        <line
          x1={padding}
          y1={chartHeight + padding}
          x2={totalWidth - padding}
          y2={chartHeight + padding}
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((value) => (
          <g key={`y-${value}`}>
            <text
              x={padding - 10}
              y={chartHeight + padding - (value / maxValue) * chartHeight + 5}
              textAnchor="end"
              fontSize="12"
              fill="#9ca3af"
            >
              {value}%
            </text>
            <line
              x1={padding - 5}
              y1={chartHeight + padding - (value / maxValue) * chartHeight}
              x2={totalWidth - padding}
              y2={chartHeight + padding - (value / maxValue) * chartHeight}
              stroke="#f3f4f6"
              strokeWidth="1"
              strokeDasharray="4"
            />
          </g>
        ))}

        {/* Bars */}
        {data.values.map((value, index) => {
          const barHeight = (value / maxValue) * chartHeight;
          const x = padding + index * (barWidth + gap) + gap / 2;
          const y = chartHeight + padding - barHeight;

          return (
            <g key={`bar-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="rgba(34,197,94,0.7)"
                className="hover:fill-green-600 transition-colors cursor-pointer"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight + padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {data.labels[index]}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
                fontWeight="bold"
              >
                {value}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
