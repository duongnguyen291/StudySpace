import React from "react"
import dynamic from "next/dynamic"

const QuizImportExport = dynamic(() => import("../../features/quiz/components/QuizImportExport"), { ssr: false })

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <QuizImportExport />
    </div>
  )
}
