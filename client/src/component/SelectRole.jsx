"use client"

import { useMemo, useState } from "react"
import { ArrowRight, ChevronLeft, QrCode, ShieldCheck, GraduationCap, Building2, Database, Fingerprint } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Header from "./Header"
import ActionTile from "./ActionTile"


const ROLES = [
  { id: "student", name: "Student", description: "Access and share your credentials", icon: GraduationCap },
  { id: "college", name: "College", description: "Issue and manage student records", icon: Building2 },
  { id: "authority", name: "Third Party Authority", description: "Verify identities and documents", icon: ShieldCheck },
]

export default function SelectRoleScreen({
  role,
  onChangeRole,
  onNext,
}) {
  
  return (
    <div className="mx-auto grid min-h-dvh max-w-3xl grid-rows-[auto_1fr_auto]">
      <Header title="CredifyU" subtitle="Store and verify student identities" />

      <section className="px-4 pb-24 pt-2 md:px-6">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight">Select your role</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose how you want to use CredifyU</p>

          <RadioGroup
            value={role}
            onValueChange={(val) => onChangeRole(val)}
            className="mt-6 grid gap-3"
            aria-label="Select your role"
          >
            {ROLES.map((r) => (
              <RoleOption
                key={r.id}
                id={r.id}
                name={r.name}
                description={r.description}
                icon={r.icon}
                selected={role === r.id}
                onSelect={() => onChangeRole(r.id)}
              />
            ))}
          </RadioGroup>
        </div>
      </section>

      <div
        className="sticky bottom-0 z-10 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0px)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-4 py-3 md:px-6">
          <Button
            className={cn(
              "rounded-full px-6",
              "bg-black hover:bg-zinc-900 text-white shadow-sm"
            )}
            onClick={onNext}
            disabled={!role}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


function RoleOption({
  id,
  name,
  description,
  selected,
  onSelect,
  icon: Icon,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect()
      }}
      className={cn(
        "group relative rounded-2xl border transition-colors",
        "hover:bg-zinc-50",
        selected ? "border-black bg-zinc-50" : "border-muted"
      )}
      aria-pressed={selected}
    >
      <Card className="border-0 shadow-none">
        <CardContent className="flex items-start gap-4 p-4">
          <div
            className={cn(
              "grid size-11 place-items-center rounded-xl",
              selected ? "bg-black text-white" : "bg-muted text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="grid grow">
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription className="mt-0.5">{description}</CardDescription>
          </div>

          <div className="pt-1">
            <RadioGroupItem id={`role-${id}`} value={id} className="sr-only" />
            <div
              className={cn(
                "size-5 rounded-full border",
                selected ? "border-black ring-4 ring-black/10" : "border-muted-foreground/30"
              )}
              aria-hidden="true"
            />
            <Label htmlFor={`role-${id}`} className="sr-only">
              {name}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






