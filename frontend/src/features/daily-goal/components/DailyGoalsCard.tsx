"use client";

import { useState } from "react";
import { useDailyGoals } from "../hooks/userDailyGoals";

export default function DailyGoalsCard() {
  const { goal, loading, updateGoal } = useDailyGoals();

  const [minutes, setMinutes] = useState(goal?.target_minutes ?? 30);
  const [quiz, setQuiz] = useState(goal?.target_quiz_count ?? 5);

  if (loading) return <div className="text-center">Loading...</div>;

  const onSave = async () => {
    await updateGoal(minutes, quiz);
    alert("Daily goals updated!");
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Daily Goals</h2>

      <div className="mb-3">
        <label className="block text-sm font-medium">Target Study Minutes</label>
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">Target Quiz Count</label>
        <input
          type="number"
          value={quiz}
          onChange={(e) => setQuiz(Number(e.target.value))}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      <button
        onClick={onSave}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
      >
        Save Daily Goal
      </button>

      {goal && (
        <div className="mt-5 text-sm text-gray-700">
          <p>Progress:</p>
          <p>• Study: {goal.actual_minutes}/{goal.target_minutes}</p>
          <p>• Quiz: {goal.actual_quiz_count}/{goal.target_quiz_count}</p>
          <p>
            • Status:{" "}
            {goal.completed ? (
              <span className="text-green-600 font-semibold">Completed</span>
            ) : (
              "In progress"
            )}
          </p>
        </div>
      )}
    </div>
  );
}
