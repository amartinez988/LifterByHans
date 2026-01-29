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
  Users,
  Wrench,
  AlertTriangle
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
    <main className="min-h-screen bg-gradient-to-b from-haze to-white">
      {/* Header */}
      <header className="px-6 py-6 md:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <div className="text-2xl font-display tracking-tight text-ink">
            LIFTER
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-ink/70 hover:text-ink transition" href="/login">
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get started free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-pine">
                  Elevator Service Management
                </p>
                <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink md:text-5xl lg:text-6xl">
                  Stop chasing paperwork.<br />
                  <span className="text-pine">Start running your business.</span>
                </h1>
              </div>
              <p className="text-lg text-ink/70 md:text-xl">
                LIFTER is the all-in-one platform for elevator and escalator service 
                companies. Track units, manage compliance, dispatch emergencies, and 
                keep your entire operation running smoothly.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/signup">
                    Start your free trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="/login">See it in action</Link>
                </Button>
              </div>
              <p className="text-sm text-ink/50">
                No credit card required • Set up in under 5 minutes
              </p>
            </div>

            {/* Pain points card */}
            <div className="rounded-3xl border border-ink/10 bg-white p-8 shadow-soft">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ember/10">
                  <AlertTriangle className="h-5 w-5 text-ember" />
                </div>
                <p className="font-medium text-ink">Sound familiar?</p>
              </div>
              <ul className="space-y-4">
                {painPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/10">
                      <span className="text-xs font-medium text-ink/60">{i + 1}</span>
                    </div>
                    <span className="text-ink/70">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl bg-pine/5 p-4">
                <p className="text-sm font-medium text-pine">
                  LIFTER solves all of this — and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-ink/10 bg-white px-6 py-12 md:px-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.label} className="text-center">
              <p className="font-display text-4xl text-pine">{benefit.stat}</p>
              <p className="mt-2 font-medium text-ink">{benefit.label}</p>
              <p className="mt-1 text-sm text-ink/60">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink/60">
              Everything you need
            </p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">
              Built for elevator service professionals
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink/70">
              From independent contractors to large service companies, LIFTER 
              adapts to how you work.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-ink/10 bg-white p-6 shadow-soft transition hover:border-ink/20 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pine/10">
                    <Icon className="h-6 w-6 text-pine" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-ink/60">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">
              Simple to start
            </p>
            <h2 className="mt-4 font-display text-3xl text-white md:text-4xl">
              Up and running in minutes
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <span className="font-display text-2xl text-white">1</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Create your workspace</h3>
              <p className="mt-2 text-white/60">
                Sign up and set up your company profile in under a minute.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <span className="font-display text-2xl text-white">2</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Add your portfolio</h3>
              <p className="mt-2 text-white/60">
                Import your management companies, buildings, and units.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <span className="font-display text-2xl text-white">3</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Stay in control</h3>
              <p className="mt-2 text-white/60">
                Track inspections, schedule jobs, and manage your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance CTA */}
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-ember/20 bg-gradient-to-br from-ember/5 to-transparent p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-ember/10 px-3 py-1 text-sm font-medium text-ember">
                  <AlertTriangle className="h-4 w-4" />
                  Compliance matters
                </div>
                <h2 className="mt-6 font-display text-3xl text-ink md:text-4xl">
                  Never get caught off guard by an expired certificate again
                </h2>
                <p className="mt-4 text-lg text-ink/70">
                  LIFTER tracks every inspection date and alerts you before 
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
                      <CheckCircle2 className="h-5 w-5 text-pine" />
                      <span className="text-ink/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ember/10">
                      <Clock className="h-5 w-5 text-ember" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Expiring soon</p>
                      <p className="text-2xl font-display text-ember">12 units</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-ink/10 pt-4">
                    <p className="text-xs text-ink/50">Next 30 days</p>
                    <div className="mt-2 space-y-2">
                      {["Unit A-101 • Tower One", "Unit B-203 • Plaza Center", "Unit C-105 • Main Street"].map((unit) => (
                        <div key={unit} className="flex items-center justify-between rounded-lg bg-haze px-3 py-2">
                          <span className="text-sm text-ink/70">{unit}</span>
                          <span className="text-xs font-medium text-ember">7 days</span>
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
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Ready to modernize your operation?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink/70">
            Join elevator service companies who trust LIFTER to keep their 
            business organized and compliant.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/signup">
                Start your free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-ink/50">
            Free to start • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 px-6 py-8 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-display tracking-tight text-ink/60">
            LIFTER
          </div>
          <p className="text-sm text-ink/50">
            © {new Date().getFullYear()} LIFTER. Built for the vertical transport industry.
          </p>
        </div>
      </footer>
    </main>
  );
}
