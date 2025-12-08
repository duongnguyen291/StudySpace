"use client";

import { useState, useEffect } from "react";
import { useDailyGoals } from "../hooks/userDailyGoals";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// CSS để ẩn spinner của number input
const inputNumberStyles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

export default function DailyGoalForm() {
  const { goal, updateGoal, loading } = useDailyGoals();
  const [minutes, setMinutes] = useState(30);
  const [quizzes, setQuizzes] = useState(5);
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Update form when goal loads
  useEffect(() => {
    if (goal) {
      setMinutes(goal.target_minutes || 30);
      setQuizzes(goal.target_quiz_count || 5);
    }
  }, [goal]);

  const handleSave = async () => {
    try {
      setSavedStatus("saving");
      setErrorMsg("");
      await updateGoal(minutes, quizzes);
      setSavedStatus("success");
      setTimeout(() => setSavedStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Save error details:", error);
      let msg = "Failed to save goal";
      
      if (error?.response?.status === 401) {
        msg = "Authentication failed - please login again";
      } else if (error?.response?.data?.detail) {
        msg = error.response.data.detail;
      } else if (error?.message === "Network Error") {
        msg = "Cannot connect to server - make sure backend is running on port 8000";
      } else if (error?.message) {
        msg = error.message;
      }
      
      setErrorMsg(msg);
      setSavedStatus("error");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <style>{inputNumberStyles}</style>
      {/* Error Alert */}
      {savedStatus === "error" && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error saving goal</p>
            <p className="text-red-300/80 text-sm mt-1">{errorMsg || "Please try again"}</p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-white">Today's Learning Goals</h2>
        <p className="text-slate-400 mb-8">Set your daily targets to stay focused and motivated</p>

        {/* Minutes Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            ⏱️ Study Minutes Target
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={minutes}
              onChange={(e) => {
                const val = e.target.value;
                const num = val === '' ? 0 : parseInt(val, 10);
                setMinutes(Math.max(0, isNaN(num) ? 0 : num));
              }}
              className="w-full px-4 py-4 pr-14 rounded-lg bg-slate-700/50 border-2 border-blue-500/50 hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white text-lg font-semibold text-center outline-none transition"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">min</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">How many minutes do you want to study today?</p>
        </div>

        {/* Quiz Counter */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            🧠 Quiz Questions Target
          </label>

          <div className="flex items-center gap-6 justify-center bg-slate-700/30 rounded-lg p-6 border border-slate-600/30">
            <button
              onClick={() => setQuizzes((q) => Math.max(0, q - 1))}
              className="w-12 h-12 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-2xl font-bold flex items-center justify-center transition-colors"
              title="Decrease"
            >
              −
            </button>

            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400">
                {quizzes}
              </div>
              <p className="text-slate-400 text-sm mt-2">questions</p>
            </div>

            <button
              onClick={() => setQuizzes((q) => q + 1)}
              className="w-12 h-12 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-2xl font-bold flex items-center justify-center transition-colors"
              title="Increase"
            >
              +
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-3">How many quiz questions do you want to answer?</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading || savedStatus === "saving"}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
            savedStatus === "success"
              ? "bg-green-600/50 border border-green-500/50 text-green-100"
              : savedStatus === "saving"
              ? "bg-blue-600/50 text-blue-100"
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/50"
          }`}
        >
          {savedStatus === "saving" && <span className="animate-spin">⏳</span>}
          {savedStatus === "success" && <CheckCircle2 className="w-5 h-5" />}
          {savedStatus === "success" ? "Goal Saved!" : savedStatus === "saving" ? "Saving..." : "Save Goal"}
        </button>

        {/* Current Goal Summary */}
        {goal && (
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Today's Progress</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-sm mb-2">Study Minutes</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-400">{goal.actual_minutes}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-xl text-slate-300">{goal.target_minutes}</span>
                </div>
                <div className="mt-3 w-full bg-slate-600/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${goal.target_minutes > 0 ? (goal.actual_minutes / goal.target_minutes) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-sm mb-2">Quiz Questions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-purple-400">{goal.actual_quiz_count}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-xl text-slate-300">{goal.target_quiz_count}</span>
                </div>
                <div className="mt-3 w-full bg-slate-600/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${goal.target_quiz_count > 0 ? (goal.actual_quiz_count / goal.target_quiz_count) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
