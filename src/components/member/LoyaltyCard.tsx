"use client";

import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoyaltyCardProps {
  name: string;
  pointBalance: number;
  className?: string;
}

export function LoyaltyCard({ name, pointBalance, className }: LoyaltyCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground shadow-xl shadow-slate-950/15",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

      {/* Card content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header with icon */}
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/65">
            Kartu Loyalitas
          </span>
        </div>

        {/* Member name */}
        <div>
          <p className="truncate text-lg font-semibold leading-tight">{name}</p>
        </div>

        {/* Point balance */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            {(pointBalance ?? 0).toLocaleString("id-ID")}
          </span>
          <span className="text-sm font-semibold text-sidebar-foreground/65">poin</span>
        </div>
      </div>
    </div>
  );
}
