"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import apiClient from "@/lib/api-client";
import type { Member } from "@/types";
import { LoyaltyCard } from "@/components/member/LoyaltyCard";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
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

  // Success state
  if (!member) return null;

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-6">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Selamat datang,</p>
        <h1 className="text-xl font-semibold text-foreground truncate">
          {member.name}
        </h1>
      </div>

      {/* Loyalty Card */}
      <LoyaltyCard
        name={member.name}
        pointBalance={member.pointBalance}
        className="w-full"
      />

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">Total Kunjungan</p>
          <p className="text-lg font-semibold tabular-nums">
            {member.totalVisits}
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">Member Sejak</p>
          <p className="text-sm font-medium">
            {member.registeredAt
              ? new Date(member.registeredAt).toLocaleDateString("id-ID", {
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
