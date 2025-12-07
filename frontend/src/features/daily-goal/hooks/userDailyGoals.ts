import { useEffect, useState } from "react";
import { DailyGoal } from "../types/dailyGoals.types";
import { dailyGoalsService } from "../services/dailyGoalsService";


export const useDailyGoals = () => {
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGoal = async () => {
    setLoading(true);
    try {
      const data = await dailyGoalsService.getToday();
      setGoal(data);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (minutes: number, quizzes: number) => {
    const updated = await dailyGoalsService.updateGoal({
      target_minutes: minutes,
      target_quiz_count: quizzes,
    });
    setGoal(updated);
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  return { goal, loading, fetchGoal, updateGoal };
};