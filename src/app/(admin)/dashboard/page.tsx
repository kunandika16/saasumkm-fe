"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Footprints,
  UserCheck,
  Ticket,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import { formatIDR, formatDate } from "@/lib/utils";
import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

// ─── Error Section Component ─────────────────────────────────────────────────

function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
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
  return (
    <div className="flex items-center justify-center py-8">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

// ─── Daily Visitor Chart (simple Tailwind bar chart) ─────────────────────────

function DailyVisitorChart({ data }: { data: DailyVisitor[] }) {
  if (!data || data.length === 0) return null;
  const maxCount = Math.max(...data.map((d) => d.uniqueVisitors ?? 0), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-40">
        {data.map((day) => {
          const count = day.uniqueVisitors ?? 0;
          const heightPercent = (count / maxCount) * 100;
          const dateLabel = new Date(day.date).getDate().toString();

          return (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-[10px] text-muted-foreground">
                {count > 0 ? count : ""}
              </span>
              <div className="w-full flex items-end" style={{ height: "120px" }}>
                <div
                  className="w-full rounded-t bg-primary/80 transition-all min-h-[2px]"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  title={`${formatDate(day.date)}: ${count} pengunjung`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {dateLabel}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Tanggal (bulan ini)
      </p>
    </div>
  );
}

// ─── Top Members Section ─────────────────────────────────────────────────────

function TopMembersSection({ members }: { members: TopMember[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead className="text-right">Kunjungan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member, idx) => (
          <TableRow key={member.id}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell className="text-right">{member.visitCount ?? 0}</TableCell>
          </TableRow>
        ))}
        {members.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              Belum ada data member.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// ─── Dormant Members Section ─────────────────────────────────────────────────

function DormantMembersSection({ members }: { members: Member[] }) {
  function daysSinceLastVisit(lastVisitAt: string | null): number {
    if (!lastVisitAt) return 999;
    const diff = Date.now() - new Date(lastVisitAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>WhatsApp</TableHead>
          <TableHead>Kunjungan Terakhir</TableHead>
          <TableHead className="text-right">Hari Tidak Aktif</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell>{member.whatsapp}</TableCell>
            <TableCell>
              {member.lastVisitAt ? formatDate(member.lastVisitAt) : "-"}
            </TableCell>
            <TableCell className="text-right">
              {daysSinceLastVisit(member.lastVisitAt)}
            </TableCell>
          </TableRow>
        ))}
        {members.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Tidak ada member dormant.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
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
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.name}</p>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70 transition-all"
                style={{
                  width: `${(item.orderCount / maxOrders) * 100}%`,
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

  // ─── Initial Load (parallel with partial failure handling) ───────────

  useEffect(() => {
    fetchOverview();
    fetchDailyVisitors();
    fetchDormantMembers();
    fetchMenuPopularity();
  }, [fetchOverview, fetchDailyVisitors, fetchDormantMembers, fetchMenuPopularity]);

  // ─── Build metric cards from overview data ───────────────────────────

  const metricCards = overview.data
    ? [
        {
          label: "Total Member",
          value: (overview.data.totalMembers ?? 0).toLocaleString("id-ID"),
          icon: Users,
          iconColor: "text-blue-600",
        },
        {
          label: "Kunjungan Bulan Ini",
          value: (overview.data.totalVisitsThisMonth ?? 0).toLocaleString("id-ID"),
          icon: Footprints,
          iconColor: "text-green-600",
        },
        {
          label: "Repeat Customer",
          value: (overview.data.repeatCustomerCount ?? 0).toLocaleString("id-ID"),
          icon: UserCheck,
          iconColor: "text-purple-600",
        },
        {
          label: "Voucher Ditebus",
          value: (overview.data.totalVouchersRedeemedThisMonth ?? 0).toLocaleString("id-ID"),
          icon: Ticket,
          iconColor: "text-orange-600",
        },
        {
          label: "Total Order",
          value: (overview.data.totalOrdersThisMonth ?? 0).toLocaleString("id-ID"),
          icon: ShoppingCart,
          iconColor: "text-indigo-600",
        },
        {
          label: "Total Revenue",
          value: formatIDR(overview.data.totalRevenueThisMonth ?? 0),
          icon: DollarSign,
          iconColor: "text-emerald-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchOverview();
            fetchDailyVisitors();
            fetchDormantMembers();
            fetchMenuPopularity();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Metrics */}
      <section aria-label="Metrik overview">
        {overview.loading && <SectionLoading />}
        {overview.error && (
          <SectionError message={overview.error} onRetry={fetchOverview} />
        )}
        {overview.data && <AnalyticsCards cards={metricCards} />}
      </section>

      {/* Daily Visitor Chart */}
      <section aria-label="Pengunjung harian">
        <Card>
          <CardHeader>
            <CardTitle>Pengunjung Harian</CardTitle>
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

      {/* Top Members */}
      <section aria-label="Top member">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Member</CardTitle>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dormant Members */}
        <section aria-label="Member dormant">
          <Card>
            <CardHeader>
              <CardTitle>Member Dormant</CardTitle>
            </CardHeader>
            <CardContent>
              {dormantMembers.loading && <SectionLoading />}
              {dormantMembers.error && (
                <SectionError
                  message={dormantMembers.error}
                  onRetry={fetchDormantMembers}
                />
              )}
              {dormantMembers.data && (
                <DormantMembersSection members={dormantMembers.data} />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Menu Popularity */}
        <section aria-label="Popularitas menu">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Menu Populer</CardTitle>
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
