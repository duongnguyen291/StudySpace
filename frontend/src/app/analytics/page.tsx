"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useAnalytics } from "@/features/analytics/hook/useAnalytics";

import StudyTimeChart from "@/features/analytics/components/StudyTimeChart";
import GoalChart from "@/features/analytics/components/GoalChart";

function SkeletonLoader() {
  return (
    <div className="min-h-screen p-10 text-white">
      <h1 className="text-4xl font-bold mb-10">📊 Analytics Dashboard</h1>

      {/* Summary Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Insights Skeleton */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🔎 Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-xl animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-3"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { studyTime, goals, summary, insights } = useAnalytics(user?.id || "");

  if (!user) return <div className="text-white p-10">Please log in</div>;
  if (!studyTime || !goals || !summary)
    return <SkeletonLoader />;

  return (
    <div className="min-h-screen p-10 text-white">

      <h1 className="text-4xl font-bold mb-10">📊 Analytics Dashboard</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400">Average minutes/day (7d)</h3>
          <p className="text-3xl font-bold">{insights?.avg_minutes_per_day_7d || '—'}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400">Today's Progress</h3>
          <p className="text-3xl font-bold">
            {summary.today_completion_percent}%
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400">Today's Goal</h3>
          <p className="text-3xl font-bold">
            {summary.today_actual_minutes}/{summary.today_target_minutes} min
          </p>
        </div>
      </div>

      {/* INSIGHTS - additional analytics to avoid duplication with Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">🔎 Insights</h2>
          <div>
            <button
              onClick={() => {
                // Export studyTime as CSV if available
                try {
                  if (!studyTime || !studyTime.labels || !studyTime.values) {
                    console.error('Study time data not available');
                    return;
                  }
                  const rows = studyTime.labels.map((label: string, index: number) => ({
                    date: label,
                    minutes: studyTime.values[index] ?? 0
                  }));
                  const header = 'date,minutes\n';
                  const csv = header + rows.map((r: any) => `${r.date},${r.minutes}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `studytime_export_${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error('Export failed', err);
                }
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white/80 text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            title="Best day (30d)"
            value={insights && insights.best_day?.date ? `${insights.best_day.date} (${insights.best_day.minutes}m)` : '—'}
          />

          <InsightCard
            title="Current streak"
            value={insights ? `${insights.current_streak_days} day${insights.current_streak_days !== 1 ? 's' : ''}` : '—'}
          />

          <InsightCard
            title="Avg session length"
            value={insights ? `${insights.avg_session_length_minutes}m` : '—'}
          />

          <InsightCard
            title="Best hour today"
            value={insights && insights.best_hour_today !== null ? `${insights.best_hour_today}:00 (${insights.best_hour_minutes_today}m)` : '—'}
          />
        </div>
      </div>


      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">⏱ Study Time (7 days)</h2>
          <StudyTimeChart data={studyTime} />
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">🎯 Goal Completion</h2>
          <GoalChart data={goals} />
        </div>
      </div>

    </div>
  );
}

function InsightCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl flex flex-col justify-between">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )
}
