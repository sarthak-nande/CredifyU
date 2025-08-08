import React from 'react'
import { Fingerprint, ChevronLeft, Database, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Hero from "./Hero";
import ActionTile from "./ActionTile";

export default function HomeScreen({
  role,
  roleName,
  RoleIcon,
  onBack,
}) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-5xl grid-rows-[auto_1fr_auto]">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Back to role selection"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-black text-white">
              <Fingerprint className="h-4 w-4" />
            </div>
            <div className="text-base font-semibold">CredifyU</div>
          </div>

          <div className="ml-auto flex items-center">
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 rounded-full border border-black bg-white text-black"
              aria-label={`Current role: ${roleName}`}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{roleName}</span>
            </Badge>
          </div>
        </div>
      </header>

      <section className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Hero roleName={roleName} />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ActionTile
              title="Your Data"
              description="View and manage your identity documents"
              icon={Database}
              onClick={() => {
                // Hook up routing or dialogs here
                alert("Your Data clicked")
              }}
            />
            <ActionTile
              title="Scan QR"
              description="Share or verify identity via QR"
              icon={QrCode}
              onClick={() => {
                alert("Scan QR clicked")
              }}
            />
          </div>
        </div>
      </section>

      <footer className="px-4 pb-4 pt-2 text-center text-xs text-muted-foreground md:px-6">
        Secure by CredifyU • v1.0
      </footer>
    </div>
  )
}
