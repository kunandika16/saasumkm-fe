"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  Pause,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

import { getBlastStatus, BlastJobStatusResponse } from "@/lib/whatsapp-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BlastProgressBarProps {
  jobId: string;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BlastProgressBar({ jobId, onClose }: BlastProgressBarProps) {
  const [jobStatus, setJobStatus] = useState<BlastJobStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFailedList, setShowFailedList] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch status ────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const status = await getBlastStatus(jobId);
      setJobStatus(status);
      setError(null);

      // Stop polling when job is no longer in progress
      if (status.status === "completed" || status.status === "failed" || status.status === "paused") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch {
      setError("Gagal memuat status blast.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // ─── Polling setup ─────────────────────────────────────────────────

  useEffect(() => {
    fetchStatus();

    intervalRef.current = setInterval(fetchStatus, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchStatus]);

  // ─── Progress calculation ──────────────────────────────────────────

  const totalRecipients = jobStatus?.totalRecipients ?? 0;
  const sentCount = jobStatus?.sentCount ?? 0;
  const failedCount = jobStatus?.failedCount ?? 0;
  const processedCount = sentCount + failedCount;
  const percentage = totalRecipients > 0 ? Math.round((processedCount / totalRecipients) * 100) : 0;

  // ─── Status display helpers ────────────────────────────────────────

  const getStatusConfig = () => {
    if (!jobStatus) return null;

    switch (jobStatus.status) {
      case "in_progress":
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
          label: "Mengirim pesan...",
          barColor: "bg-primary",
          barBgColor: "bg-primary/20",
          accentBorder: "border-primary/20",
          animated: true,
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
          label: "✓ Blast selesai",
          barColor: "bg-emerald-500",
          barBgColor: "bg-emerald-100",
          accentBorder: "border-emerald-200",
          animated: false,
        };
      case "failed":
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          label: "✗ Blast gagal",
          barColor: "bg-red-500",
          barBgColor: "bg-red-100",
          accentBorder: "border-red-200",
          animated: false,
        };
      case "paused":
        return {
          icon: <Pause className="h-5 w-5 text-amber-600" />,
          label: "⏸ Blast dijeda karena WhatsApp terputus",
          barColor: "bg-amber-500",
          barBgColor: "bg-amber-100",
          accentBorder: "border-amber-200",
          animated: false,
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  // ─── Loading state ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-slate-500">Memuat status blast...</span>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────

  if (error && !jobStatus) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6">
        <XCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="outline" size="sm" onClick={onClose}>
          Tutup
        </Button>
      </div>
    );
  }

  if (!jobStatus || !statusConfig) return null;

  // ─── Main render ───────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 space-y-4 shadow-sm",
        statusConfig.accentBorder
      )}
    >
      {/* Header with status and close button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <span className="text-sm font-bold text-slate-800">
            {statusConfig.label}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div
          className={cn("h-3 w-full rounded-full overflow-hidden", statusConfig.barBgColor)}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress ${percentage}%`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              statusConfig.barColor,
              statusConfig.animated && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage label */}
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500">{percentage}%</span>
        </div>
      </div>

      {/* Counters */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600">
            Terkirim: <span className="font-bold text-emerald-700">{sentCount}</span>
          </span>
        </div>

        {failedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-slate-600">
              Gagal: <span className="font-bold text-red-700">{failedCount}</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span className="text-slate-600">
            Total: <span className="font-bold text-slate-700">{totalRecipients}</span>
          </span>
        </div>
      </div>

      {/* Failed recipients list (expandable) */}
      {(jobStatus.status === "completed" || jobStatus.status === "failed") &&
        failedCount > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowFailedList(!showFailedList)}
              className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
              aria-expanded={showFailedList}
            >
              {showFailedList ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Lihat detail gagal ({failedCount})
            </button>

            {showFailedList && jobStatus.failedRecipients && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-red-100 bg-red-50/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-red-100 text-left">
                      <th className="px-3 py-2 font-bold text-slate-600">Nama</th>
                      <th className="px-3 py-2 font-bold text-slate-600">No. HP</th>
                      <th className="px-3 py-2 font-bold text-slate-600">Alasan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobStatus.failedRecipients.map((recipient, index) => (
                      <tr
                        key={index}
                        className="border-b border-red-50 last:border-b-0"
                      >
                        <td className="px-3 py-2 text-slate-700">
                          {recipient.name || "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-600 font-mono">
                          {recipient.whatsapp}
                        </td>
                        <td className="px-3 py-2 text-red-600">
                          {recipient.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      {/* Close button at bottom for completed/failed states */}
      {(jobStatus.status === "completed" || jobStatus.status === "failed") && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Tutup
          </Button>
        </div>
      )}
    </div>
  );
}
