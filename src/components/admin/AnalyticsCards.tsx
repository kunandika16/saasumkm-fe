"use client";

import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AnalyticsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export function AnalyticsCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
}: AnalyticsCardProps) {
  const isNegative = label.toLowerCase().includes("review clicks");
  const trend = isNegative ? "-2%" : "+12%";
  const iconBg =
    iconColor.includes("rose") || iconColor.includes("amber")
      ? "bg-orange-50"
      : iconColor.includes("violet") || iconColor.includes("indigo")
        ? "bg-violet-50"
        : iconColor.includes("emerald")
          ? "bg-emerald-50"
          : "bg-sky-50";

  return (
    <Card className="group min-h-[188px] border-slate-200 bg-white shadow-[0_9px_14px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(15,23,42,0.18)]">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full",
              iconBg,
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <p className="truncate text-base font-bold text-slate-800">{label}</p>
        </div>

        <p className="truncate text-3xl font-black tracking-tight text-slate-900">
          {String(value)}
        </p>

        <div className="flex items-center gap-1.5 text-sm">
          <span className={cn("font-black", isNegative ? "text-red-500" : "text-emerald-500")}>
            {isNegative ? "↓" : "↑"} {trend}
          </span>
          <span className="text-slate-500">on this week</span>
        </div>
      </CardContent>
    </Card>
  );
}

export interface AnalyticsCardsProps {
  cards: AnalyticsCardProps[];
}

export function AnalyticsCards({ cards }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <AnalyticsCard key={card.label} {...card} />
      ))}
    </div>
  );
}
