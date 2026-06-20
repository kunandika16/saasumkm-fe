"use client";

import { useState, useCallback } from "react";
import { Bell, PartyPopper, Megaphone, PenLine, Loader2, AlertCircle, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { getRecipientCount } from "@/lib/whatsapp-api";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "reminder" | "promo" | "announcement" | "custom";
type InactivityPeriod = "1week" | "1month" | "3months";

interface BlastCategorySelectorProps {
  onCategorySelected: (category: string, inactivityPeriod?: string) => void;
  onRecipientCount: (count: number, sampleRecipient?: { name: string; whatsapp: string }) => void;
}

interface CategoryOption {
  id: Category;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface InactivityOption {
  id: InactivityPeriod;
  label: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: CategoryOption[] = [
  {
    id: "reminder",
    label: "Reminder",
    icon: <Bell className="h-5 w-5" />,
    description: "Pelanggan yang sudah lama tidak berkunjung",
  },
  {
    id: "promo",
    label: "Promo Terbaru",
    icon: <PartyPopper className="h-5 w-5" />,
    description: "Semua pelanggan dengan WhatsApp",
  },
  {
    id: "announcement",
    label: "Announcement",
    icon: <Megaphone className="h-5 w-5" />,
    description: "Semua pelanggan dengan WhatsApp",
  },
  {
    id: "custom",
    label: "Custom",
    icon: <PenLine className="h-5 w-5" />,
    description: "Semua pelanggan dengan WhatsApp",
  },
];

const INACTIVITY_OPTIONS: InactivityOption[] = [
  { id: "1week", label: "1 Minggu" },
  { id: "1month", label: "1 Bulan" },
  { id: "3months", label: "3+ Bulan" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function BlastCategorySelector({
  onCategorySelected,
  onRecipientCount,
}: BlastCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedInactivity, setSelectedInactivity] = useState<InactivityPeriod | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch recipient count ─────────────────────────────────────────────

  const fetchRecipientCount = useCallback(
    async (category: Category, inactivityPeriod?: InactivityPeriod) => {
      setLoading(true);
      setError(null);
      setRecipientCount(null);

      try {
        const result = await getRecipientCount(category, inactivityPeriod);
        setRecipientCount(result.count);
        onRecipientCount(result.count, result.sampleRecipient);
        onCategorySelected(category, inactivityPeriod);
      } catch {
        setError("Gagal memuat jumlah penerima. Silakan coba lagi.");
        setRecipientCount(null);
      } finally {
        setLoading(false);
      }
    },
    [onCategorySelected, onRecipientCount]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleCategorySelect = useCallback(
    (category: Category) => {
      setSelectedCategory(category);
      setSelectedInactivity(null);
      setRecipientCount(null);
      setError(null);

      // For non-reminder categories, fetch count immediately
      if (category !== "reminder") {
        fetchRecipientCount(category);
      }
    },
    [fetchRecipientCount]
  );

  const handleInactivitySelect = useCallback(
    (period: InactivityPeriod) => {
      setSelectedInactivity(period);
      fetchRecipientCount("reminder", period);
    },
    [fetchRecipientCount]
  );

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Category selection grid */}
      <div>
        <p className="mb-3 text-sm font-bold text-slate-700">Pilih Kategori</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                selectedCategory === cat.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-slate-200 bg-white"
              )}
              aria-pressed={selectedCategory === cat.id}
              aria-label={`Kategori ${cat.label}`}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  selectedCategory === cat.id
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {cat.icon}
              </span>
              <span className="text-sm font-bold text-slate-800">{cat.label}</span>
              <span className="text-xs text-slate-500 leading-tight">{cat.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inactivity sub-options for Reminder */}
      {selectedCategory === "reminder" && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="mb-3 text-sm font-bold text-slate-700">Lama Tidak Berkunjung</p>
          <div className="flex gap-2">
            {INACTIVITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleInactivitySelect(option.id)}
                className={cn(
                  "flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-all duration-200",
                  "hover:border-primary/50 hover:bg-primary/5",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                  selectedInactivity === option.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 bg-white text-slate-700"
                )}
                aria-pressed={selectedInactivity === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-slate-500">Menghitung penerima...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Recipient count display */}
      {recipientCount !== null && !loading && !error && (
        <div className="animate-in fade-in duration-200">
          {recipientCount > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
              <Users className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-sm font-bold text-emerald-700">
                {recipientCount} penerima
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-sm font-bold text-amber-700">
                Tidak ada penerima yang cocok
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
