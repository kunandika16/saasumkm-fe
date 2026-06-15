"use client"

import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

interface LoadingStateProps {
  label?: string
  rows?: number
  variant?: "panel" | "inline" | "page"
  className?: string
}

export function LoadingState({
  label = "Memuat data",
  rows = 3,
  variant = "panel",
  className,
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm font-medium text-muted-foreground", className)}>
        <span className="relative flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </span>
        {label}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border/75 bg-card/90 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.55)] ring-1 ring-slate-900/[0.03]",
        variant === "page" ? "p-8" : "p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Sparkles className="h-5 w-5" />
          <span className="absolute inset-0 rounded-lg border border-primary/20 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs font-medium text-muted-foreground">
            Sinkronisasi dengan server dev
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/5 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-full animate-pulse rounded-full bg-muted/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Skeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[linear-gradient(90deg,#eef4fb_0%,#f8fbff_45%,#eef4fb_100%)] bg-[length:220%_100%]",
        className
      )}
    />
  )
}

export function AdminToolbarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>
  )
}

export function AdminTableSkeleton({
  rows = 6,
  columns = 5,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]", className)}>
      <div className="grid gap-3 border-b border-slate-100 bg-slate-50/80 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-3/4" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-3 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={cn("h-4", columnIndex === 0 ? "w-4/5" : columnIndex === columns - 1 ? "w-16 justify-self-end" : "w-2/3")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminCardGridSkeleton({
  cards = 6,
  className,
}: {
  cards?: number
  className?: string
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <Skeleton className="mt-5 h-10 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function MenuCatalogSkeleton() {
  return (
    <div className="space-y-4">
      <AdminToolbarSkeleton />
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_38px_-34px_rgba(15,23,42,0.85)]">
            <Skeleton className="h-40 rounded-none" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <div className="mt-7 flex items-center justify-between">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-4 py-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="min-h-[148px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.75)]">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="mt-7 flex items-end justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-end justify-between pt-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.75)] xl:col-span-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-6 h-56 rounded-2xl" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)] xl:col-span-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-2 h-4 w-44" />
          <div className="mt-5 space-y-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="min-h-[260px] rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
            <div className="mt-8 space-y-4">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="min-w-0 space-y-4 py-5">
      <AdminToolbarSkeleton />
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
          <div className="mb-5 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
          {index === 0 && <Skeleton className="mt-4 h-28 rounded-xl" />}
        </div>
      ))}
    </div>
  )
}
