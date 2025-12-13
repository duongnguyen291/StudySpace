import Image from "next/image";

export function AchievementEmpty() {
  return (
    <div className="flex flex-col items-center text-center py-16 space-y-4">
      <Image
        src="/icons/achievements/default.png"
        alt="Chưa có thành tựu"
        width={80}
        height={80}
      />
      <h2 className="text-xl font-semibold">Bạn chưa có thành tựu nào</h2>
      <p className="text-gray-400 max-w-md">
        Hãy bắt đầu học tập hoặc làm quiz để mở khóa những thành tựu đầu tiên!
      </p>
    </div>
  );
}
