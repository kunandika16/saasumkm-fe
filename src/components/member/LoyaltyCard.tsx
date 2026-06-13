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
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg",
        className
      )}
    >
      {/* Background decorative circles */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />

      {/* Card content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header with icon */}
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">
            Kartu Loyalitas
          </span>
        </div>

        {/* Member name */}
        <div>
          <p className="text-lg font-semibold leading-tight truncate">{name}</p>
        </div>

        {/* Point balance */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums">
            {(pointBalance ?? 0).toLocaleString("id-ID")}
          </span>
          <span className="text-sm font-medium opacity-80">poin</span>
        </div>
      </div>
    </div>
  );
}
