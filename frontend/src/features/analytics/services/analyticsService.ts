import { apiClient as api } from "@/shared/utils/api";

export const AnalyticsService = {
  getStudyTime: (userId: string) =>
    api.get(`/analytics/study-time`),

  getGoals: (userId: string) =>
    api.get(`/analytics/goals`),

  getDashboardSummary: (userId: string) =>
    api.get(`/analytics/dashboard`),

  getProgress: (userId: string) =>
    api.get(`/analytics/progress`),

  getInsights: (userId: string) =>
    api.get(`/analytics/insights`),

  getHeatmap: (userId: string, days: number = 365) =>
    api.get(`/analytics/heatmap`, { params: { days } }),

  getTrends: (userId: string) =>
    api.get(`/analytics/trends`),
};
