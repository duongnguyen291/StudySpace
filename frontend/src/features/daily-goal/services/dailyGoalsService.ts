import { apiClient } from "@/shared/utils/api";
import { DailyGoal } from "../types/dailyGoals.types";

export const dailyGoalsService = {
  getToday: async () => {
    try {
      console.log("Fetching daily goal from /daily-goals/today");
      const res = await apiClient.get("/daily-goals/today");
      console.log("Daily goal fetched:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("Get daily goal error:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        config: error?.config,
      });
      throw error;
    }
  },

  setToday: async (payload: { target_minutes: number; target_quiz_count: number }) => {
    try {
      console.log("Saving daily goal:", payload);
      const res = await apiClient.post("/daily-goals/today", payload);
      console.log("Daily goal saved:", res.data);
      return res.data;
    } catch (error: any) {
      console.error("Set daily goal error:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    }
  },

  updateGoal: async (payload: { target_minutes: number; target_quiz_count: number }) => {
    return dailyGoalsService.setToday(payload);
  },
};
