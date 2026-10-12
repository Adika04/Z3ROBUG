import React from 'react'
import { priorityClasses, priorityNames } from '../../data/initialCases'

export function PriorityBadge({ value }: { value: number }) {
  const index = Math.max(0, Math.min(value - 1, 4))
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold ${priorityClasses[index]}`}
    >
      <span className="text-[9px]">●</span>P{value} · {priorityNames[index]}
    </span>
  )
}

