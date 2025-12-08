import { useEffect, useState } from "react";
import { DailyGoal } from "../types/dailyGoals.types";
import { dailyGoalsService } from "../services/dailyGoalsService";


export const useDailyGoals = () => {
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoal = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dailyGoalsService.getToday();
      setGoal(data);
    } catch (err: any) {
      console.error("Failed to fetch daily goal:", err);
      setError(err?.message || "Failed to load goal");
      // Set default goal on error
      setGoal({
        user_id: "",
        target_minutes: 30,
        target_quiz_count: 5,
        actual_minutes: 0,
        actual_quiz_count: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (minutes: number, quizzes: number) => {
    try {
      setError(null);
      const updated = await dailyGoalsService.updateGoal({
        target_minutes: minutes,
        target_quiz_count: quizzes,
      });
      setGoal(updated);
      return updated;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Failed to save goal";
      setError(errorMsg);
      console.error("Failed to update daily goal:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  return { goal, loading, error, fetchGoal, updateGoal };
};