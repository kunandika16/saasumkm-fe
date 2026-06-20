"use client";

import { useState } from "react";
import { Copy, Check, Ticket } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VoucherData {
  id: string;
  code: string;
  discountType: "free" | "discount";
  discountSubType: "fixed" | "percentage" | null;
  discountValue: number | null;
  expiryDate: string;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  status: "active" | "used" | "expired";
  rewardName: string;
  menuItemName: string | null;
}

interface VoucherCardProps {
  voucher: VoucherData;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CONFIG = {
  active: {
    label: "Aktif",
    variant: "default" as const,
    className: "bg-green-500/10 text-green-700 border-green-200",
  },
  used: {
    label: "Digunakan",
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground border-border",
  },
  expired: {
    label: "Kedaluwarsa",
    variant: "destructive" as const,
    className: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function VoucherCard({ voucher }: VoucherCardProps) {
  const [copied, setCopied] = useState(false);

  const statusConfig = STATUS_CONFIG[voucher.status];
  const isActive = voucher.status === "active";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = voucher.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4 transition-all",
        isActive ? "border-primary/20" : "opacity-75"
      )}
    >
      {/* Top Row: Reward Name + Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Ticket
            className={cn(
              "h-4 w-4 shrink-0",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
          <h4 className="text-sm font-semibold text-foreground truncate">
            {voucher.rewardName}
          </h4>
        </div>
        <Badge
          variant={statusConfig.variant}
          className={cn("shrink-0 text-[10px] font-semibold", statusConfig.className)}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Voucher Code */}
      <div className="mt-3 flex items-center gap-2">
        <code
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 font-mono text-sm font-bold tracking-wider",
            isActive
              ? "border-primary/20 bg-primary/5 text-primary"
              : "border-border bg-muted text-muted-foreground"
          )}
        >
          {voucher.code}
        </code>

        {/* Copy button — only for active vouchers */}
        {isActive && (
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all",
              "min-h-[44px] min-w-[44px]",
              copied
                ? "border-green-300 bg-green-50 text-green-600"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-label={copied ? "Tersalin" : "Salin kode voucher"}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Bottom Row: Date + Menu Item */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>Ditukar: {formatDate(voucher.createdAt)}</span>
        {voucher.menuItemName && (
          <span className="truncate ml-2 text-right">
            {voucher.menuItemName}
          </span>
        )}
      </div>
    </div>
  );
}
