"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useAnalytics } from "@/features/analytics/hook/useAnalytics";
import { Download, BarChart3, Calendar, TrendingUp } from "lucide-react";

import StudyTimeChart from "@/features/analytics/components/StudyTimeChart";
import GoalChart from "@/features/analytics/components/GoalChart";
import { HeatmapCalendar } from "@/features/analytics/components/HeatmapCalendar";
import { ProductivityTrends } from "@/features/analytics/components/ProductivityTrends";

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-10 text-white">
      <h1 className="text-4xl font-bold mb-10">📊 Bảng phân tích</h1>

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
        <h2 className="text-2xl font-semibold mb-4">🔎 Phân tích chi tiết</h2>
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
  const { studyTime, goals, summary, insights, heatmap, trends } = useAnalytics(user?.id || "");

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-400">Bạn cần đăng nhập để xem phân tích</p>
        </div>
      </div>
    );
  }

  if (!studyTime || !goals || !summary)
    return <SkeletonLoader />;

  // Use real heatmap data from API
  const heatmapData = heatmap || [];

  // Use real trends data from API
  const weeklyTrend = trends?.weekly_trend ? {
    current: trends.weekly_trend.current,
    previous: trends.weekly_trend.previous,
    label: 'Tuần này',
    unit: 'phút'
  } : null;

  const monthlyTrend = trends?.monthly_trend ? {
    current: trends.monthly_trend.current,
    previous: trends.monthly_trend.previous,
    label: 'Tháng này',
    unit: 'phút'
  } : null;

  const growthRate = trends?.growth_rate || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-10 text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-blue-400" />
              Bảng phân tích
            </h1>
            <p className="text-gray-400">
              Phân tích dài hạn và xu hướng học tập của bạn
            </p>
          </div>
          <button
            onClick={() => {
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
                console.error('Export failed', err);
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 text-sm">Trung bình phút/ngày (7 ngày)</h3>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{insights?.avg_minutes_per_day_7d || '—'}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 text-sm">Tiến độ hôm nay</h3>
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {summary.today_completion_percent}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 text-sm">Mục tiêu hôm nay</h3>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {summary.today_actual_minutes}/{summary.today_target_minutes} phút
          </p>
        </div>
      </div>

      {/* PRODUCTIVITY TRENDS */}
      {(weeklyTrend || monthlyTrend || growthRate !== undefined) && (
        <div className="mb-8">
          <ProductivityTrends 
            weeklyTrend={weeklyTrend || undefined}
            monthlyTrend={monthlyTrend || undefined}
            growthRate={growthRate}
          />
        </div>
      )}

      {/* INSIGHTS */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          Phân tích chi tiết
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightCard
            title="Ngày tốt nhất (30 ngày)"
            value={insights && insights.best_day?.date ? `${insights.best_day.date} (${insights.best_day.minutes} phút)` : '—'}
            icon="🏆"
          />

          <InsightCard
            title="Chuỗi ngày liên tiếp"
            value={insights ? `${insights.current_streak_days} ngày` : '—'}
            icon="🔥"
          />

          <InsightCard
            title="Độ dài phiên trung bình"
            value={insights ? `${insights.avg_session_length_minutes} phút` : '—'}
            icon="⏱️"
          />

          <InsightCard
            title="Giờ tốt nhất hôm nay"
            value={insights && insights.best_hour_today !== null ? `${insights.best_hour_today}:00 (${insights.best_hour_minutes_today} phút)` : '—'}
            icon="⭐"
          />
        </div>
      </div>


      {/* HEATMAP CALENDAR */}
      {heatmapData.length > 0 && (
        <div className="mb-8">
          <HeatmapCalendar data={heatmapData} />
        </div>
      )}

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Thời gian học tập (7 ngày)
          </h2>
          <StudyTimeChart data={studyTime} />
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Hoàn thành mục tiêu
          </h2>
          <GoalChart data={goals} />
        </div>
      </div>

    </div>
  );
}

function InsightCard({ title, value, icon }: { title: string; value: string | number; icon?: string }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 flex flex-col justify-between hover:bg-gray-800/70 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <div className="text-sm text-gray-400">{title}</div>
      </div>
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
    </div>
  )
}
