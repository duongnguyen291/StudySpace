import { apiClient } from "@/shared/utils/api";
import { Achievement } from "../types/achievements.types";

export const achievementsService = {
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      // Không cần BASE_URL và fetch nữa
      const res = await apiClient.get("/achievements/me");

      return res.data;
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return [];
    }
  },
};
