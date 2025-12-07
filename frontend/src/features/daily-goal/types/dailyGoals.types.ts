export interface DailyGoal {
  id: string | null;
  goal_date: string | null;
  target_minutes: number;
  target_quiz_count: number;
  actual_minutes: number;
  actual_quiz_count: number;
  completed: boolean;
}
