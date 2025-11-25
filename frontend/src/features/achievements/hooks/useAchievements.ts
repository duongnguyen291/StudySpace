import { useEffect, useState } from "react";
import { achievementsService } from "../services/achievementsService";
import { Achievement } from "../types/achievements.types";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementsService
      .getUserAchievements()
      .then((data) => setAchievements(data))
      .finally(() => setLoading(false));
  }, []);

  return { achievements, loading };
}
