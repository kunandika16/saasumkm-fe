"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import apiClient from "@/lib/api-client";
import type { Reward } from "@/types";
import { Button } from "@/components/ui/button";
import { RewardCard } from "@/components/member/RewardCard";

interface RewardListProps {
  onRedeemClick?: (reward: Reward) => void;
}

export function RewardList({ onRedeemClick }: RewardListProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ rewards: Reward[] }>("/api/rewards");
      setRewards(response.data.rewards);
    } catch {
      setError("Gagal memuat daftar reward. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border bg-card overflow-hidden"
          >
            <div className="aspect-[4/3] w-full bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/80 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            onClick={fetchRewards}
            variant="outline"
            size="sm"
            className="min-h-[44px] min-w-[44px] gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (rewards.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/80 p-6">
        <p className="text-sm text-muted-foreground">
          Belum ada reward yang tersedia saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          onRedeemClick={onRedeemClick}
        />
      ))}
    </div>
  );
}
