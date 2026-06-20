"use client";

import { useState } from "react";
import { ArrowLeft, Send, Users, Loader2, AlertCircle, CheckCircle2, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createBlast } from "@/lib/whatsapp-api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlastConfirmationProps {
  category: "reminder" | "promo" | "announcement" | "custom";
  inactivityPeriod?: "1week" | "1month" | "3months";
  message: string;
  recipientCount: number;
  sampleRecipientName: string;
  onConfirm: (jobId: string) => void;
  onCancel: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  reminder: "Reminder",
  promo: "Promo Terbaru",
  announcement: "Announcement",
  custom: "Custom",
};

const INACTIVITY_LABELS: Record<string, string> = {
  "1week": "1 Minggu",
  "1month": "1 Bulan",
  "3months": "3+ Bulan",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolvePreview(message: string, recipientName: string): string {
  const name = recipientName.trim() || "Pelanggan";
  return message.replace(/\{\{nama\}\}/g, name);
}

function getRecipientGroupLabel(
  category: string,
  inactivityPeriod?: string
): string {
  const categoryLabel = CATEGORY_LABELS[category] || category;
  if (category === "reminder" && inactivityPeriod) {
    return `${categoryLabel} - ${INACTIVITY_LABELS[inactivityPeriod] || inactivityPeriod}`;
  }
  return categoryLabel;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BlastConfirmation({
  category,
  inactivityPeriod,
  message,
  recipientCount,
  sampleRecipientName,
  onConfirm,
  onCancel,
}: BlastConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const recipientGroupLabel = getRecipientGroupLabel(category, inactivityPeriod);
  const previewMessage = resolvePreview(message, sampleRecipientName);
  const confirmDisabled = recipientCount === 0 || loading || success;

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await createBlast({
        category,
        inactivityPeriod,
        message,
      });

      setSuccess(true);
      // Short delay to show success notification before transitioning
      setTimeout(() => {
        onConfirm(response.jobId);
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Gagal membuat blast. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={loading || success}
          className="h-8 w-8 p-0"
          aria-label="Kembali ke editor"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-bold text-slate-800">
          Konfirmasi Blast
        </h3>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        {/* Recipient count and category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-slate-800">
              {recipientCount} penerima
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <Tag className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {recipientGroupLabel}
            </span>
          </div>
        </div>

        {/* No recipients warning */}
        {recipientCount === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-medium text-amber-700">
              Tidak ada penerima untuk blast ini.
            </span>
          </div>
        )}

        {/* Message preview */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">Preview Pesan</p>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 max-h-60 overflow-y-auto">
            <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
              {previewMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Success notification */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium text-emerald-700">
            Blast berhasil dijadwalkan untuk {recipientCount} penerima
          </span>
        </div>
      )}

      {/* Error message with retry */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-600 flex-1">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading || success}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          className={cn(
            "gap-2",
            error && "animate-in fade-in duration-200"
          )}
          aria-label={
            recipientCount === 0
              ? "Tidak dapat mengirim blast tanpa penerima"
              : loading
              ? "Mengirim blast..."
              : "Kirim blast WhatsApp"
          }
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {loading ? "Mengirim..." : error ? "Coba Lagi" : "Kirim Blast"}
        </Button>
      </div>
    </div>
  );
}
