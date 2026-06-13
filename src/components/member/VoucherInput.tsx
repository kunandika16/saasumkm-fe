"use client";

import { useState } from "react";
import { Loader2, Tag, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoucherCodeSchema } from "@/lib/validators/voucher";
import { formatIDR } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import type { Voucher, DiscountType } from "@/types";

interface VoucherInputProps {
  cartTotal: number;
  onVoucherApplied: (voucher: Voucher, discountAmount: number) => void;
  onVoucherRemoved: () => void;
  appliedVoucher: Voucher | null;
  discountAmount: number;
}

export function VoucherInput({
  cartTotal,
  onVoucherApplied,
  onVoucherRemoved,
  appliedVoucher,
  discountAmount,
}: VoucherInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setError(null);

    // Validate format locally first
    const result = VoucherCodeSchema.safeParse({ code });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(
        "/api/vouchers/validate",
        { code }
      );

      // Backend returns the voucher directly: { code, discountType, discountValue, expiryDate }
      const voucherData = response.data;

      if (voucherData && voucherData.code) {
        // Calculate discount amount based on voucher type
        let calculatedDiscount: number;
        if (voucherData.discountType === "percentage") {
          calculatedDiscount = Math.floor(cartTotal * voucherData.discountValue / 100);
        } else {
          calculatedDiscount = voucherData.discountValue;
        }

        // Build a voucher object for the parent component
        const voucher: Voucher = {
          id: "",
          tenantId: "",
          code: voucherData.code,
          discountType: voucherData.discountType,
          discountValue: voucherData.discountValue,
          expiryDate: voucherData.expiryDate,
          maxUsage: 0,
          currentUsage: 0,
          isActive: true,
          isWelcomeVoucher: false,
          issuedToMemberId: null,
          createdAt: "",
        };

        onVoucherApplied(voucher, calculatedDiscount);
        setCode("");
      } else {
        setError("Voucher tidak valid");
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Gagal memvalidasi voucher. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onVoucherRemoved();
    setError(null);
    setCode("");
  };

  // Show applied voucher state
  if (appliedVoucher) {
    const discountLabel =
      appliedVoucher.discountType === ("percentage" as DiscountType)
        ? `${appliedVoucher.discountValue}%`
        : formatIDR(appliedVoucher.discountValue);

    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                Voucher &quot;{appliedVoucher.code}&quot; diterapkan
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Diskon {discountLabel} (−{formatIDR(discountAmount)})
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 min-h-[44px] min-w-[44px] text-green-700 hover:text-destructive dark:text-green-300"
            onClick={handleRemove}
            aria-label="Hapus voucher"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">
          Punya voucher?
        </span>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Masukkan kode voucher"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          className="min-h-[44px] flex-1"
          maxLength={20}
          aria-label="Kode voucher"
          aria-invalid={!!error}
          aria-describedby={error ? "voucher-error" : undefined}
          disabled={loading}
        />
        <Button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="min-h-[44px] shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Terapkan"
          )}
        </Button>
      </div>

      {error && (
        <p
          id="voucher-error"
          className="text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
