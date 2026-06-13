"use client";

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

import apiClient from "@/lib/api-client";
import type { Reward, ApiError } from "@/types";
import { Button } from "@/components/ui/button";

interface RewardCardProps {
  reward: Reward;
  onRedeemed?: () => void;
}

export function RewardCard({ reward, onRedeemed }: RewardCardProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    setIsRedeeming(true);
    setError(null);

    try {
      await apiClient.post(`/api/rewards/${reward.id}/redeem`);
      setSuccess(true);
      onRedeemed?.();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || "Gagal menukar reward.";
      setError(message);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* Reward info */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Gift className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground leading-tight">
            {reward.name}
          </h3>
          {reward.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {reward.description}
            </p>
          )}
        </div>
      </div>

      {/* Points required + Redeem button */}
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-xs font-medium text-muted-foreground">
          {(reward.requiredPoints ?? 0).toLocaleString("id-ID")} poin
        </span>

        {success ? (
          <span className="text-xs font-medium text-primary">
            Berhasil ditukar!
          </span>
        ) : (
          <Button
            size="sm"
            className="min-h-[44px] min-w-[44px]"
            disabled={isRedeeming}
            onClick={handleRedeem}
          >
            {isRedeeming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Tukar"
            )}
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
