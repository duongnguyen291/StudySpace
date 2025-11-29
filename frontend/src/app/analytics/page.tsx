"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";

import StudyTimeChart from "@/features/analytics/components/StudyTimeChart";
import GoalChart from "@/features/analytics/components/GoalChart";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { studyTime, goals, summary } = useAnalytics(user?.id || "");

  if (!user) return <div className="text-white p-10">Vui lòng đăng nhập</div>;
  if (!studyTime || !goals || !summary)
    return <div className="text-white p-10">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen p-10 text-white">

      <h1 className="text-4xl font-bold mb-10">📊 Analytics Dashboard</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400">Tổng phút tuần này</h3>
          <p className="text-3xl font-bold">{summary.weekly_minutes}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400">Tiến độ hôm nay</h3>
          <p className="text-3xl font-bold">
            {summary.today_completion_percent}%
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-gray-400">Mục tiêu hôm nay</h3>
          <p className="text-3xl font-bold">
            {summary.today_actual_minutes}/{summary.today_target_minutes} phút
          </p>
        </div>
      </div>


      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">⏱ Thời gian học (7 ngày)</h2>
          <StudyTimeChart data={studyTime} />
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">🎯 Mức độ hoàn thành</h2>
          <GoalChart data={goals} />
        </div>
      </div>

    </div>
  );
}
