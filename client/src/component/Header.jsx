import React from 'react'
import { Fingerprint } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Header({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 md:px-6">
        <div className="grid size-9 place-items-center rounded-xl bg-black text-white">
          <Fingerprint className="h-4 w-4" />
        </div>
        <div>
          <div className="text-base font-semibold leading-none">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </header>
  )
}
