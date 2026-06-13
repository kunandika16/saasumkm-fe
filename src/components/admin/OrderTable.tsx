"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { Check, X, Eye } from "lucide-react";

import { Order, OrderStatus } from "@/types";
import { formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface OrderTableProps {
  orders: Order[];
  onConfirm: (order: Order) => void;
  onReject: (order: Order) => void;
  onViewDetail: (order: Order) => void;
}

function getStatusBadgeVariant(
  status: OrderStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case OrderStatus.PENDING:
      return "outline";
    case OrderStatus.PAID:
      return "default";
    case OrderStatus.CANCELLED:
      return "destructive";
    case OrderStatus.EXPIRED:
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pending";
    case OrderStatus.PAID:
      return "Paid";
    case OrderStatus.CANCELLED:
      return "Cancelled";
    case OrderStatus.EXPIRED:
      return "Expired";
    default:
      return status;
  }
}

export default function OrderTable({
  orders,
  onConfirm,
  onReject,
  onViewDetail,
}: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground">Tidak ada order ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Voucher</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.member?.name ?? "-"}
                </TableCell>
                <TableCell>
                  <span className="max-w-[160px] truncate block">
                    {order.items && order.items.length > 0
                      ? order.items
                          .map((i) => `${i.itemName} x${i.quantity}`)
                          .join(", ")
                      : "-"}
                  </span>
                </TableCell>
                <TableCell>{formatIDR(order.finalTotal ?? 0)}</TableCell>
                <TableCell>
                  {order.voucher ? (
                    <Badge variant="secondary">{order.voucher.code}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">
                    {order.paymentBarcode ?? "-"}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(order.createdAt), "dd MMM yyyy HH:mm", {
                    locale: id,
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onViewDetail(order)}
                      aria-label="Lihat detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {order.status === OrderStatus.PENDING && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onConfirm(order)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Konfirmasi
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onReject(order)}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Layout */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">
                  {order.member?.name ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.createdAt), "dd MMM yyyy HH:mm", {
                    locale: id,
                  })}
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="max-w-[200px] truncate text-right">
                  {order.items && order.items.length > 0
                    ? order.items
                        .map((i) => `${i.itemName} x${i.quantity}`)
                        .join(", ")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatIDR(order.finalTotal ?? 0)}</span>
              </div>
              {order.voucher && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voucher</span>
                  <Badge variant="secondary">{order.voucher.code}</Badge>
                </div>
              )}
              {order.paymentBarcode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode</span>
                  <span className="font-mono text-xs">
                    {order.paymentBarcode}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(order)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Detail
              </Button>
              {order.status === OrderStatus.PENDING && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => onConfirm(order)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Konfirmasi
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1"
                    onClick={() => onReject(order)}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Tolak
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
