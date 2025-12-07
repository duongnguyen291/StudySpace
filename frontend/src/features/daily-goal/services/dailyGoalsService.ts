import { apiClient } from "@/shared/utils/api";
import { DailyGoal } from "../types/dailyGoals.types";

export const dailyGoalsService = {
  getToday: async () => {
    const res = await apiClient.get("/daily-goals/today");
    return res.data;
  },

  setToday: async (payload: { target_minutes: number; target_quiz_count: number }) => {
    const res = await apiClient.post("/daily-goals/today", payload);
    return res.data;
  },

  updateGoal: async (payload: { target_minutes: number; target_quiz_count: number }) => {
    const res = await apiClient.post("/daily-goals/today", payload);
    return res.data;
  },
};
