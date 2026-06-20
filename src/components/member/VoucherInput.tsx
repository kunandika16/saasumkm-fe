"use client";

import { useState } from "react";
import { Loader2, Tag, X, CheckCircle2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoucherCodeSchema } from "@/lib/validators/voucher";
import { formatIDR } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import type { Voucher, DiscountType } from "@/types";

/**
 * Reward voucher info returned from the validate endpoint.
 * Used to display reward-specific discount details in the applied state.
 */
export interface RewardVoucherInfo {
  id: string;
  code: string;
  menuItemId: string;
  menuItemName: string;
  discountType: "free" | "discount";
  discountSubType: "fixed" | "percentage" | null;
  discountValue: number | null;
}

interface VoucherInputProps {
  cartTotal: number;
  cartItems?: Array<{ menuItemId: string; price: number; quantity: number }>;
  onVoucherApplied: (voucher: Voucher, discountAmount: number) => void;
  onVoucherRemoved: () => void;
  onRewardVoucherApplied?: (rewardVoucher: RewardVoucherInfo, discountAmount: number) => void;
  onRewardVoucherRemoved?: () => void;
  appliedVoucher: Voucher | null;
  appliedRewardVoucher?: RewardVoucherInfo | null;
  discountAmount: number;
}

/**
 * Detects whether a code is a reward voucher (starts with "RW-" prefix).
 */
function isRewardVoucherCode(code: string): boolean {
  return code.startsWith("RW-");
}

export function VoucherInput({
  cartTotal,
  cartItems,
  onVoucherApplied,
  onVoucherRemoved,
  onRewardVoucherApplied,
  onRewardVoucherRemoved,
  appliedVoucher,
  appliedRewardVoucher,
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
      if (isRewardVoucherCode(code)) {
        // Reward voucher: call dedicated reward voucher validate endpoint
        const response = await apiClient.post(
          "/api/reward-vouchers/validate",
          { code }
        );

        const { voucher: rewardVoucherData } = response.data;

        if (rewardVoucherData) {
          // Calculate discount amount based on menu item in cart
          const menuItemInCart = cartItems?.find(
            (item) => item.menuItemId === rewardVoucherData.menuItemId
          );

          if (!menuItemInCart) {
            setError(
              `Voucher hanya berlaku untuk: ${rewardVoucherData.menuItem?.name || "menu item tertentu"}`
            );
            return;
          }

          // Calculate discount for ONE unit of the linked menu item
          let calculatedDiscount: number;
          if (rewardVoucherData.discountType === "free") {
            calculatedDiscount = menuItemInCart.price;
          } else if (rewardVoucherData.discountSubType === "fixed") {
            calculatedDiscount = Math.min(
              rewardVoucherData.discountValue ?? 0,
              menuItemInCart.price
            );
          } else {
            // percentage
            calculatedDiscount = Math.floor(
              (menuItemInCart.price * (rewardVoucherData.discountValue ?? 0)) / 100
            );
          }

          const rewardVoucherInfo: RewardVoucherInfo = {
            id: rewardVoucherData.id,
            code: rewardVoucherData.code,
            menuItemId: rewardVoucherData.menuItemId,
            menuItemName: rewardVoucherData.menuItem?.name || "",
            discountType: rewardVoucherData.discountType,
            discountSubType: rewardVoucherData.discountSubType || null,
            discountValue: rewardVoucherData.discountValue ?? null,
          };

          if (onRewardVoucherApplied) {
            onRewardVoucherApplied(rewardVoucherInfo, calculatedDiscount);
          }
          setCode("");
        } else {
          setError("Voucher reward tidak valid");
        }
      } else {
        // Regular voucher: call standard validate endpoint
        const response = await apiClient.post(
          "/api/vouchers/validate",
          { code }
        );

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
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
      setError(
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Gagal memvalidasi voucher. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (appliedRewardVoucher && onRewardVoucherRemoved) {
      onRewardVoucherRemoved();
    } else {
      onVoucherRemoved();
    }
    setError(null);
    setCode("");
  };

  // Show applied reward voucher state
  if (appliedRewardVoucher) {
    let discountLabel: string;
    if (appliedRewardVoucher.discountType === "free") {
      discountLabel = "Gratis";
    } else if (appliedRewardVoucher.discountSubType === "percentage") {
      discountLabel = `${appliedRewardVoucher.discountValue}%`;
    } else {
      discountLabel = formatIDR(appliedRewardVoucher.discountValue ?? 0);
    }

    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Gift className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                Voucher Reward &quot;{appliedRewardVoucher.code}&quot; diterapkan
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Untuk: {appliedRewardVoucher.menuItemName} — Diskon {discountLabel} (−{formatIDR(discountAmount)})
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 min-h-[44px] min-w-[44px] text-green-700 hover:text-destructive dark:text-green-300"
            onClick={handleRemove}
            aria-label="Hapus voucher reward"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Show applied regular voucher state
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
