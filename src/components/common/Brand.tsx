import React from 'react'
import jkrLogo from '../../assets/jkr-logo.png'

export function Brand({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={jkrLogo}
        alt="JKR Malaysia Logo"
        className="h-9 w-9 object-contain drop-shadow-xs"
      />
      <div>
        <h1 className={`text-sm font-bold tracking-tight ${dark ? 'text-white' : 'text-foreground'}`}>
          JKR Malaysia
        </h1>
        <p className={`text-[10px] ${dark ? 'text-slate-400' : 'text-muted-foreground'}`}>
          Sistem Pengurusan Aduan Jalan
        </p>
      </div>
    </div>
  )
}

