import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function Hero({ roleName }) {
  return (
    <Card className="overflow-hidden border-0 bg-black text-white">
      <CardHeader className="p-5 md:p-6">
        <CardTitle className="text-lg font-semibold">Welcome, {roleName}</CardTitle>
        <CardDescription className="text-zinc-200">
          Secure access to your digital identity
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 pt-0 md:p-6 md:pt-0">
        <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
          <span className="text-sm text-zinc-200">Documents stored</span>
          <span className="font-semibold tracking-tight">12</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
          <span className="text-sm text-zinc-200">Verified credentials</span>
          <span className="font-semibold tracking-tight">4</span>
        </div>
      </CardContent>
    </Card>
  )
}
