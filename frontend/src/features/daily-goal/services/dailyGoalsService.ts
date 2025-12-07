import { apiClient } from "@/shared/utils/api";
import { DailyGoal } from "../types/dailyGoals.types";

export const dailyGoalsService = {
  getToday: async (): Promise<DailyGoal | null> => {
    const res = await apiClient.get("/daily-goals/today");
    return res.data || null;
  },

  updateGoal: async (payload: {
    target_minutes: number;
    target_quiz_count: number;
  }): Promise<DailyGoal> => {
    const res = await apiClient.post("/daily-goals/today", payload);
    return res.data;
  },
};
