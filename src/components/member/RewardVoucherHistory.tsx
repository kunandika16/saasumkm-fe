"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw, Ticket, Loader2 } from "lucide-react";

import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { VoucherCard } from "@/components/member/VoucherCard";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VoucherData {
  id: string;
  code: string;
  discountType: "free" | "discount";
  discountSubType: "fixed" | "percentage" | null;
  discountValue: number | null;
  expiryDate: string;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  status: "active" | "used" | "expired";
  rewardName: string;
  menuItemName: string | null;
}

interface VoucherResponse {
  vouchers: VoucherData[];
  total: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RewardVoucherHistory() {
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;

  const fetchVouchers = useCallback(async (pageNum: number, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await apiClient.get<VoucherResponse>(
        "/api/reward-vouchers",
        { params: { page: pageNum, pageSize } }
      );

      const data = response.data;
      if (append) {
        setVouchers((prev) => [...prev, ...(data?.vouchers ?? [])]);
      } else {
        setVouchers(data?.vouchers ?? []);
      }
      setTotal(data?.total ?? 0);
      setPage(pageNum);
    } catch {
      setError("Gagal memuat riwayat voucher. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers(1);
  }, [fetchVouchers]);

  const handleLoadMore = () => {
    fetchVouchers(page + 1, true);
  };

  const hasMore = vouchers.length < total;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="mt-3 h-10 w-full rounded-lg bg-muted" />
            <div className="mt-2.5 flex justify-between">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/80 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            onClick={() => fetchVouchers(1)}
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px] gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (vouchers.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 p-6">
        <Ticket className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Belum ada voucher yang ditukar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vouchers.map((voucher) => (
        <VoucherCard key={voucher.id} voucher={voucher} />
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="sm"
            disabled={isLoadingMore}
            className="min-h-[44px] gap-2"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Memuat...
              </>
            ) : (
              "Muat Lebih Banyak"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
