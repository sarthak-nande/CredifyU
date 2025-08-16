import React from 'react'
import { Fingerprint, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"

export default function Header({ title, subtitle, showBackButton = false, onBack }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 md:px-6">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-9 w-9 p-0 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
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
