import api from "@/shared/utils/api";

export const AnalyticsService = {
  getStudyTime: (userId: string) =>
    api.get(`/analytics/study-time?user_id=${userId}`),

  getGoals: (userId: string) =>
    api.get(`/analytics/goals?user_id=${userId}`),

  getDashboardSummary: (userId: string) =>
    api.get(`/analytics/dashboard?user_id=${userId}`),

  getProgress: (userId: string) =>
    api.get(`/analytics/progress?user_id=${userId}`),
};
