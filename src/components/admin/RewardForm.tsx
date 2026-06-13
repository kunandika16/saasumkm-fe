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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="reward-name" className="text-sm font-medium">
          Nama Reward <span className="text-red-500">*</span>
        </label>
        <Input
          id="reward-name"
          placeholder="Contoh: Free Coffee"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">{name.length}/100</p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="reward-description" className="text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          id="reward-description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Deskripsi reward (opsional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {description.length}/500
        </p>
      </div>

      {/* Required Points */}
      <div className="space-y-1.5">
        <label htmlFor="reward-points" className="text-sm font-medium">
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
        />
        {errors.requiredPoints && (
          <p className="text-xs text-red-500">{errors.requiredPoints}</p>
        )}
      </div>

      {/* Stock Quantity */}
      <div className="space-y-1.5">
        <label htmlFor="reward-stock" className="text-sm font-medium">
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
        />
        {errors.stockQuantity && (
          <p className="text-xs text-red-500">{errors.stockQuantity}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <label htmlFor="reward-active" className="text-sm font-medium">
          Status Aktif
        </label>
        <button
          id="reward-active"
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isActive ? "bg-primary" : "bg-input"
          }`}
        >
          <span
            className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform ${
              isActive ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-xs text-muted-foreground">
          {isActive ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Buat Reward"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
      </div>
    </form>
  );
}
