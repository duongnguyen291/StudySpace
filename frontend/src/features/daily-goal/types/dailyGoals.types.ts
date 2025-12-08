export interface DailyGoal {
  id: string;
  user_id: string;
  goal_date: string;
  target_minutes: number;
  target_quiz_count: number;
  actual_minutes: number;
  actual_quiz_count: number;
  completed: boolean;
}
