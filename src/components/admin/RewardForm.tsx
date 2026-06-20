"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";

import { API_BASE_URL } from "@/lib/constants";
import apiClient from "@/lib/api-client";
import type { MenuCategory, MenuItem, Reward } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RewardFormData {
  name: string;
  description: string;
  requiredPoints: number;
  stockQuantity: number;
  isActive: boolean;
  menuItemId: string;
  discountType: "free" | "discount";
  discountSubType: "fixed" | "percentage" | null;
  discountValue: number | null;
  imageUrl: string | null;
  imageFile: File | null;
}

interface RewardFormProps {
  /** If provided, form is in edit mode */
  reward?: Reward | null;
  onSubmit: (data: RewardFormData) => Promise<void>;
  onCancel: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

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

  // New fields
  const [menuItemId, setMenuItemId] = useState(reward?.menuItemId ?? "");
  const [discountType, setDiscountType] = useState<"free" | "discount">(
    reward?.discountType ?? "free"
  );
  const [discountSubType, setDiscountSubType] = useState<"fixed" | "percentage">(
    reward?.discountSubType ?? "fixed"
  );
  const [discountValue, setDiscountValue] = useState<string>(
    reward?.discountValue?.toString() ?? ""
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    reward?.imageUrl ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch Menu Items ──────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchMenuItems() {
      setMenuItemsLoading(true);
      try {
        const settingsRes = await apiClient.get("/api/admin/settings");
        const tenantId = settingsRes.data?.tenantId;

        if (!tenantId) {
          setMenuItems([]);
          return;
        }

        const { data } = await apiClient.get("/api/menu/categories", {
          params: { tenantId },
        });
        const categories: MenuCategory[] = Array.isArray(data)
          ? data
          : (data?.categories ?? []);
        const items = categories.flatMap((cat) => cat.items ?? []);
        setMenuItems(items);
      } catch {
        setMenuItems([]);
      } finally {
        setMenuItemsLoading(false);
      }
    }
    fetchMenuItems();
  }, []);

  // ─── Validation ────────────────────────────────────────────────────────────

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

    if (!menuItemId) {
      newErrors.menuItemId = "Menu item harus dipilih";
    }

    if (discountType === "discount") {
      const val = parseFloat(discountValue);
      if (!discountValue || isNaN(val) || val <= 0) {
        newErrors.discountValue = "Nilai diskon harus lebih dari 0";
      }
      if (discountSubType === "percentage" && val > 100) {
        newErrors.discountValue = "Persentase maksimal 100%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Image Upload ──────────────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Hanya file JPG, PNG, atau WebP yang diperbolehkan",
        }));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Ukuran file maksimal 2MB",
        }));
        return;
      }

      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { image: _, ...rest } = prev;
        return rest;
      });

      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    },
    []
  );

  function removeImage() {
    setImageUrl(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

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
        menuItemId,
        discountType,
        discountSubType: discountType === "discount" ? discountSubType : null,
        discountValue:
          discountType === "discount" ? parseFloat(discountValue) : null,
        imageUrl,
        imageFile,
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; error?: { message?: string } } };
      };
      setSubmitError(
        error.response?.data?.error?.message ??
          error.response?.data?.message ??
          "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const imagePreviewUrl = imageUrl
    ? imageUrl.startsWith("http") || imageUrl.startsWith("blob:")
      ? imageUrl
      : `${API_BASE_URL}${imageUrl}`
    : null;

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

      {/* Menu Item Selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-black text-slate-800">
          Menu Item <span className="text-red-500">*</span>
        </label>
        {menuItemsLoading ? (
          <div className="flex h-11 items-center rounded-xl border border-input/85 bg-white px-3">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-400" />
            <span className="text-sm text-slate-400">Memuat menu...</span>
          </div>
        ) : (
          <Select value={menuItemId} onValueChange={(val) => { if (val) setMenuItemId(val); }}>
            <SelectTrigger
              aria-label="Pilih menu item"
              aria-invalid={!!errors.menuItemId}
              className="h-11 w-full bg-white"
            >
              <SelectValue placeholder="Pilih menu item" />
            </SelectTrigger>
            <SelectContent>
              {menuItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} — Rp {item.price.toLocaleString("id-ID")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.menuItemId && (
          <p className="text-xs text-red-500">{errors.menuItemId}</p>
        )}
      </div>

      {/* Discount Type Radio Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-black text-slate-800">
          Tipe Diskon <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <label
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
              discountType === "free"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="discountType"
              value="free"
              checked={discountType === "free"}
              onChange={() => setDiscountType("free")}
              className="sr-only"
            />
            <span className={`h-4 w-4 rounded-full border-2 ${
              discountType === "free"
                ? "border-emerald-500 bg-emerald-500 shadow-[inset_0_0_0_2px_white]"
                : "border-slate-300"
            }`} />
            Gratis
          </label>
          <label
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
              discountType === "discount"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="discountType"
              value="discount"
              checked={discountType === "discount"}
              onChange={() => setDiscountType("discount")}
              className="sr-only"
            />
            <span className={`h-4 w-4 rounded-full border-2 ${
              discountType === "discount"
                ? "border-blue-500 bg-blue-500 shadow-[inset_0_0_0_2px_white]"
                : "border-slate-300"
            }`} />
            Diskon
          </label>
        </div>
      </div>

      {/* Conditional Discount Config (shown when type = "discount") */}
      {discountType === "discount" && (
        <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">
              Jenis Diskon
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscountSubType("fixed")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  discountSubType === "fixed"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                Nominal (Rp)
              </button>
              <button
                type="button"
                onClick={() => setDiscountSubType("percentage")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  discountSubType === "percentage"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                Persentase (%)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="discount-value" className="text-sm font-bold text-slate-700">
              Nilai Diskon <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="discount-value"
                type="number"
                min={1}
                max={discountSubType === "percentage" ? 100 : undefined}
                placeholder={discountSubType === "percentage" ? "Contoh: 50" : "Contoh: 5000"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                aria-invalid={!!errors.discountValue}
                className="h-11 bg-white pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                {discountSubType === "percentage" ? "%" : "Rp"}
              </span>
            </div>
            {errors.discountValue && (
              <p className="text-xs text-red-500">{errors.discountValue}</p>
            )}
          </div>
        </div>
      )}

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

      {/* Image Upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-black text-slate-800">
          Gambar Reward
        </label>
        {imagePreviewUrl ? (
          <div className="relative inline-block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="h-36 w-44 rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"
              aria-label="Hapus gambar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-[linear-gradient(135deg,#f8fafc,#eff6ff)] p-7 text-center transition hover:border-sky-400 hover:bg-sky-50"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload gambar reward"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-sky-500 shadow-sm">
              <ImagePlus className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-bold text-slate-700">
              Upload gambar reward
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              JPG, PNG, WebP (maks 2MB)
            </p>
            <Upload className="mt-3 h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
          aria-hidden="true"
        />
        {errors.image && (
          <p className="text-xs text-red-500">{errors.image}</p>
        )}
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
