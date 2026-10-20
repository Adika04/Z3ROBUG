import React from 'react'
const JKR_LOGO_URL =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/JKR_Malaysia_logo.png/1280px-JKR_Malaysia_logo.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail'

export function Brand({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={JKR_LOGO_URL}
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

