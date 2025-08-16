import React from 'react'
import { Link } from "react-router-dom"
import { ArrowRight, Fingerprint, GraduationCap, Building2, ShieldCheck, QrCode, Database, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-white text-black">
      <SiteHeader />
      <HeroSection />
      <TrustedByStrip />
      <FeaturesGrid />
      <HowItWorks />
      <FAQSection />
      <SiteFooter />
    </main>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="CredifyU home">
          <div className="grid size-9 place-items-center rounded-xl bg-black text-white">
            <Fingerprint className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold">CredifyU</span>
          <Badge variant="outline" className="ml-1 hidden border-black text-xs font-medium md:inline-flex">Beta</Badge>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 text-sm md:flex">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#how" className="hover:underline">How it works</a>
          <a href="#faq" className="hover:underline">FAQ</a>
        </nav>

        <div className="ml-auto md:ml-4">
          <Button asChild className="rounded-full bg-black text-white hover:bg-zinc-900">
            <Link to="/user/select-role">
              Open App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="border-b bg-black text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-6 md:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
            <span className="inline-block size-1.5 rounded-full bg-white" aria-hidden="true" />
            Privacy-first digital identity
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Own your digital student identity with CredifyU
          </h1>
          <p className="mt-3 text-sm text-zinc-200 md:text-base">
            Store verified credentials, share via secure QR, and streamline verification between Students, Colleges, and Third Party Authorities.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-full bg-white text-black hover:bg-zinc-100">
              <Link to="/user/select-role">
                Open App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full border-white bg-transparent text-white hover:bg-white/10">
              <a href="#features">Explore features</a>
            </Button>
          </div>

          <ul className="mt-6 grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              No color distractions — crisp black & white UI
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              QR-based sharing and verification
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Role-based access: Student, College, Authority
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Built for mobile and desktop (PWA-ready)
            </li>
          </ul>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-white/20">
            <img
              src="/desktop-preview.svg"
              alt="CredifyU app desktop preview"
              className="hidden h-auto w-full md:block"
              width={960}
              height={640}
            />
            <img
              src="/mobile-preview.svg"
              alt="CredifyU app mobile preview"
              className="block h-auto w-full md:hidden"
              width={420}
              height={640}
            />
          </div>
          <div className="pointer-events-none absolute -bottom-4 -right-4 hidden rotate-6 rounded-xl border border-white/20 bg-white/5 p-3 md:block">
            <span className="text-xs text-zinc-200">Preview</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustedByStrip() {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 py-6 md:gap-10 md:px-6">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Trusted by</span>
        <Logo text="Institutions" />
        <Logo text="Universities" />
        <Logo text="Verifiers" />
        <Logo text="EdTech" />
      </div>
    </section>
  )
}

function Logo({ text }) {
  return (
    <div className="flex items-center gap-2 text-zinc-700">
      <div className="size-2 rounded-full bg-black" aria-hidden="true" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

function FeaturesGrid() {
  return (
    <section id="features" className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Built for every role</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Simple, secure workflows for Students, Colleges, and Third Party Authorities.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={GraduationCap}
            title="Student"
            description="Store transcripts, IDs, and credentials. Share via QR with full control."
            points={["Private & portable", "One-tap QR share", "Role-specific actions"]}
          />
          <FeatureCard
            icon={Building2}
            title="College"
            description="Issue verified records and manage requests effortlessly."
            points={["Issue & revoke", "Audit-friendly", "Bulk operations"]}
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Third Party Authority"
            description="Verify authenticity instantly with QR or secure links."
            points={["Instant verification", "Tamper-evident", "Traceable proofs"]}
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description, points }) {
  return (
    <Card className="border-zinc-200">
      <CardHeader>
        <div className="grid size-10 place-items-center rounded-lg bg-black text-white">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="mt-2 text-lg">{title}</CardTitle>
        <CardDescription className="text-zinc-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 text-sm text-zinc-700">
          {points.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 text-sm text-zinc-600">Get started in minutes across devices.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StepCard
            step="01"
            title="Choose your role"
            description="Open the app and select Student, College, or Third Party Authority."
            icon={Fingerprint}
          />
          <StepCard
            step="02"
            title="Add or issue data"
            description="Students store documents; Colleges issue verified records."
            icon={Database}
          />
          <StepCard
            step="03"
            title="Scan or share QR"
            description="Share your identity or verify using a secure QR workflow."
            icon={QrCode}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild className="rounded-full bg-black text-white hover:bg-zinc-900">
            <Link to="/user/select-role">
              Open App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, title, description, icon: Icon }) {
  return (
    <Card className="border-zinc-200">
      <CardHeader className="flex-row items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-black text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-sm tracking-widest text-zinc-500">{step}</CardTitle>
          <div className="text-base font-semibold">{title}</div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function FAQSection() {
  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <p className="mt-2 text-sm text-zinc-600">Everything you need to know about CredifyU.</p>
        </div>

        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger className="text-left">Is CredifyU free for students?</AccordionTrigger>
              <AccordionContent className="text-sm text-zinc-700">
                Yes, students can store and share their credentials for free. Institutions and verifiers may have enterprise options.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="text-left">What formats of credentials do you support?</AccordionTrigger>
              <AccordionContent className="text-sm text-zinc-700">
                PDFs and images today, with roadmap support for verifiable credential formats and attestations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="text-left">How does QR verification work?</AccordionTrigger>
              <AccordionContent className="text-sm text-zinc-700">
                The app generates a secure QR that encodes a verification reference. Authorities scan to view authenticity details without accessing private data.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4">
              <AccordionTrigger className="text-left">Is it PWA-ready for mobile?</AccordionTrigger>
              <AccordionContent className="text-sm text-zinc-700">
                Yes. CredifyU is built to work great on desktop and mobile and can be installed as a PWA.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild className="rounded-full bg-black text-white hover:bg-zinc-900">
            <Link to="/student/role">
              Open App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-zinc-600 md:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-black text-white">
            <Fingerprint className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-black">CredifyU</span>
          <span className="text-zinc-500">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="hover:underline">Features</a>
          <a href="#how" className="hover:underline">How it works</a>
          <a href="#faq" className="hover:underline">FAQ</a>
          <Link to="/student/role" className="font-medium hover:underline">Open App</Link>
        </div>
      </div>
    </footer>
  )
}