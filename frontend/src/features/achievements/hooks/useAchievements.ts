import { useEffect, useState } from "react";
import { achievementsService } from "../services/achievementsService";
import { Achievement } from "../types/achievements.types";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await achievementsService.getUserAchievements();

      if (res === null) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setAchievements(res);
      setLoading(false);
    }

    load();
  }, []);

  return { achievements, loading, unauthorized };
}
