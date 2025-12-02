"use client";

import Link from "next/link";
import { useAchievements } from "@/features/achievements/hooks/useAchievements";

export default function AchievementsPage() {
  const { achievements, loading, unauthorized } = useAchievements();

  if (loading)
    return <p className="text-white p-4">Loading...</p>;

  if (unauthorized) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-white space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <img
          src="/icons/achievements/locked.png"
          className="w-20 h-20 opacity-80"
          alt="Locked Achievements"
        />
        <h2 className="text-2xl font-bold">Bạn chưa đăng nhập</h2>
        <p className="text-gray-400 max-w-md text-center">
          Vui lòng đăng nhập để xem danh sách thành tích của bạn và bắt đầu mở khóa chúng!
        </p>
      </div>

      <Link
        href="/login"
        className="mt-4 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-medium"
      >
        Đăng nhập ngay
      </Link>
    </div>
  );
}


  // ⭐ Phần UI cũ của bạn — giữ nguyên 100%
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🎖 Thành tích của bạn</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-4 rounded-lg border bg-gray-800 relative
              ${ach.earned ? "border-green-500" : "border-gray-700 opacity-50"}
            `}
          >
            <img
              src={ach.url || "/icons/default.png"}
              onError={(e) => {
                e.currentTarget.src = "/icons/achievements/default.png";
              }}
              className="w-12 h-12 mb-3"
            />

            <h2 className="text-xl font-semibold">{ach.name}</h2>
            <p className="text-gray-400 text-sm">{ach.description}</p>

            {!ach.earned && (
              <span className="absolute top-2 right-2 text-xs bg-gray-700 px-2 py-1 rounded">
                Locked
              </span>
            )}
            {ach.earned && (
              <span className="absolute top-2 right-2 text-xs bg-green-600 px-2 py-1 rounded">
                Earned
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}