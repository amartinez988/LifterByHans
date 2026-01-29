import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  return (
    <nav className="mb-4 flex items-center gap-1.5 text-sm">
      {showHome && (
        <>
          <Link
            href="/app"
            className="flex items-center text-slate-400 transition hover:text-slate-600"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </>
      )}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-slate-400 transition hover:text-slate-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-slate-700" : "text-slate-400"}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 text-slate-300" />}
          </span>
        );
      })}
    </nav>
  );
}
