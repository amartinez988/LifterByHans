import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileSearch,
  Phone,
  Shield,
  Sparkles,
  Users,
  Wrench,
  AlertTriangle,
  BarChart3,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Compliance tracking",
    description: "Never miss an inspection deadline. Get alerts before certificates expire.",
    icon: FileSearch
  },
  {
    title: "Unit management",
    description: "Track every elevator and escalator across all your buildings in one place.",
    icon: Building2
  },
  {
    title: "Emergency dispatch",
    description: "Log callbacks, assign mechanics, and track resolution times.",
    icon: Phone
  },
  {
    title: "Maintenance records",
    description: "Complete service history for every unit, accessible from anywhere.",
    icon: ClipboardCheck
  },
  {
    title: "Job scheduling",
    description: "Plan work, assign technicians, and track job status in real-time.",
    icon: Calendar
  },
  {
    title: "Team management",
    description: "Manage mechanics, inspectors, and property contacts in one system.",
    icon: Users
  }
];

const benefits = [
  {
    stat: "100%",
    label: "Inspection visibility",
    description: "See expiring and overdue certifications at a glance"
  },
  {
    stat: "1",
    label: "Central system",
    description: "Replace spreadsheets, paper files, and scattered notes"
  },
  {
    stat: "24/7",
    label: "Access anywhere",
    description: "Cloud-based so your team can work from the field"
  }
];

const painPoints = [
  "Tracking inspections across hundreds of units",
  "Finding service history when you need it",
  "Coordinating emergency callbacks",
  "Managing compliance deadlines",
  "Keeping property managers informed"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src="/icon.svg" alt="Uplio" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">UPLIO</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link 
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition" 
              href="/login"
            >
              Log in
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/contact">Request Demo</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50" />
        <div className="absolute inset-0 bg-mesh-pattern" />
        
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-medium text-brand-700">Elevator Service Management</span>
              </div>
              
              <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                Stop chasing paperwork.{" "}
                <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                  Start running your business.
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 md:text-xl">
                UPLIO is the all-in-one platform for elevator and escalator service 
                companies. Track units, manage compliance, dispatch emergencies, and 
                keep your entire operation running smoothly.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="xl">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link href="/contact">Request Demo</Link>
                </Button>
              </div>
              
              <p className="text-sm text-slate-500">
                No credit card required • Set up in under 5 minutes
              </p>
            </div>

            {/* Pain points card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-500/20 to-accent-500/20 blur-2xl" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
                    <AlertTriangle className="h-5 w-5 text-accent-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Sound familiar?</p>
                </div>
                <ul className="space-y-4">
                  {painPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <span className="text-xs font-bold text-slate-600">{i + 1}</span>
                      </div>
                      <span className="text-slate-600">{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-2xl bg-gradient-to-r from-brand-50 to-accent-50 p-4">
                  <p className="text-sm font-semibold text-brand-700">
                    ✨ UPLIO solves all of this — and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.label} className="text-center">
              <p className="font-display text-5xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                {benefit.stat}
              </p>
              <p className="mt-2 font-semibold text-slate-900">{benefit.label}</p>
              <p className="mt-1 text-sm text-slate-500">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-slate-600">Everything you need</span>
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              Built for elevator service professionals
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From independent contractors to large service companies, UPLIO 
              adapts to how you work.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 transition-colors group-hover:bg-brand-100">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5">
              <Zap className="h-4 w-4 text-accent-400" />
              <span className="text-sm font-medium text-white/80">Simple to start</span>
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold text-white md:text-4xl">
              Up and running in minutes
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Create your workspace", desc: "Sign up and set up your company profile in under a minute." },
              { step: "2", title: "Add your portfolio", desc: "Import your management companies, buildings, and units." },
              { step: "3", title: "Stay in control", desc: "Track inspections, schedule jobs, and manage your team." }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/25">
                  <span className="font-display text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-accent-200 bg-gradient-to-br from-accent-50 to-white p-8 md:p-12">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-accent-200/50 blur-3xl" />
            
            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-sm font-semibold text-accent-700">
                  <Shield className="h-4 w-4" />
                  Compliance matters
                </div>
                <h2 className="mt-6 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                  Never get caught off guard by an expired certificate again
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  UPLIO tracks every inspection date and alerts you before 
                  certificates expire. Stay compliant without the stress.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Automatic expiration tracking",
                    "Dashboard alerts for at-risk units",
                    "Complete inspection history",
                    "Certificate status at a glance"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success-500" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
                      <Clock className="h-6 w-6 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Expiring soon</p>
                      <p className="text-3xl font-bold text-accent-600">12 units</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Next 30 days</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { unit: "Unit A-101 • Tower One", days: "7 days" },
                        { unit: "Unit B-203 • Plaza Center", days: "12 days" },
                        { unit: "Unit C-105 • Main Street", days: "21 days" }
                      ].map((item) => (
                        <div key={item.unit} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                          <span className="text-sm text-slate-700">{item.unit}</span>
                          <span className="text-xs font-semibold text-accent-600">{item.days}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Ready to modernize your operation?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Join elevator service companies who trust UPLIO to keep their 
            business organized and compliant.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="xl" variant="secondary">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Free to start • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/icon.svg" alt="Uplio" width={24} height={24} className="rounded" />
            <span className="font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">UPLIO</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} UPLIO. Built for the vertical transport industry.
          </p>
        </div>
      </footer>
    </main>
  );
}
