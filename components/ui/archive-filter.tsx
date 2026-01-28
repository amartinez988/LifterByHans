"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type ArchiveFilterValue = "active" | "archived" | "all";

export function ArchiveFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("filter") as ArchiveFilterValue) || "active";

  const options: { value: ArchiveFilterValue; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
    { value: "all", label: "All" },
  ];

  const handleChange = (value: ArchiveFilterValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "active") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex gap-1 rounded-full border border-ink/10 bg-white/50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            current === option.value
              ? "bg-ink text-white"
              : "text-ink/60 hover:text-ink"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
