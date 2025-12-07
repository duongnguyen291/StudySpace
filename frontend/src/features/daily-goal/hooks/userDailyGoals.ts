import { useEffect, useState } from "react";
import { DailyGoal } from "../types/dailyGoals.types";
import { dailyGoalsService } from "../services/dailyGoalsService";


export function userDailyGoal() {
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGoal = async () => {
    try {
      const res = await dailyGoalsService.getToday();

      // always set goal, even when id = null
      setGoal(
        res || {
          id: null,
          goal_date: null,
          target_minutes: 0,
          target_quiz_count: 0,
          actual_minutes: 0,
          actual_quiz_count: 0,
          completed: false,
        }
      );
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
}

 