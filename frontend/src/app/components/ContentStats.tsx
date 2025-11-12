'use client'

import { useEffect, useState } from 'react'

interface Idea {
  id: number
  title: string
  description: string | null
  persona: string | null
  industry: string | null
  status: string
  created_at: string
}

interface ContentStatsProps {
  ideas: Idea[]
  className?: string
}

export default function ContentStats({
  ideas,
  className = '',
}: ContentStatsProps) {
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const totalIdeas = ideas.length
  const approvedIdeas = ideas.filter(idea => idea.status === 'approved').length
  const draftIdeas = ideas.filter(idea => idea.status === 'draft').length
  const rejectedIdeas = ideas.filter(idea => idea.status === 'rejected').length

  // Animate total count
  useEffect(() => {
    if (totalIdeas === 0) {
      setAnimatedTotal(0)
      return
    }

    const duration = 500
    const steps = 30
    const increment = totalIdeas / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const nextValue = Math.min(
        Math.floor(increment * currentStep),
        totalIdeas
      )
      setAnimatedTotal(nextValue)

      if (currentStep >= steps) {
        setAnimatedTotal(totalIdeas)
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [totalIdeas])

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 flex-wrap text-xs">
        {/* Total Ideas Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
          <span className="font-medium text-blue-600">Tổng:</span>
          <span className="font-semibold text-blue-900 tabular-nums">
            {animatedTotal}
          </span>
        </div>

        {/* Approved Ideas Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
          <span className="font-medium text-green-600">Duyệt:</span>
          <span className="font-semibold text-green-900">
            {approvedIdeas}
          </span>
        </div>

        {/* Draft Ideas Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
          <span className="font-medium text-yellow-600">Nháp:</span>
          <span className="font-semibold text-yellow-900">
            {draftIdeas}
          </span>
        </div>

        {/* Rejected Ideas Badge */}
        {rejectedIdeas > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full">
            <span className="font-medium text-red-600">Từ chối:</span>
            <span className="font-semibold text-red-900">
              {rejectedIdeas}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}