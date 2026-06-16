"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface HealthResponse {
  status: string;
  timestamp?: string;
  environment?: string;
}

type HealthState = "checking" | "healthy" | "unhealthy";

export function ApiHealthStatus() {
  const [healthState, setHealthState] = useState<HealthState>("checking");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const { data } = await apiClient.get<HealthResponse>("/api/health");
        if (!isMounted) return;

        setHealth(data);
        setHealthState(data.status === "ok" ? "healthy" : "unhealthy");
      } catch {
        if (!isMounted) return;
        setHealth(null);
        setHealthState("unhealthy");
      }
    }

    checkHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const label =
    healthState === "checking"
      ? "API checking"
      : healthState === "healthy"
        ? "API online"
        : "API offline";

  return (
    <div
      title={health?.environment ? `${label} (${health.environment})` : label}
      className={cn(
        "hidden h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold sm:flex",
        healthState === "checking" &&
          "border-slate-200 bg-slate-50 text-slate-500",
        healthState === "healthy" &&
          "border-emerald-100 bg-emerald-50 text-emerald-700",
        healthState === "unhealthy" &&
          "border-rose-100 bg-rose-50 text-rose-700"
      )}
      aria-label={label}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          healthState === "checking" && "bg-slate-400",
          healthState === "healthy" && "bg-emerald-500",
          healthState === "unhealthy" && "bg-rose-500"
        )}
      />
      <Activity className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}
