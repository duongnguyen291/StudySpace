import { apiClient } from "@/shared/utils/api";
import { Achievement } from "../types/achievements.types";

export const achievementsService = {
  async getUserAchievements(): Promise<Achievement[] | null> {
    try {
      const res = await apiClient.get("/achievements/me", {
        maxRedirects: 0,
        validateStatus: () => true,
      });

      // ⛔ Trường hợp backend redirect (307/308)
      if (res.status === 307 || res.status === 308) {
        return null;
      }

      // ⛔ Trường hợp backend trả 401
      if (res.status === 401) {
        return null;
      }

      // ✔ Chỉ RETURN data khi API trả 200
      if (res.status === 200) {
        return res.data as Achievement[];
      }

      // ⛔ Trường hợp status khác (500, 404...)
      return [];
    } catch (error: any) {
      console.error("Error fetching achievements:", error);
      return [];
    }
  },
};
