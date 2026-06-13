"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { AxiosError } from "axios";

import apiClient from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReviewClickResponse {
  rewardGranted: boolean;
  rewardType?: string;
  rewardValue?: number;
}

interface GoogleReviewCTAProps {
  googlePlaceUrl: string | null;
  className?: string;
}

export function GoogleReviewCTA({ googlePlaceUrl, className }: GoogleReviewCTAProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);

  // Requirement 11.6: Don't show if Google Maps Place URL not configured
  if (!googlePlaceUrl) {
    return null;
  }

  const url = googlePlaceUrl;

  async function handleReviewClick() {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Requirement 11.3: Record click event via POST /api/reviews/click
      const response = await apiClient.post<ReviewClickResponse>("/api/reviews/click");

      // Requirement 11.4 & 11.5: Show reward notification on first click
      if (response.data.rewardGranted) {
        const rewardType = response.data.rewardType === "points" ? "bonus poin" : "voucher";
        const rewardValue = response.data.rewardValue ?? 0;
        const message =
          response.data.rewardType === "points"
            ? `Selamat! Anda mendapatkan ${rewardValue} ${rewardType}!`
            : `Selamat! Anda mendapatkan ${rewardType} senilai Rp ${(rewardValue ?? 0).toLocaleString("id-ID")}!`;
        setRewardNotification(message);
      }

      // Open Google Maps URL in new tab after recording the click
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      // Even if recording fails, still open the review link
      if (!(error instanceof AxiosError && error.response?.status === 401)) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/20">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Berikan Review di Google
          </span>
        </div>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
          Bantu kami dengan memberikan review di Google Maps. Terima kasih atas dukungan Anda!
        </p>
        <Button
          onClick={handleReviewClick}
          disabled={isLoading}
          variant="outline"
          className="w-full min-h-[44px] border-yellow-300 bg-white text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 dark:hover:bg-yellow-900"
          aria-label="Berikan review di Google Maps"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Memproses...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4" aria-hidden="true" />
              Review di Google Maps
            </span>
          )}
        </Button>
      </div>

      {/* Reward notification */}
      {rewardNotification && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            🎉 {rewardNotification}
          </p>
        </div>
      )}
    </div>
  );
}
