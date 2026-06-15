"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Loader2,
  Plus,
  Ban,
  Ticket,
  TrendingUp,
  Users,
  CirclePercent,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import { formatIDR } from "@/lib/utils";
import type { Voucher } from "@/types";
import { DiscountType } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import VoucherForm, {
  type CreateVoucherInput,
} from "@/components/admin/VoucherForm";
import { AdminCardGridSkeleton } from "@/components/ui/loading-state";

// ─── Helper: Compute stats from voucher fields ──────────────────────────────

function getVoucherStats(voucher: Voucher) {
  const issued = voucher.maxUsage;
  const redeemed = voucher.currentUsage;
  const remaining = Math.max(0, issued - redeemed);
  const rate = issued > 0 ? Math.round((redeemed / issued) * 100) : 0;
  return { issued, redeemed, remaining, rate };
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  // Create voucher dialog state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Deactivate dialog state
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean;
    voucher: Voucher | null;
  }>({ open: false, voucher: null });
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  // ─── Fetch Vouchers ─────────────────────────────────────────────────────

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/api/admin/vouchers");
      setVouchers(Array.isArray(data) ? data : (data?.vouchers ?? []));
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // ─── Create Voucher ─────────────────────────────────────────────────────

  async function handleCreateVoucher(formData: CreateVoucherInput) {
    setServerError(null);
    try {
      await apiClient.post("/api/admin/vouchers", {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        expiryDate: formData.expiryDate,
        maxUsage: formData.maxUsage,
      });
      setSheetOpen(false);
      fetchVouchers();
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (error.response?.status === 409) {
        setServerError(
          error.response.data?.message ??
            "Kode voucher sudah digunakan. Gunakan kode lain."
        );
      } else {
        setServerError(
          error.response?.data?.message ??
            "Gagal membuat voucher. Silakan coba lagi."
        );
      }
      // Re-throw to keep the form in submitting state
      throw err;
    }
  }

  // ─── Deactivate Voucher ─────────────────────────────────────────────────

  function handleDeactivateClick(voucher: Voucher) {
    setDeactivateError(null);
    setDeactivateDialog({ open: true, voucher });
  }

  async function executeDeactivate() {
    if (!deactivateDialog.voucher) return;

    setDeactivateLoading(true);
    setDeactivateError(null);

    try {
      await apiClient.patch(
        `/api/admin/vouchers/${deactivateDialog.voucher.id}/deactivate`
      );
      setDeactivateDialog({ open: false, voucher: null });
      fetchVouchers();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
      };
      setDeactivateError(
        error.response?.data?.message ??
          "Gagal menonaktifkan voucher. Silakan coba lagi."
      );
    } finally {
      setDeactivateLoading(false);
    }
  }

  // ─── Aggregate Stats ────────────────────────────────────────────────────

  const totalIssued = vouchers.reduce((sum, v) => sum + v.maxUsage, 0);
  const totalRedeemed = vouchers.reduce((sum, v) => sum + v.currentUsage, 0);
  const totalRemaining = Math.max(0, totalIssued - totalRedeemed);
  const overallRate =
    totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0;

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-w-0 space-y-4 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900">Kelola voucher</p>
            <p className="text-xs font-medium text-slate-500">
              Buat dan pantau promo pelanggan
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setServerError(null);
              setSheetOpen(true);
            }}
            className="h-10 rounded-xl bg-blue-500 px-4 text-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.9)] hover:bg-blue-600"
          >
            <Plus className="mr-1 h-4 w-4" />
            Buat Voucher
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && vouchers.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Ticket className="h-4 w-4" />}
            label="Total Issued"
            value={totalIssued.toString()}
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Total Redeemed"
            value={totalRedeemed.toString()}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Remaining"
            value={totalRemaining.toString()}
          />
          <StatCard
            icon={<CirclePercent className="h-4 w-4" />}
            label="Redemption Rate"
            value={`${overallRate}%`}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <AdminCardGridSkeleton cards={6} />
      ) : vouchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/90 bg-card py-16 text-center shadow-sm shadow-slate-900/5">
          <Ticket className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Belum ada voucher. Buat voucher pertama untuk menarik pelanggan.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setServerError(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Buat Voucher Pertama
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              onDeactivate={() => handleDeactivateClick(voucher)}
            />
          ))}
        </div>
      )}

      {/* Create Voucher Dialog */}
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_52%,#f0f9ff_100%)] px-7 py-6">
            <DialogTitle>Buat Voucher Baru</DialogTitle>
            <DialogDescription>
              Isi detail voucher diskon untuk pelanggan.
            </DialogDescription>
          </DialogHeader>
          <div className="px-7 py-6">
            <VoucherForm
              onSubmit={handleCreateVoucher}
              serverError={serverError}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={deactivateDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeactivateDialog({ open: false, voucher: null });
            setDeactivateError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nonaktifkan Voucher</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menonaktifkan voucher{" "}
              <span className="font-semibold">
                {deactivateDialog.voucher?.code}
              </span>
              ? Voucher yang dinonaktifkan tidak dapat digunakan lagi oleh
              pelanggan.
            </DialogDescription>
          </DialogHeader>

          {deactivateError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {deactivateError}
            </div>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={deactivateLoading} />
              }
            >
              Batal
            </DialogClose>
            <Button
              onClick={executeDeactivate}
              disabled={deactivateLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deactivateLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              )}
              Nonaktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Stat Card Component ─────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm shadow-slate-900/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Voucher Card Component ──────────────────────────────────────────────────

interface VoucherCardProps {
  voucher: Voucher;
  onDeactivate: () => void;
}

function VoucherCard({ voucher, onDeactivate }: VoucherCardProps) {
  const stats = getVoucherStats(voucher);
  const isExpired = new Date(voucher.expiryDate) < new Date();
  const isInactive = !voucher.isActive;
  const isFullyUsed = stats.remaining <= 0;

  // Determine status
  let statusLabel: string;
  let statusVariant: "default" | "secondary" | "destructive" | "outline";

  if (isInactive) {
    statusLabel = "Nonaktif";
    statusVariant = "destructive";
  } else if (isExpired) {
    statusLabel = "Expired";
    statusVariant = "secondary";
  } else if (isFullyUsed) {
    statusLabel = "Habis";
    statusVariant = "secondary";
  } else {
    statusLabel = "Aktif";
    statusVariant = "default";
  }

  // Discount display
  const discountDisplay =
    voucher.discountType === DiscountType.PERCENTAGE
      ? `${voucher.discountValue}%`
      : formatIDR(voucher.discountValue);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/35 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Ticket className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-mono font-semibold text-sm truncate">
            {voucher.code}
          </span>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-3">
        {/* Discount Info */}
        <div className="text-center">
        <p className="text-3xl font-bold tracking-tight text-primary">{discountDisplay}</p>
          <p className="text-xs text-muted-foreground">
            {voucher.discountType === DiscountType.PERCENTAGE
              ? "Diskon Persentase"
              : "Diskon Nominal"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Issued</p>
            <p className="text-sm font-medium">{stats.issued}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Redeemed</p>
            <p className="text-sm font-medium">{stats.redeemed}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-sm font-medium">{stats.remaining}</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Rate</p>
            <p className="text-sm font-medium">{stats.rate}%</p>
          </div>
        </div>

        {/* Expiry */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Kadaluarsa</span>
          <span>
            {format(new Date(voucher.expiryDate), "dd MMM yyyy", {
              locale: id,
            })}
          </span>
        </div>

        {/* Welcome voucher indicator */}
        {voucher.isWelcomeVoucher && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Welcome Voucher
            </Badge>
          </div>
        )}
      </div>

      {/* Footer — Deactivate button (only for active vouchers) */}
      {voucher.isActive && !isExpired && (
        <div className="border-t px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onDeactivate}
          >
            <Ban className="h-3.5 w-3.5 mr-1" />
            Nonaktifkan
          </Button>
        </div>
      )}
    </div>
  );
}
