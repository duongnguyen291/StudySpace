import { AchievementCard } from "./AchievementCard";
import { AchievementEmpty } from "./AchievementEmpty";
import { Achievement } from "../types/achievements.types";

interface Props {
  achievements: Achievement[];
  isLoading: boolean;
}

export function AchievementList({ achievements, isLoading }: Props) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-40 bg-slate-700/40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return <AchievementEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {achievements.map((a) => (
        <AchievementCard key={a.id} achievement={a} />
      ))}
    </div>
  );
}
