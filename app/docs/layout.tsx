"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Siren,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  Smartphone,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

interface DocItem {
  label: string;
  href: string;
}

interface DocGroup {
  title: string;
  icon: React.ReactNode;
  items: DocItem[];
}

const docGroups: DocGroup[] = [
  {
    title: "Getting Started",
    icon: <Book className="h-4 w-4" />,
    items: [
      { label: "Overview", href: "/docs" },
      { label: "Getting Started", href: "/docs/getting-started" },
    ],
  },
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    items: [
      { label: "Dashboard Overview", href: "/docs/dashboard" },
    ],
  },
  {
    title: "Assets",
    icon: <Building2 className="h-4 w-4" />,
    items: [
      { label: "Management Companies", href: "/docs/assets/companies" },
      { label: "Buildings", href: "/docs/assets/buildings" },
      { label: "Units", href: "/docs/assets/units" },
    ],
  },
  {
    title: "Operations",
    icon: <Briefcase className="h-4 w-4" />,
    items: [
      { label: "Maintenance", href: "/docs/operations/maintenance" },
      { label: "Jobs", href: "/docs/operations/jobs" },
      { label: "Schedule", href: "/docs/operations/schedule" },
      { label: "Dispatch", href: "/docs/operations/dispatch" },
      { label: "Inspections", href: "/docs/operations/inspections" },
      { label: "Issue Reports", href: "/docs/operations/issue-reports" },
    ],
  },
  {
    title: "Mobile",
    icon: <Smartphone className="h-4 w-4" />,
    items: [
      { label: "Technician View", href: "/docs/technician-view" },
    ],
  },
  {
    title: "People",
    icon: <Users className="h-4 w-4" />,
    items: [
      { label: "Mechanics", href: "/docs/people/mechanics" },
      { label: "Inspectors", href: "/docs/people/inspectors" },
      { label: "Contacts", href: "/docs/people/contacts" },
    ],
  },
  {
    title: "Emergency",
    icon: <Siren className="h-4 w-4" />,
    items: [
      { label: "Emergency Calls", href: "/docs/emergency" },
    ],
  },
  {
    title: "Settings",
    icon: <Settings className="h-4 w-4" />,
    items: [
      { label: "Team Management", href: "/docs/settings/team" },
      { label: "Lookup Values", href: "/docs/settings/lookup-values" },
      { label: "Data Import", href: "/docs/settings/import" },
      { label: "Billing", href: "/docs/settings/billing" },
    ],
  },
];

function DocGroupComponent({ group, closeMobile }: { group: DocGroup; closeMobile: () => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const hasActiveItem = group.items.some((item) => pathname === item.href);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          hasActiveItem
            ? "bg-brand-50 text-brand-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <span className="flex items-center gap-2">
          {group.icon}
          {group.title}
        </span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-slate-100 pl-3">
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { href, label };
  });

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-slate-700">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-brand-600">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/icon.svg" alt="Uplio" className="h-8 w-8" />
              <span className="font-display text-xl font-semibold text-slate-900">
                Uplio
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              Documentation
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin pr-2">
              {docGroups.map((group) => (
                <DocGroupComponent
                  key={group.title}
                  group={group}
                  closeMobile={() => {}}
                />
              ))}
            </nav>
          </aside>

          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-slate-200 overflow-y-auto p-4 shadow-xl">
                <nav className="space-y-1">
                  {docGroups.map((group) => (
                    <DocGroupComponent
                      key={group.title}
                      group={group}
                      closeMobile={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </aside>
            </div>
          )}

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <Breadcrumbs />
            <article className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-code:text-brand-700 prose-code:bg-brand-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-table:text-sm prose-th:bg-slate-50 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-tr:border-slate-200">
              {children}
            </article>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Uplio. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-slate-500 hover:text-brand-600">
                Home
              </Link>
              <Link href="/contact" className="text-sm text-slate-500 hover:text-brand-600">
                Contact
              </Link>
              <Link href="/app" className="text-sm text-slate-500 hover:text-brand-600">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
