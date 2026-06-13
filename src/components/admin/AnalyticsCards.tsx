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
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted",
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-xl font-semibold truncate">{String(value)}</p>
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <AnalyticsCard key={card.label} {...card} />
      ))}
    </div>
  );
}
