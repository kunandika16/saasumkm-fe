"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Reward } from "@/types";

export interface RewardFormData {
  name: string;
  description: string;
  requiredPoints: number;
  stockQuantity: number;
  isActive: boolean;
}

interface RewardFormProps {
  /** If provided, form is in edit mode */
  reward?: Reward | null;
  onSubmit: (data: RewardFormData) => Promise<void>;
  onCancel: () => void;
}

export default function RewardForm({
  reward,
  onSubmit,
  onCancel,
}: RewardFormProps) {
  const isEdit = !!reward;

  const [name, setName] = useState(reward?.name ?? "");
  const [description, setDescription] = useState(reward?.description ?? "");
  const [requiredPoints, setRequiredPoints] = useState<string>(
    reward?.requiredPoints?.toString() ?? ""
  );
  const [stockQuantity, setStockQuantity] = useState<string>(
    reward?.stockQuantity?.toString() ?? ""
  );
  const [isActive, setIsActive] = useState(reward?.isActive ?? true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nama reward tidak boleh kosong";
    } else if (name.trim().length > 100) {
      newErrors.name = "Nama reward maksimal 100 karakter";
    }

    if (description.length > 500) {
      newErrors.description = "Deskripsi maksimal 500 karakter";
    }

    const points = parseInt(requiredPoints);
    if (!requiredPoints || isNaN(points) || points < 1) {
      newErrors.requiredPoints = "Poin minimal 1";
    }

    const stock = parseInt(stockQuantity);
    if (stockQuantity === "" || isNaN(stock) || stock < 0) {
      newErrors.stockQuantity = "Stok tidak boleh negatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        requiredPoints: parseInt(requiredPoints),
        stockQuantity: parseInt(stockQuantity),
        isActive,
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
      };
      setSubmitError(
        error.response?.data?.message ?? "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="reward-name" className="text-sm font-black text-slate-800">
          Nama Reward <span className="text-red-500">*</span>
        </label>
        <Input
          id="reward-name"
          placeholder="Contoh: Free Coffee"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          aria-invalid={!!errors.name}
          className="h-11 bg-white"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
        <p className="text-xs font-medium text-slate-400">{name.length}/100</p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="reward-description" className="text-sm font-black text-slate-800">
          Deskripsi
        </label>
        <textarea
          id="reward-description"
          className="flex min-h-28 w-full resize-none rounded-xl border border-input/85 bg-white px-3 py-3 text-sm shadow-sm shadow-slate-900/5 outline-none transition-all placeholder:text-muted-foreground/75 hover:border-primary/30 focus:border-ring focus:ring-4 focus:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Deskripsi reward (opsional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
        <p className="text-xs font-medium text-slate-400">
          {description.length}/500
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Required Points */}
        <div className="space-y-1.5">
          <label htmlFor="reward-points" className="text-sm font-black text-slate-800">
            Poin yang Dibutuhkan <span className="text-red-500">*</span>
          </label>
          <Input
            id="reward-points"
            type="number"
            min={1}
            placeholder="Contoh: 10"
            value={requiredPoints}
            onChange={(e) => setRequiredPoints(e.target.value)}
            aria-invalid={!!errors.requiredPoints}
            className="h-11 bg-white"
          />
          {errors.requiredPoints && (
            <p className="text-xs text-red-500">{errors.requiredPoints}</p>
          )}
        </div>

        {/* Stock Quantity */}
        <div className="space-y-1.5">
          <label htmlFor="reward-stock" className="text-sm font-black text-slate-800">
            Stok <span className="text-red-500">*</span>
          </label>
          <Input
            id="reward-stock"
            type="number"
            min={0}
            placeholder="Contoh: 50"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            aria-invalid={!!errors.stockQuantity}
            className="h-11 bg-white"
          />
          {errors.stockQuantity && (
            <p className="text-xs text-red-500">{errors.stockQuantity}</p>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <label htmlFor="reward-active" className="text-sm font-black text-slate-800">
            Status Aktif
          </label>
          <p className="text-xs font-medium text-slate-500">
            Reward aktif bisa ditukar oleh member.
          </p>
        </div>
        <button
          id="reward-active"
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(!isActive)}
          className={`relative h-8 w-14 shrink-0 rounded-full transition ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${isActive ? "left-7" : "left-1"}`}
          />
        </button>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="-mx-7 -mb-6 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/90 px-7 py-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="h-11 px-5">
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="h-11 px-5">
          {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Buat Reward"}
        </Button>
      </div>
    </form>
  );
}
