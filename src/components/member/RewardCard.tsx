"use client";

import Image from "next/image";
import { Gift } from "lucide-react";

import type { Reward } from "@/types";
import { cn } from "@/lib/utils";

interface RewardCardProps {
  reward: Reward;
  onRedeemClick?: (reward: Reward) => void;
}

export function RewardCard({ reward, onRedeemClick }: RewardCardProps) {
  const isOutOfStock = reward.stockQuantity === 0;
  const isMenuUnavailable = reward.menuItem?.isAvailable === false;
  const isDisabled = isOutOfStock || isMenuUnavailable;

  const handleClick = () => {
    if (!isDisabled && onRedeemClick) {
      onRedeemClick(reward);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-xl border bg-card text-left transition-all",
        isDisabled
          ? "cursor-not-allowed opacity-70"
          : "hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
      )}
      aria-label={`Tukar ${reward.name} - ${reward.requiredPoints} poin`}
    >
      {/* Reward Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {reward.imageUrl ? (
          <Image
            src={reward.imageUrl}
            alt={reward.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Gift className="h-10 w-10" aria-hidden="true" />
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-md bg-destructive/90 px-3 py-1.5 text-xs font-bold uppercase text-white">
              Habis
            </span>
          </div>
        )}

        {/* Unavailable Menu Item Overlay */}
        {!isOutOfStock && isMenuUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-bold text-foreground">
              Tidak tersedia
            </span>
          </div>
        )}

        {/* Discount Type Badge */}
        <div className="absolute left-2 top-2">
          <DiscountBadge
            discountType={reward.discountType}
            discountSubType={reward.discountSubType}
            discountValue={reward.discountValue}
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
          {reward.name}
        </h3>

        {/* Required Points */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-primary">
            {(reward.requiredPoints ?? 0).toLocaleString("id-ID")} poin
          </span>

          {/* Stock Indicator */}
          {!isOutOfStock && reward.stockQuantity <= 5 && (
            <span className="text-[10px] font-medium text-muted-foreground">
              Sisa {reward.stockQuantity}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Discount Badge ──────────────────────────────────────────────────────────

interface DiscountBadgeProps {
  discountType: "free" | "discount";
  discountSubType: "fixed" | "percentage" | null;
  discountValue: number | null;
}

function DiscountBadge({
  discountType,
  discountSubType,
  discountValue,
}: DiscountBadgeProps) {
  if (discountType === "free") {
    return (
      <span className="inline-flex items-center rounded-md bg-green-500/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
        Gratis
      </span>
    );
  }

  // Discount type
  let label = "Diskon";
  if (discountSubType === "percentage" && discountValue != null) {
    label = `Diskon ${discountValue}%`;
  } else if (discountSubType === "fixed" && discountValue != null) {
    label = `Diskon ${discountValue.toLocaleString("id-ID")}`;
  }

  return (
    <span className="inline-flex items-center rounded-md bg-blue-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
      {label}
    </span>
  );
}
