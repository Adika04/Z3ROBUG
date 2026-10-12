import React from 'react'
import { CircleCheck, Sparkles, X } from 'lucide-react'

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null

  const isTelegram = message.includes('Telegram')

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex max-w-md items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 shadow-lg transition-all animate-in slide-in-from-bottom-5">
      {isTelegram ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
          <Sparkles size={16} />
        </span>
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CircleCheck size={16} />
        </span>
      )}
      <div className="flex-1 text-xs font-medium text-foreground">{message}</div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-foreground cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X size={15} />
      </button>
    </div>
  )
}

