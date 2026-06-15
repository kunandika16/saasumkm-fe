"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoucherInput } from "@/components/member/VoucherInput";
import { PaymentBarcode } from "@/components/member/PaymentBarcode";
import { useCartStore } from "@/stores/cart-store";
import { formatIDR } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import type { Voucher } from "@/types";

/** Shape returned by POST /api/orders/checkout after envelope unwrap */
interface CheckoutResponse {
  orderId: string;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  paymentBarcode: string;
  status: string;
}

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const hasUnavailableItems = useCartStore((s) => s.hasUnavailableItems);
  const clearCart = useCartStore((s) => s.clearCart);

  const [hydrated, setHydrated] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CheckoutResponse | null>(null);

  // Rehydrate cart store on mount
  useEffect(() => {
    useCartStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  // Redirect to order page if cart is empty after hydration
  useEffect(() => {
    if (hydrated && items.length === 0 && !completedOrder) {
      router.replace("/order");
    }
  }, [hydrated, items.length, completedOrder, router]);

  const originalTotal = getTotal();
  const finalTotal = Math.max(0, originalTotal - discountAmount);
  const canCheckout =
    items.length > 0 && !hasUnavailableItems() && !checkoutLoading;

  const handleVoucherApplied = (voucher: Voucher, discount: number) => {
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
  };

  const handleVoucherRemoved = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
  };

  const handleCheckout = async () => {
    if (!canCheckout) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const checkoutItems = items
        .filter((item) => item.isAvailable)
        .map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        }));

      const response = await apiClient.post<CheckoutResponse>("/api/orders/checkout", {
        items: checkoutItems,
        ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
      });

      setCompletedOrder(response.data);
      clearCart();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setCheckoutError(
        axiosError.response?.data?.message ||
          "Gagal memproses pesanan. Silakan coba lagi."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Show loading state during hydration
  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show payment barcode after successful checkout
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-md px-4 pt-5 pb-4">
        <PaymentBarcode
          paymentBarcode={completedOrder.paymentBarcode ?? ""}
          orderId={completedOrder.orderId ?? ""}
          finalTotal={completedOrder.finalTotal ?? 0}
        />

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/order" className="block">
            <Button variant="outline" className="w-full min-h-[44px]">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Pesan Lagi
            </Button>
          </Link>
          <Link href="/home" className="block">
            <Button variant="ghost" className="w-full min-h-[44px]">
              Kembali ke Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Don't render checkout form if cart is empty (will redirect)
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableItems = items.filter((item) => item.isAvailable);

  return (
    <div className="mx-auto max-w-md px-4 pt-5 pb-36">
      {/* Header with back button */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm shadow-slate-900/5">
        <Link href="/order">
          <Button
            variant="ghost"
            size="icon-sm"
            className="min-h-[44px] min-w-[44px]"
            aria-label="Kembali ke menu"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Payment
          </p>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Checkout
          </h1>
        </div>
      </div>

      {/* Order summary */}
      <Card className="mb-3">
        <CardHeader className="px-4 pb-2 pt-3">
          <CardTitle className="text-sm font-semibold">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <ul className="divide-y" role="list" aria-label="Item pesanan">
            {availableItems.map((item) => (
              <li
                key={item.menuItemId}
                className="flex items-center justify-between py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatIDR(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="ml-3 shrink-0 text-sm font-medium text-foreground">
                  {formatIDR(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Voucher input */}
      <div className="mb-3">
        <VoucherInput
          cartTotal={originalTotal}
          onVoucherApplied={handleVoucherApplied}
          onVoucherRemoved={handleVoucherRemoved}
          appliedVoucher={appliedVoucher}
          discountAmount={discountAmount}
        />
      </div>

      {/* Price breakdown */}
      <Card className="mb-4">
        <CardContent className="px-4 py-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                {formatIDR(originalTotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">
                  Diskon
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  −{formatIDR(discountAmount)}
                </span>
              </div>
            )}

            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Total
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatIDR(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout error */}
      {checkoutError && (
        <p className="mb-3 text-xs text-destructive text-center" role="alert">
          {checkoutError}
        </p>
      )}

      {/* Fixed bottom checkout button — above nav bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background border-t p-3">
        <div className="mx-auto max-w-md">
          <Button
            onClick={handleCheckout}
            disabled={!canCheckout}
            className="w-full min-h-[48px] text-base font-semibold"
            size="lg"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              `Bayar — ${formatIDR(finalTotal)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
