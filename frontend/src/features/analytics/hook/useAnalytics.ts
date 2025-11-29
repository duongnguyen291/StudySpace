import { useEffect, useState } from "react";
import { AnalyticsService } from "../services/analyticsService";

export function useAnalytics(userId: string) {
  const [studyTime, setStudyTime] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    AnalyticsService.getStudyTime(userId).then((res) =>
      setStudyTime(res.data)
    );

    AnalyticsService.getGoals(userId).then((res) =>
      setGoals(res.data)
    );

    AnalyticsService.getDashboardSummary(userId).then((res) =>
      setSummary(res.data)
    );

    AnalyticsService.getProgress(userId).then((res) =>
      setProgress(res.data)
    );
  }, [userId]);

  return { studyTime, goals, summary, progress };
}
