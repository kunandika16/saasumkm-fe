"use client";

import { useState, useEffect, useCallback } from "react";
import { Coins, Loader2 } from "lucide-react";

import apiClient from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";
import type { PointTransaction, PointTransactionType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<PointTransactionType, string> = {
  earned: "Diperoleh",
  redeemed: "Ditukar",
  expired: "Kedaluwarsa",
};

const TYPE_VARIANTS: Record<PointTransactionType, "default" | "destructive" | "secondary"> = {
  earned: "default",
  redeemed: "destructive",
  expired: "secondary",
};

function formatAmount(type: PointTransactionType, amount: number): string {
  if (type === "earned") return `+${amount}`;
  return `-${amount}`;
}

export function PointHistory() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{
        transactions: PointTransaction[];
        total: number;
        page: number;
        pageSize: number;
      }>(
        "/api/members/me/points",
        { params: { page: pageNum, pageSize: 20 } }
      );
      setTransactions(response.data?.transactions ?? []);
      const totalPagesCalc = Math.ceil((response.data?.total ?? 0) / (response.data?.pageSize ?? 20));
      setTotalPages(totalPagesCalc || 1);
      setPage(response.data?.page ?? pageNum);
    } catch {
      setError("Gagal memuat riwayat poin.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints(1);
  }, [fetchPoints]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 min-h-[44px]"
          onClick={() => fetchPoints(page)}
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Coins className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Belum ada riwayat poin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded-xl border bg-card p-4"
        >
          <div className="flex flex-col gap-1">
            <Badge variant={TYPE_VARIANTS[tx.type]}>
              {TYPE_LABELS[tx.type]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(tx.createdAt)}
            </span>
          </div>

          <span
            className={`text-base font-semibold tabular-nums ${
              tx.type === "earned"
                ? "text-primary"
                : "text-destructive"
            }`}
          >
            {formatAmount(tx.type, tx.amount)}
          </span>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            disabled={page <= 1}
            onClick={() => fetchPoints(page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            disabled={page >= totalPages}
            onClick={() => fetchPoints(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
