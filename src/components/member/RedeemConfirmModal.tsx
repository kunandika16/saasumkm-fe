"use client";

import { useState, useCallback } from "react";
import { Check, Copy, Loader2, AlertCircle, Gift } from "lucide-react";
import { AxiosError } from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import type { Reward, ApiError } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RedeemConfirmModalProps {
  reward: Reward;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RedeemResponse {
  rewardVoucher: {
    id: string;
    code: string;
    menuItemName: string;
    discountType: string;
    discountSubType: string | null;
    discountValue: number | null;
    expiryDate: string;
  };
}

type ModalView = "confirm" | "loading" | "success" | "error";

// ─── Component ───────────────────────────────────────────────────────────────

export function RedeemConfirmModal({
  reward,
  isOpen,
  onClose,
  onSuccess,
}: RedeemConfirmModalProps) {
  const [view, setView] = useState<ModalView>("confirm");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setView("confirm");
    setVoucherCode("");
    setExpiryDate("");
    setErrorMessage("");
    setCopied(false);
    onClose();
  }, [onClose]);

  // Handle redemption
  const handleRedeem = useCallback(async () => {
    setView("loading");
    setErrorMessage("");

    try {
      const response = await apiClient.post<RedeemResponse>(
        `/api/rewards/${reward.id}/redeem`
      );
      const voucher = response.data.rewardVoucher;
      setVoucherCode(voucher.code);
      setExpiryDate(voucher.expiryDate);
      setView("success");
      onSuccess();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || "Gagal menukar reward. Silakan coba lagi.";
      setErrorMessage(message);
      setView("error");
    }
  }, [reward.id, onSuccess]);

  // Copy voucher code to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = voucherCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [voucherCode]);

  // Format discount type for display
  const getDiscountLabel = (): string => {
    if (reward.discountType === "free") return "Gratis";
    if (reward.discountSubType === "percentage") return `Diskon ${reward.discountValue}%`;
    if (reward.discountSubType === "fixed")
      return `Diskon Rp ${(reward.discountValue ?? 0).toLocaleString("id-ID")}`;
    return "Diskon";
  };

  // Format expiry date
  const formatExpiry = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={view !== "loading"} className="sm:max-w-sm">
        {/* ─── Confirmation View ────────────────────────────────────── */}
        {view === "confirm" && (
          <>
            <DialogHeader className="p-5 pb-0">
              <DialogTitle>Tukar Reward</DialogTitle>
              <DialogDescription>
                Konfirmasi penukaran reward dengan poin Anda
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              {/* Reward info */}
              <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-4">
                {reward.imageUrl ? (
                  <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Gift className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">
                    {reward.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getDiscountLabel()}
                    {reward.menuItem && ` • ${reward.menuItem.name}`}
                  </p>
                </div>
              </div>

              {/* Points cost */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Tukar dengan
                </p>
                <p className="mt-1 text-2xl font-bold text-primary tabular-nums">
                  {reward.requiredPoints.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-muted-foreground">poin</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={handleClose}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 min-h-[44px]"
                  onClick={handleRedeem}
                >
                  Tukar Sekarang
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ─── Loading View ─────────────────────────────────────────── */}
        {view === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 px-5 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Memproses penukaran...
            </p>
          </div>
        )}

        {/* ─── Success View ─────────────────────────────────────────── */}
        {view === "success" && (
          <>
            <div className="p-5 space-y-5 text-center">
              {/* Success icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <Check className="h-7 w-7 text-green-600" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Berhasil!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Voucher reward Anda sudah siap digunakan
                </p>
              </div>

              {/* Voucher code display */}
              <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Kode Voucher
                </p>
                <p className="text-2xl font-bold font-mono tracking-widest text-foreground">
                  {voucherCode}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[36px] gap-2"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Expiry info */}
              {expiryDate && (
                <p className="text-xs text-muted-foreground">
                  Berlaku sampai {formatExpiry(expiryDate)}
                </p>
              )}

              {/* Close button */}
              <Button
                className="w-full min-h-[44px]"
                onClick={handleClose}
              >
                Selesai
              </Button>
            </div>
          </>
        )}

        {/* ─── Error View ───────────────────────────────────────────── */}
        {view === "error" && (
          <>
            <div className="p-5 space-y-5 text-center">
              {/* Error icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  Gagal Menukar
                </h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={handleClose}
                >
                  Tutup
                </Button>
                <Button
                  className="flex-1 min-h-[44px]"
                  onClick={() => setView("confirm")}
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
