'use client'

import React from 'react'
import { Lightbulb, TrendingUp, Clock, Target, BarChart3, Calendar } from 'lucide-react'

interface Suggestion {
  id: string
  text: string
  icon: React.ReactNode
  category: string
}

interface SuggestionsProps {
  onSelect: (suggestion: string) => void
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'analyze-habits',
    text: 'Phân tích thói quen học tập của tôi và đưa ra nhận xét',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Phân tích'
  },
  {
    id: 'study-advice',
    text: 'Đưa ra lời khuyên học tập dựa trên dữ liệu của tôi',
    icon: <Lightbulb className="w-4 h-4" />,
    category: 'Lời khuyên'
  },
  {
    id: 'best-time',
    text: 'Tôi nên học vào giờ nào trong ngày để hiệu quả nhất?',
    icon: <Clock className="w-4 h-4" />,
    category: 'Tối ưu'
  },
  {
    id: 'weekly-review',
    text: 'Đánh giá tuần học tập vừa qua của tôi',
    icon: <Calendar className="w-4 h-4" />,
    category: 'Đánh giá'
  },
  {
    id: 'improvement',
    text: 'Làm thế nào để cải thiện thời gian học tập của tôi?',
    icon: <TrendingUp className="w-4 h-4" />,
    category: 'Cải thiện'
  },
  {
    id: 'goal-suggestions',
    text: 'Gợi ý mục tiêu học tập phù hợp với tôi',
    icon: <Target className="w-4 h-4" />,
    category: 'Mục tiêu'
  }
]

export function Suggestions({ onSelect }: SuggestionsProps) {
  return (
    <div className="px-6 py-4 border-b border-slate-800/70 bg-slate-950/50">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span>Gợi ý câu hỏi</span>
        </h3>
        <p className="text-xs text-slate-400">
          Chọn một gợi ý để AI phân tích dữ liệu học tập của bạn
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion.text)}
            className="group text-left px-3 py-2.5 rounded-lg border border-slate-800/70 bg-slate-900/50 hover:bg-slate-800/70 hover:border-slate-700 transition-all duration-200"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-slate-400 group-hover:text-yellow-400 transition-colors">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 group-hover:text-white transition-colors leading-relaxed">
                  {suggestion.text}
                </p>
                <span className="text-xs text-slate-500 mt-1 inline-block">
                  {suggestion.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

