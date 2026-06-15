"use client";

import { useEffect, useState, useCallback } from "react";
import type { ComponentType } from "react";
import {
  Users,
  Ticket,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Award,
  TrendingUp,
  Repeat2,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import { formatIDR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton, LoadingState } from "@/components/ui/loading-state";

import type {
  AnalyticsOverview,
  DailyVisitor,
  Member,
  MenuPopularity,
  TopMember,
} from "@/types";

// ─── Types for section state ─────────────────────────────────────────────────

interface SectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ReviewStats {
  totalUniqueClickers: number;
  totalClicks: number;
  totalMembers: number;
  conversionRate: number;
}

// ─── Error Section Component ─────────────────────────────────────────────────

function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-destructive">{message}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Retry
      </Button>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function SectionLoading() {
  return <LoadingState label="Memuat insight terbaru" rows={3} />;
}

// ─── Daily Visitor Chart (simple Tailwind bar chart) ─────────────────────────

function DailyVisitorChart({ data }: { data: DailyVisitor[] }) {
  if (!data || data.length === 0) return null;
  const hasActivity = data.some((d) => (d.uniqueVisitors ?? 0) > 0);
  const maxCount = Math.max(...data.map((d) => d.uniqueVisitors ?? 0), 1);
  const width = 640;
  const height = 220;
  const paddingX = 28;
  const paddingY = 24;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const points = data.map((day, idx) => {
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingY + chartHeight - ((day.uniqueVisitors ?? 0) / maxCount) * chartHeight;
    return `${x},${y}`;
  });
  const areaPoints = `${paddingX},${height - paddingY} ${points.join(" ")} ${width - paddingX},${height - paddingY}`;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
          {[0, 1, 2, 3].map((line) => {
            const y = paddingY + (line / 3) * chartHeight;
            return (
              <line
                key={line}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}
          <polygon points={areaPoints} fill="url(#visitorArea)" />
          {hasActivity ? (
            <polyline
              points={points.join(" ")}
              fill="none"
              stroke="#6366f1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          ) : (
            <g>
              <path
                d="M 80 130 C 170 92, 235 154, 320 118 S 470 84, 560 126"
                fill="none"
                stroke="#c7d2fe"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeWidth="4"
              />
              <text
                x="320"
                y="104"
                fill="#94a3b8"
                fontSize="14"
                fontWeight="700"
                textAnchor="middle"
              >
                Belum ada aktivitas pengunjung
              </text>
            </g>
          )}
          <defs>
            <linearGradient id="visitorArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mt-1 flex justify-between px-3 text-[11px] font-medium text-slate-400">
          {data.slice(0, 8).map((day) => (
            <span key={day.date}>{new Date(day.date).getDate()}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Top Members Section ─────────────────────────────────────────────────────

function TopMembersSection({ members }: { members: TopMember[] }) {
  const maxVisits = Math.max(...members.map((member) => member.visitCount ?? 0), 1);

  return (
    <div className="space-y-3">
      {members.slice(0, 8).map((member, idx) => {
        const visits = member.visitCount ?? 0;

        return (
          <div key={member.id} className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-50 text-xs font-black text-sky-700">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-slate-800">
                  {member.name}
                </p>
                <p className="shrink-0 text-xs font-black text-slate-500">
                  {visits}x
                </p>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8,#3b82f6)]"
                  style={{ width: `${Math.max((visits / maxVisits) * 100, 4)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
      {members.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Belum ada data member.
        </p>
      )}
    </div>
  );
}

// ─── Menu Popularity Section ─────────────────────────────────────────────────

function MenuPopularitySection({ items }: { items: MenuPopularity[] }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Belum ada data menu.
      </p>
    );
  }
  const maxOrders = Math.max(...items.map((i) => i.orderCount ?? 0), 1);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.menuItemId} className="flex items-center gap-3">
          <span className="w-6 text-sm font-medium text-muted-foreground text-right">
            {idx + 1}.
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{item.name}</p>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#0ea5e9)] transition-all"
                style={{
                  width: `${Math.max((item.orderCount / maxOrders) * 100, 4)}%`,
                }}
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {item.orderCount} order
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Belum ada data menu.
        </p>
      )}
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  icon: Icon,
  tone,
  caption,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "emerald" | "amber" | "violet";
  caption: string;
}) {
  const toneClass = {
    blue: "bg-sky-500 text-white",
    emerald: "bg-emerald-500 text-white",
    amber: "bg-orange-400 text-white",
    violet: "bg-violet-500 text-white",
  }[tone];

  return (
    <div className="min-h-[148px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.75)]">
      <span className={`grid h-14 w-14 place-items-center rounded-full ${toneClass}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="mt-7 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 truncate text-sm font-medium text-slate-500">{label}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-500">
          {caption}
        </span>
      </div>
    </div>
  );
}

function BusinessMixPanel({ overview }: { overview: AnalyticsOverview }) {
  const rows = [
    {
      label: "Orders",
      value: overview.totalOrdersThisMonth ?? 0,
      display: (overview.totalOrdersThisMonth ?? 0).toLocaleString("id-ID"),
      color: "bg-blue-500",
    },
    {
      label: "Visits",
      value: overview.totalVisitsThisMonth ?? 0,
      display: (overview.totalVisitsThisMonth ?? 0).toLocaleString("id-ID"),
      color: "bg-emerald-500",
    },
    {
      label: "Vouchers",
      value: overview.totalVouchersRedeemedThisMonth ?? 0,
      display: (overview.totalVouchersRedeemedThisMonth ?? 0).toLocaleString("id-ID"),
      color: "bg-amber-500",
    },
    {
      label: "Repeat",
      value: overview.repeatCustomerCount ?? 0,
      display: (overview.repeatCustomerCount ?? 0).toLocaleString("id-ID"),
      color: "bg-violet-500",
    },
  ];
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Card className="h-full border-slate-200 bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
      <CardHeader className="pb-2">
        <CardTitle>Business Mix</CardTitle>
        <CardDescription className="mt-1">Aktivitas utama bulan ini.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-2xl bg-[linear-gradient(135deg,#eff6ff,#ecfdf5)] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Revenue bulan ini
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {formatIDR(overview.totalRevenueThisMonth ?? 0)}
          </p>
        </div>
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">{row.label}</span>
                <span className="font-black text-slate-500">{row.display}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${Math.max((row.value / maxValue) * 100, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FocusPanel({
  overview,
  reviewStats,
  dormantCount,
  topMenuCount,
}: {
  overview: AnalyticsOverview;
  reviewStats: ReviewStats | null;
  dormantCount: number;
  topMenuCount: number;
}) {
  const reviewRate = Math.max(0, Math.min(reviewStats?.conversionRate ?? 0, 100));
  const repeatRate =
    (overview.totalMembers ?? 0) > 0
      ? Math.round(((overview.repeatCustomerCount ?? 0) / overview.totalMembers) * 100)
      : 0;
  const rows = [
    {
      label: "Repeat Customer",
      value: `${repeatRate}%`,
      detail: `${(overview.repeatCustomerCount ?? 0).toLocaleString("id-ID")} member kembali`,
      icon: Repeat2,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Review Conversion",
      value: `${reviewRate}%`,
      detail: `${(reviewStats?.totalClicks ?? 0).toLocaleString("id-ID")} review clicks`,
      icon: TrendingUp,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Dormant Members",
      value: dormantCount.toLocaleString("id-ID"),
      detail: "Perlu follow-up",
      icon: Users,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Tracked Menu",
      value: topMenuCount.toLocaleString("id-ID"),
      detail: "Menu punya data order",
      icon: Ticket,
      tone: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <Card className="h-full border-slate-200 bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
      <CardHeader className="pb-2">
        <CardTitle>Focus</CardTitle>
        <CardDescription className="mt-1">
          Indikator yang perlu cepat dilihat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${row.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-800">
                    {row.label}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {row.detail}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-lg font-black text-slate-950">
                {row.value}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const [overview, setOverview] = useState<SectionState<AnalyticsOverview>>({
    data: null,
    loading: true,
    error: null,
  });
  const [dailyVisitors, setDailyVisitors] = useState<
    SectionState<DailyVisitor[]>
  >({ data: null, loading: true, error: null });
  const [dormantMembers, setDormantMembers] = useState<SectionState<Member[]>>({
    data: null,
    loading: true,
    error: null,
  });
  const [menuPopularity, setMenuPopularity] = useState<
    SectionState<MenuPopularity[]>
  >({ data: null, loading: true, error: null });
  const [reviewStats, setReviewStats] = useState<SectionState<ReviewStats>>({
    data: null,
    loading: true,
    error: null,
  });

  // ─── Fetch Functions ─────────────────────────────────────────────────

  const fetchOverview = useCallback(async () => {
    setOverview((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiClient.get(
        "/api/admin/analytics/overview"
      );
      setOverview({ data: res.data, loading: false, error: null });
    } catch {
      setOverview((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal memuat data overview.",
      }));
    }
  }, []);

  const fetchDailyVisitors = useCallback(async () => {
    setDailyVisitors((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiClient.get(
        "/api/admin/analytics/daily-visitors"
      );
      setDailyVisitors({ data: Array.isArray(res.data) ? res.data : [], loading: false, error: null });
    } catch {
      setDailyVisitors((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal memuat data pengunjung harian.",
      }));
    }
  }, []);

  const fetchDormantMembers = useCallback(async () => {
    setDormantMembers((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiClient.get(
        "/api/admin/analytics/dormant-members"
      );
      setDormantMembers({ data: Array.isArray(res.data) ? res.data : [], loading: false, error: null });
    } catch {
      setDormantMembers((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal memuat data member dormant.",
      }));
    }
  }, []);

  const fetchMenuPopularity = useCallback(async () => {
    setMenuPopularity((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiClient.get(
        "/api/admin/analytics/menu-popularity"
      );
      setMenuPopularity({ data: Array.isArray(res.data) ? res.data : [], loading: false, error: null });
    } catch {
      setMenuPopularity((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal memuat data popularitas menu.",
      }));
    }
  }, []);

  const fetchReviewStats = useCallback(async () => {
    setReviewStats((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await apiClient.get("/api/admin/reviews/stats");
      setReviewStats({ data: res.data, loading: false, error: null });
    } catch {
      setReviewStats((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal memuat statistik review.",
      }));
    }
  }, []);

  // ─── Initial Load (parallel with partial failure handling) ───────────

  useEffect(() => {
    fetchOverview();
    fetchDailyVisitors();
    fetchDormantMembers();
    fetchMenuPopularity();
    fetchReviewStats();
  }, [fetchOverview, fetchDailyVisitors, fetchDormantMembers, fetchMenuPopularity, fetchReviewStats]);

  return (
    <div className="min-w-0 space-y-4 py-5">
      <section aria-label="Metrik overview">
        {(overview.loading || reviewStats.loading) && (
          <DashboardSkeleton />
        )}
        {overview.error && (
          <SectionError message={overview.error} onRetry={fetchOverview} />
        )}
        {reviewStats.error && (
          <div className="mt-3">
            <SectionError message={reviewStats.error} onRetry={fetchReviewStats} />
          </div>
        )}
        {overview.data && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric
              label="Total Member"
              value={(overview.data.totalMembers ?? 0).toLocaleString("id-ID")}
              icon={Users}
              tone="emerald"
              caption="Semua"
            />
            <SummaryMetric
              label="Total Revenue"
              value={formatIDR(overview.data.totalRevenueThisMonth ?? 0)}
              icon={DollarSign}
              tone="amber"
              caption="Bulan ini"
            />
            <SummaryMetric
              label="Total Order"
              value={(overview.data.totalOrdersThisMonth ?? 0).toLocaleString("id-ID")}
              icon={ShoppingCart}
              tone="violet"
              caption="Bulan ini"
            />
            <SummaryMetric
              label="Voucher Ditebus"
              value={(overview.data.totalVouchersRedeemedThisMonth ?? 0).toLocaleString("id-ID")}
              icon={Ticket}
              tone="blue"
              caption="Redeem"
            />
          </div>
        )}
      </section>

      {overview.data && (
        <>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                Overview
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Ringkasan aktivitas dan performa merchant bulan ini.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchOverview();
                fetchDailyVisitors();
                fetchDormantMembers();
                fetchMenuPopularity();
                fetchReviewStats();
              }}
              className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700 shadow-sm shadow-slate-200/70 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
            <section aria-label="Pengunjung harian" className="xl:col-span-8">
              <Card className="h-full border-slate-200 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.75)]">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-[#101047]">Pengunjung Harian</CardTitle>
                      <CardDescription className="mt-1">
                        Pergerakan visitor unik selama bulan berjalan.
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Line chart</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {dailyVisitors.loading && <SectionLoading />}
                  {dailyVisitors.error && (
                    <SectionError
                      message={dailyVisitors.error}
                      onRetry={fetchDailyVisitors}
                    />
                  )}
                  {dailyVisitors.data && dailyVisitors.data.length > 0 && (
                    <DailyVisitorChart data={dailyVisitors.data} />
                  )}
                  {dailyVisitors.data && dailyVisitors.data.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada data pengunjung bulan ini.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
            <div className="xl:col-span-4">
              <FocusPanel
                overview={overview.data}
                reviewStats={reviewStats.data}
                dormantCount={dormantMembers.data?.length ?? 0}
                topMenuCount={menuPopularity.data?.length ?? 0}
              />
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
        {overview.data && (
          <div className="xl:col-span-4">
            <BusinessMixPanel overview={overview.data} />
          </div>
        )}
        <section aria-label="Top member" className="xl:col-span-4">
          <Card className="h-full min-h-[260px] border-slate-200 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Top Member</CardTitle>
                  <CardDescription className="mt-1">
                    Ranking kunjungan tertinggi.
                  </CardDescription>
                </div>
                <Award className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              {overview.loading && <SectionLoading />}
              {overview.error && (
                <SectionError message={overview.error} onRetry={fetchOverview} />
              )}
              {overview.data && (
                <TopMembersSection members={overview.data.topMembersByVisits ?? []} />
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-label="Popularitas menu" className="xl:col-span-4">
          <Card className="h-full min-h-[260px] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Menu Populer</CardTitle>
              <CardDescription className="mt-1">
                Perbandingan order per menu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {menuPopularity.loading && <SectionLoading />}
              {menuPopularity.error && (
                <SectionError
                  message={menuPopularity.error}
                  onRetry={fetchMenuPopularity}
                />
              )}
              {menuPopularity.data && (
                <MenuPopularitySection items={menuPopularity.data} />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
