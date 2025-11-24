import Image from "next/image";
import { Achievement } from "../types/achievements.types";

interface Props {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: Props) {
  const icon = achievement.icon_url || "/icons/achievements/default.png";

  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition">
      <Image
        src={icon}
        alt={achievement.name}
        width={72}
        height={72}
        className="mb-3"
      />

      <h3 className="text-lg font-semibold">{achievement.name}</h3>
      <p className="text-sm text-gray-300 text-center">
        {achievement.description}
      </p>
    </div>
  );
}
