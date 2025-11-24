import { Achievement } from "../types/achievements.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const achievementsService = {
  async getUserAchievements(): Promise<Achievement[]> {
    const res = await fetch(`${BASE_URL}/achievements/me`, {
      credentials: "include",
    });

    if (!res.ok) return [];
    return res.json();
  },
};
