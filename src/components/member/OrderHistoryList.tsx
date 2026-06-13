"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";

import apiClient from "@/lib/api-client";
import { formatIDR, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu",
  paid: "Dibayar",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  cancelled: "destructive",
  expired: "secondary",
};

export function OrderHistoryList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{
        orders: Order[];
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
      }>(
        "/api/orders",
        { params: { page: pageNum, pageSize: 20 } }
      );
      setOrders(response.data?.orders ?? []);
      setTotalPages(response.data?.pagination?.totalPages ?? 1);
      setPage(response.data?.pagination?.page ?? pageNum);
    } catch {
      setError("Gagal memuat riwayat pesanan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

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
          onClick={() => fetchOrders(page)}
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xl border bg-card p-4 space-y-2"
        >
          {/* Header: date + status */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {order.createdAt ? formatDate(order.createdAt) : "-"}
            </span>
            <Badge variant={STATUS_VARIANTS[order.status]}>
              {STATUS_LABELS[order.status]}
            </Badge>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-0.5">
              {order.items.map((item) => (
                <p key={item.id} className="text-sm text-foreground">
                  {item.quantity}x {item.itemName}
                </p>
              ))}
            </div>
          )}

          {/* Footer: total + points */}
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="text-sm font-medium">
              {formatIDR(order.finalTotal ?? 0)}
            </span>
            {(order.pointsEarned ?? 0) > 0 && (
              <span className="text-xs text-primary font-medium">
                +{order.pointsEarned} poin
              </span>
            )}
          </div>
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
            onClick={() => fetchOrders(page - 1)}
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
            onClick={() => fetchOrders(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
