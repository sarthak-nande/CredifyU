import React from 'react'

export default function ActionTile({
  title,
  description,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-2xl border border-zinc-200 bg-white p-0 text-left transition-colors",
        "hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-black/50"
      )}
      aria-label={title}
    >
      <div className="flex items-stretch gap-0">
        <div className="grid place-items-center p-4 md:p-6">
          <div className="grid size-12 place-items-center rounded-xl bg-black text-white">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="flex min-h-28 flex-1 items-center">
          <div className="grid gap-1 p-4 pr-5 md:p-6">
            <div className="text-base font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
      </div>
    </button>
  )
}