"use client";

import { useState } from "react";
import { useDailyGoals } from "../hooks/userDailyGoals";

export default function DailyGoalForm() {
  const { goal, updateGoal, loading } = useDailyGoals();

  const [minutes, setMinutes] = useState(goal?.target_minutes || 30);
  const [quizzes, setQuizzes] = useState(goal?.target_quiz_count || 5);

  const handleSave = async () => {
    await updateGoal(minutes, quizzes);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Daily Goal Setup
      </h2>

      {/* Minutes Input */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">
          Total Focus Minutes
        </label>
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="Enter minutes (e.g., 30)"
        />
      </div>

      {/* Quiz Counter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">
          Number of Quizzes
        </label>

        <div className="flex items-center gap-4 justify-center">
          <button
            onClick={() => setQuizzes((q) => Math.max(0, q - 1))}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl flex items-center justify-center"
          >
            −
          </button>

          <span className="text-xl font-semibold w-10 text-center">
            {quizzes}
          </span>

          <button
            onClick={() => setQuizzes((q) => q + 1)}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Goal"}
      </button>

      {/* Current Goal Summary */}
      {goal && (
        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Today's Goal:</strong> {goal.target_minutes} min,{" "}
            {goal.target_quiz_count} quizzes
          </p>
          <p>
            <strong>Progress:</strong> {goal.actual_minutes} min,{" "}
            {goal.actual_quiz_count} quizzes
          </p>
          <p>
            <strong>Status:</strong> {goal.completed ? "Completed" : "In progress"}
          </p>
        </div>
      )}
    </div>
  );
}
