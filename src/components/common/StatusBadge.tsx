import React from 'react'

export function StatusBadge({ value }: { value: string }) {
  const getStyle = () => {
    switch (value) {
      case 'Resolved':
        return 'bg-accent text-teal-ink'
      case 'In Progress':
        return 'bg-slate-100 text-navy'
      case 'Assessed':
        return 'bg-blue-50 text-blue-700'
      case 'Submitted':
        return 'bg-amber-50 text-amber-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${getStyle()}`}
    >
      <span className="text-[8px]">●</span>
      {value}
    </span>
  )
}

