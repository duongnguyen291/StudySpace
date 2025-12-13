import { useEffect, useState } from "react";
import { AnalyticsService } from "../services/analyticsService";

export function useAnalytics(userId: string) {
  const [studyTime, setStudyTime] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    AnalyticsService.getStudyTime(userId)
      .then((res) => setStudyTime(res.data))
      .catch((err) => {
        console.error("Failed to fetch study time:", err);
      });

    AnalyticsService.getGoals(userId)
      .then((res) => setGoals(res.data))
      .catch((err) => {
        console.error("Failed to fetch goals:", err);
      });

    AnalyticsService.getDashboardSummary(userId)
      .then((res) => setSummary(res.data))
      .catch((err) => {
        console.error("Failed to fetch dashboard summary:", err);
      });

    AnalyticsService.getProgress(userId)
      .then((res) => setProgress(res.data))
      .catch((err) => {
        console.error("Failed to fetch progress:", err);
      });

    AnalyticsService.getInsights(userId)
      .then((res) => setInsights(res.data))
      .catch((err) => {
        console.error("Failed to fetch insights:", err);
      });

    AnalyticsService.getHeatmap(userId, 365)
      .then((res) => setHeatmap(res.data))
      .catch((err) => {
        console.error("Failed to fetch heatmap:", err);
      });

    AnalyticsService.getTrends(userId)
      .then((res) => setTrends(res.data))
      .catch((err) => {
        console.error("Failed to fetch trends:", err);
      });
  }, [userId]);

  return { studyTime, goals, summary, progress, insights, heatmap, trends };
}
