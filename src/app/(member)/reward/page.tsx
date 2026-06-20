"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw, Coins } from "lucide-react";

import apiClient from "@/lib/api-client";
import type { Member, Reward } from "@/types";
import { Button } from "@/components/ui/button";
import { RedeemConfirmModal } from "@/components/member/RedeemConfirmModal";
import { cn } from "@/lib/utils";
import { RewardList } from "@/components/member/RewardList";
import { RewardVoucherHistory } from "@/components/member/RewardVoucherHistory";

export default function RewardPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tukar" | "history">("tukar");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const fetchMemberData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<Member>("/api/members/me");
      setMember(response.data);
    } catch {
      setError("Gagal memuat data member. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  // Handle reward redemption click
  const handleRedeemClick = useCallback((reward: Reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  }, []);

  // Handle successful redemption — refresh member data
  const handleRedeemSuccess = useCallback(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex max-w-xs flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Terjadi Kesalahan
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={fetchMemberData}
            variant="outline"
            size="lg"
            className="min-h-[44px] min-w-[44px] gap-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-6">
      {/* Point Balance Card */}
      <PointBalanceCard pointBalance={member.pointBalance} />

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex rounded-xl border border-border/80 bg-muted/50 p-1">
          <button
            onClick={() => setActiveTab("tukar")}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
              activeTab === "tukar"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tukar Voucher
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
              activeTab === "history"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            History Voucher
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "tukar" ? (
            <RewardList onRedeemClick={handleRedeemClick} />
          ) : (
            <RewardVoucherHistory />
          )}
        </div>
      </div>

      {/* Redeem Confirm Modal */}
      {selectedReward && (
        <RedeemConfirmModal
          reward={selectedReward}
          isOpen={showRedeemModal}
          onClose={() => {
            setShowRedeemModal(false);
            setSelectedReward(null);
          }}
          onSuccess={handleRedeemSuccess}
        />
      )}
    </div>
  );
}

// ─── Point Balance Card ──────────────────────────────────────────────────────

interface PointBalanceCardProps {
  pointBalance: number;
}

function PointBalanceCard({ pointBalance }: PointBalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground shadow-xl shadow-slate-950/15">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/65">
            Saldo Poin Anda
          </span>
        </div>

        {/* Point balance */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            {(pointBalance ?? 0).toLocaleString("id-ID")}
          </span>
          <span className="text-sm font-semibold text-sidebar-foreground/65">
            poin
          </span>
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          Tukarkan poin Anda dengan voucher reward menarik di bawah ini.
        </p>
      </div>
    </div>
  );
}
