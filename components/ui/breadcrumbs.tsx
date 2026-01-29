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
    <nav className="mb-4 flex items-center gap-1 text-sm">
      {showHome && (
        <>
          <Link
            href="/app"
            className="flex items-center text-ink/50 transition hover:text-ink"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-ink/30" />
        </>
      )}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-ink/50 transition hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-ink" : "text-ink/50"}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 text-ink/30" />}
          </span>
        );
      })}
    </nav>
  );
}
