"use client";

import { useAchievements } from "@/features/achievements/hooks/useAchievements";

export default function AchievementsPage() {
  const { achievements, loading } = useAchievements();

  if (loading) return <p className="text-white p-4">Loading...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🎖 Thành tích của bạn</h1>

      {achievements.length === 0 && (
        <p className="text-gray-400">Bạn chưa có thành tích nào.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className="p-4 rounded-lg bg-gray-800 border border-gray-700"
          >
            <img
              src={ach.icon_url || "/icons/default.png"}
              className="w-12 h-12 mb-3"
            />

            <h2 className="text-xl font-semibold">{ach.name}</h2>
            <p className="text-gray-400 text-sm">{ach.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
