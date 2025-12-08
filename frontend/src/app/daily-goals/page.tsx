"use client";

import DailyGoalForm from "@/features/daily-goal/components/DailyGoalPage";
import { FeatureLayout } from "@/shared/components/Navigation/FeatureLayout";

export default function DailyGoalsPage() {
  return (
    <FeatureLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3">
              📍 Daily Goals
            </h1>
            <p className="text-xl text-slate-400">
              Set your daily learning targets and track your progress towards mastery
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-white font-semibold mb-2">Study Duration</h3>
              <p className="text-slate-400 text-sm">Set your daily study minutes target</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="text-white font-semibold mb-2">Quiz Practice</h3>
              <p className="text-slate-400 text-sm">Track quiz questions completed daily</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-white font-semibold mb-2">Track Progress</h3>
              <p className="text-slate-400 text-sm">Monitor your daily achievements</p>
            </div>
          </div>

          {/* Form */}
          <DailyGoalForm />
        </div>
      </div>
    </FeatureLayout>
  );
}
