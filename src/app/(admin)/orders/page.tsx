"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import apiClient from "@/lib/api-client";
import { formatIDR } from "@/lib/utils";
import {
  Order,
  OrderStatus,
  OrderValidationRequest,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import OrderTable from "@/components/admin/OrderTable";
import { AdminTableSkeleton } from "@/components/ui/loading-state";

type StatusFilter = "all" | OrderStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.PAID, label: "Paid" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
  { value: OrderStatus.EXPIRED, label: "Expired" },
];

const PAGE_SIZE = 50;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    OrderStatus.PENDING
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Action dialog state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    order: Order | null;
    action: "confirm" | "reject" | null;
  }>({ open: false, order: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Detail dialog state
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    order: Order | null;
  }>({ open: false, order: null });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const { data } = await apiClient.get<{
        orders: Order[];
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
      }>(
        "/api/admin/orders",
        { params }
      );
      setOrders(data?.orders ?? []);
      setTotalPages(data?.pagination?.totalPages ?? 1);
      setTotal(data?.pagination?.total ?? 0);
    } catch {
      setOrders([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  function handleConfirm(order: Order) {
    setActionError(null);
    setActionDialog({ open: true, order, action: "confirm" });
  }

  function handleReject(order: Order) {
    setActionError(null);
    setActionDialog({ open: true, order, action: "reject" });
  }

  function handleViewDetail(order: Order) {
    setDetailDialog({ open: true, order });
  }

  async function executeAction() {
    if (!actionDialog.order || !actionDialog.action) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const body: OrderValidationRequest = { action: actionDialog.action };
      await apiClient.post(
        `/api/admin/orders/${actionDialog.order.id}/validate`,
        body
      );
      setActionDialog({ open: false, order: null, action: null });
      // Refresh list after successful action
      fetchOrders();
    } catch (err: unknown) {
      // Handle 409 (already validated/rejected) or 400 (expired)
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 409 || error.response?.status === 400) {
        setActionError(
          error.response.data?.message ??
            "Order sudah divalidasi, ditolak, atau expired. Tidak dapat mengubah status."
        );
      } else {
        setActionError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-w-0 space-y-4 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900">
              Validasi pembayaran
            </p>
            <p className="text-xs font-medium text-slate-500">
              {total} order terdaftar
            </p>
          </div>
          <Select
            value={statusFilter as string}
            onValueChange={(val: string | null) => {
              if (val) setStatusFilter(val as StatusFilter);
            }}
          >
            <SelectTrigger
              aria-label="Filter status order"
              className="bg-white sm:w-48"
            >
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value as string}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <AdminTableSkeleton rows={7} columns={8} />
      ) : (
        <>
          <OrderTable
            orders={orders}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onViewDetail={handleViewDetail}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages} ({total} order)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm/Reject Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog({ open: false, order: null, action: null });
            setActionError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "confirm"
                ? "Konfirmasi Pembayaran"
                : "Tolak Order"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "confirm"
                ? `Konfirmasi pembayaran untuk order dari ${actionDialog.order?.member?.name ?? "member"}? Status akan berubah menjadi "Paid" dan poin akan diberikan.`
                : `Tolak order dari ${actionDialog.order?.member?.name ?? "member"}? Status akan berubah menjadi "Cancelled" dan voucher (jika ada) akan dikembalikan.`}
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" disabled={actionLoading} />
              }
            >
              Batal
            </DialogClose>
            <Button
              onClick={executeAction}
              disabled={actionLoading}
              className={
                actionDialog.action === "confirm"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              )}
              {actionDialog.action === "confirm" ? "Konfirmasi" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) => {
          if (!open) setDetailDialog({ open: false, order: null });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Order</DialogTitle>
          </DialogHeader>

          {detailDialog.order && (
            <div className="space-y-4 text-sm">
              {/* Member Info */}
              <div className="space-y-1">
                <p className="font-medium">
                  {detailDialog.order.member?.name ?? "-"}
                </p>
                <p className="text-muted-foreground">
                  {detailDialog.order.member?.whatsapp ?? "-"}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant={
                    detailDialog.order.status === OrderStatus.PAID
                      ? "default"
                      : detailDialog.order.status === OrderStatus.PENDING
                      ? "outline"
                      : detailDialog.order.status === OrderStatus.CANCELLED
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {detailDialog.order.status}
                </Badge>
              </div>

              {/* Items */}
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Items:</p>
                {detailDialog.order.items &&
                detailDialog.order.items.length > 0 ? (
                  <ul className="space-y-1">
                    {detailDialog.order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.itemName} x{item.quantity}
                        </span>
                        <span className="text-muted-foreground">
                          {formatIDR(item.itemPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Tidak ada item</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-1 rounded-xl bg-muted/45 p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatIDR(detailDialog.order.originalTotal ?? 0)}</span>
                </div>
                {(detailDialog.order.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>-{formatIDR(detailDialog.order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatIDR(detailDialog.order.finalTotal ?? 0)}</span>
                </div>
              </div>

              {/* Voucher */}
              {detailDialog.order.voucher && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voucher</span>
                  <Badge variant="secondary">
                    {detailDialog.order.voucher.code}
                  </Badge>
                </div>
              )}

              {/* Barcode */}
              {detailDialog.order.paymentBarcode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode Ref</span>
                  <span className="font-mono text-xs">
                    {detailDialog.order.paymentBarcode}
                  </span>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-1 border-t pt-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Dibuat</span>
                  <span>
                    {format(
                      new Date(detailDialog.order.createdAt),
                      "dd MMM yyyy HH:mm:ss",
                      { locale: id }
                    )}
                  </span>
                </div>
                {detailDialog.order.validatedAt && (
                  <div className="flex justify-between">
                    <span>Divalidasi</span>
                    <span>
                      {format(
                        new Date(detailDialog.order.validatedAt),
                        "dd MMM yyyy HH:mm:ss",
                        { locale: id }
                      )}
                    </span>
                  </div>
                )}
                {(detailDialog.order.pointsEarned ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Poin Diperoleh</span>
                    <span className="font-medium text-foreground">
                      +{detailDialog.order.pointsEarned}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
