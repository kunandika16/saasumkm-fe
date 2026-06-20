"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  Banknote,
  QrCode,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoucherInput, RewardVoucherInfo } from "@/components/member/VoucherInput";
import { useCartStore } from "@/stores/cart-store";
import { formatIDR } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import type { Voucher } from "@/types";
import qrisImage from "@/assets/qris.jpg";

type PaymentMethod = "cash" | "qris";
type CheckoutStep = "summary" | "payment" | "waiting" | "confirmed";

interface CheckoutResponse {
  orderId: string;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  status: string;
}

interface OrderStatusResponse {
  id: string;
  status: string;
  pointsEarned: number;
}

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const hasUnavailableItems = useCartStore((s) => s.hasUnavailableItems);
  const clearCart = useCartStore((s) => s.clearCart);

  const [hydrated, setHydrated] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [appliedRewardVoucher, setAppliedRewardVoucher] = useState<RewardVoucherInfo | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [step, setStep] = useState<CheckoutStep>("summary");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CheckoutResponse | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Rehydrate cart store on mount
  useEffect(() => {
    useCartStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  // Redirect to order page if cart is empty after hydration
  useEffect(() => {
    if (hydrated && items.length === 0 && step === "summary") {
      router.replace("/order");
    }
  }, [hydrated, items.length, step, router]);

  // Poll order status when waiting for admin confirmation
  useEffect(() => {
    if (step !== "waiting" || !completedOrder) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await apiClient.get<OrderStatusResponse>(
          `/api/orders/${completedOrder.orderId}`
        );
        if (data.status === "paid") {
          setPointsEarned(data.pointsEarned ?? 0);
          setStep("confirmed");
        }
      } catch {
        // Ignore poll errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, completedOrder]);

  const originalTotal = getTotal();
  const finalTotal = Math.max(0, originalTotal - discountAmount);
  const canCheckout =
    items.length > 0 && !hasUnavailableItems() && !checkoutLoading && selectedMethod !== null;

  const handleVoucherApplied = (voucher: Voucher, discount: number) => {
    setAppliedVoucher(voucher);
    setAppliedRewardVoucher(null);
    setDiscountAmount(discount);
  };

  const handleVoucherRemoved = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
  };

  const handleRewardVoucherApplied = (rewardVoucher: RewardVoucherInfo, discount: number) => {
    setAppliedRewardVoucher(rewardVoucher);
    setAppliedVoucher(null);
    setDiscountAmount(discount);
  };

  const handleRewardVoucherRemoved = () => {
    setAppliedRewardVoucher(null);
    setDiscountAmount(0);
  };

  const handleCheckout = useCallback(async () => {
    if (!canCheckout || !selectedMethod) return;

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
        paymentMethod: selectedMethod,
        ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
        ...(appliedRewardVoucher ? { rewardVoucherCode: appliedRewardVoucher.code } : {}),
      });

      setCompletedOrder(response.data);
      clearCart();
      setStep("payment");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setCheckoutError(
        axiosError.response?.data?.message ||
          "Gagal memproses pesanan. Silakan coba lagi."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }, [canCheckout, selectedMethod, items, appliedVoucher, appliedRewardVoucher, clearCart]);

  // Loading state during hydration
  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Step: Confirmed ───────────────────────────────────────────────────────
  if (step === "confirmed") {
    return (
      <div className="mx-auto max-w-md px-4 pt-5 pb-4">
        <div className="flex flex-col items-center gap-4 text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Selamat, pesanan Anda telah dikonfirmasi!
          </h2>
          {pointsEarned > 0 && (
            <p className="text-base text-muted-foreground">
              Anda mendapatkan{" "}
              <span className="font-bold text-primary">{pointsEarned} poin</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/order" className="block">
            <Button variant="outline" className="w-full min-h-[48px]">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Pesan Lagi
            </Button>
          </Link>
          <Link href="/home" className="block">
            <Button variant="ghost" className="w-full min-h-[48px]">
              Kembali ke Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Step: Waiting for admin confirmation ──────────────────────────────────
  if (step === "waiting") {
    return (
      <div className="mx-auto max-w-md px-4 pt-5 pb-4">
        <div className="flex flex-col items-center gap-4 text-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            Menunggu konfirmasi kasir...
          </h2>
          <p className="text-sm text-muted-foreground">
            Tunjukkan bukti pembayaran ke kasir. Halaman ini akan otomatis berubah setelah dikonfirmasi.
          </p>
        </div>
      </div>
    );
  }

  // ─── Step: Payment instruction (cash or qris) ─────────────────────────────
  if (step === "payment" && completedOrder) {
    const isCash = completedOrder.paymentMethod === "cash";

    return (
      <div className="mx-auto max-w-md px-4 pt-5 pb-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isCash ? (
              <Banknote className="h-6 w-6 text-primary" />
            ) : (
              <QrCode className="h-6 w-6 text-primary" />
            )}
          </div>

          {isCash ? (
            <>
              <h2 className="text-lg font-bold text-foreground">
                Pembayaran Cash
              </h2>
              <p className="text-sm text-muted-foreground">
                Silahkan melakukan pembayaran ke kasir sejumlah
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatIDR(completedOrder.finalTotal)}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground">
                Pembayaran QRIS
              </h2>
              <div className="w-full max-w-[280px] rounded-xl overflow-hidden border">
                <Image
                  src={qrisImage}
                  alt="QRIS Payment"
                  className="w-full h-auto"
                  priority
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Silahkan scan dan lakukan pembayaran sejumlah{" "}
                <span className="font-bold text-foreground">
                  {formatIDR(completedOrder.finalTotal)}
                </span>{" "}
                dan tunjukkan ke kasir untuk konfirmasi pembayaran.
              </p>
            </>
          )}
        </div>

        <div className="mt-6">
          <Button
            onClick={() => setStep("waiting")}
            className="w-full min-h-[48px] text-base font-semibold"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Sudah Bayar
          </Button>
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

  // ─── Step: Summary (default) ───────────────────────────────────────────────
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
          cartItems={availableItems.map((item) => ({
            menuItemId: item.menuItemId,
            price: item.price,
            quantity: item.quantity,
          }))}
          onVoucherApplied={handleVoucherApplied}
          onVoucherRemoved={handleVoucherRemoved}
          onRewardVoucherApplied={handleRewardVoucherApplied}
          onRewardVoucherRemoved={handleRewardVoucherRemoved}
          appliedVoucher={appliedVoucher}
          appliedRewardVoucher={appliedRewardVoucher}
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

      {/* Payment method selection */}
      <Card className="mb-4">
        <CardHeader className="px-4 pb-2 pt-3">
          <CardTitle className="text-sm font-semibold">Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod("cash")}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors min-h-[52px] ${
                selectedMethod === "cash"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <Banknote className="h-5 w-5 shrink-0 text-green-600" />
              <span className="text-sm font-medium">Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("qris")}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors min-h-[52px] ${
                selectedMethod === "qris"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <QrCode className="h-5 w-5 shrink-0 text-blue-600" />
              <span className="text-sm font-medium">QRIS</span>
            </button>
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
