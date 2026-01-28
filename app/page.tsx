import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "Single workspace",
    description: "Spin up a secure company hub in minutes with owner-level control.",
    icon: Building2
  },
  {
    title: "Reliable auth",
    description: "Credentials-based sign-in with modern session handling.",
    icon: ShieldCheck
  },
  {
    title: "Built for technicians",
    description: "A product direction focused on field reliability and clarity.",
    icon: Wrench
  }
];

export default function LandingPage() {
  return (
    <main className="px-6 py-10 md:px-16">
      <header className="flex items-center justify-between gap-6">
        <div className="text-2xl font-display tracking-tight text-ink">
          LIFTER
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-ink/80 hover:text-ink" href="/login">
            Log in
          </Link>
          <Button asChild size="sm">
            <Link href="/signup">Start free</Link>
          </Button>
        </nav>
      </header>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Elevator & Escalator Service SaaS
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
            Launch a calm, compliant workspace for vertical transport teams.
          </h1>
          <p className="text-base text-ink/70 md:text-lg">
            LIFTER gives service companies a secure foundation for teams, sites, and
            inspections. Start with an owner account and grow into your full
            operations stack.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Create your workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">View the dashboard shell</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-soft backdrop-blur">
          <div className="space-y-6">
            <div className="rounded-2xl border border-ink/10 bg-haze p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
                MVP focus
              </p>
              <h2 className="mt-3 font-display text-2xl text-ink">Phase 1 ready</h2>
              <p className="mt-2 text-sm text-ink/70">
                Public landing, credentials auth, onboarding, and an authenticated
                dashboard shell.
              </p>
            </div>
            <div className="grid gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-2xl border border-ink/10 bg-white p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="text-sm text-ink/60">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20 grid gap-6 rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-soft md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Security</p>
          <h3 className="mt-3 font-display text-xl text-ink">Credential-based</h3>
          <p className="mt-2 text-sm text-ink/70">
            Bcrypt-hashed passwords and Auth.js sessions keep accounts protected.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Multi-tenant</p>
          <h3 className="mt-3 font-display text-xl text-ink">Company-first</h3>
          <p className="mt-2 text-sm text-ink/70">
            Every user is bound to a workspace for clean data separation.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Onboarding</p>
          <h3 className="mt-3 font-display text-xl text-ink">Fast setup</h3>
          <p className="mt-2 text-sm text-ink/70">
            One quick form and your dashboard shell is ready.
          </p>
        </div>
      </section>
    </main>
  );
}
