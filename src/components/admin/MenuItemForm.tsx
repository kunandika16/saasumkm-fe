"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";

import apiClient from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/constants";
import type { MenuCategory, MenuItem } from "@/types";
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

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface MenuItemFormProps {
  categories: MenuCategory[];
  initialData?: MenuItem | null;
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  onCancel: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MenuItemForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
}: MenuItemFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const [isAvailable, setIsAvailable] = useState(
    initialData?.isAvailable ?? true
  );

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nama menu tidak boleh kosong";
    } else if (name.length > 100) {
      newErrors.name = "Nama menu maksimal 100 karakter";
    }

    if (description.length > 200) {
      newErrors.description = "Deskripsi maksimal 200 karakter";
    }

    const priceNum = parseInt(price, 10);
    if (!price || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "Harga harus angka >= 0";
    }

    if (!categoryId) {
      newErrors.categoryId = "Kategori harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Image Upload ──────────────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setUploading(true);
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { image: _, ...rest } = prev;
        return rest;
      });

      try {
        const formData = new FormData();
        formData.append("image", file);

        const { data } = await apiClient.post("/api/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setImageUrl(data.url);
      } catch {
        setErrors((prev) => ({
          ...prev,
          image: "Gagal mengupload gambar. Coba lagi.",
        }));
      } finally {
        setUploading(false);
      }
    },
    []
  );

  function removeImage() {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: parseInt(price, 10),
        categoryId,
        imageUrl,
        isAvailable,
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const imagePreviewUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${API_BASE_URL}${imageUrl}`
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="menu-name"
          className="text-sm font-black text-slate-800"
        >
          Nama Menu <span className="text-red-500">*</span>
        </label>
        <Input
          id="menu-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Nasi Goreng Spesial"
          maxLength={100}
          className="h-11 bg-white"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label
          htmlFor="menu-description"
          className="text-sm font-black text-slate-800"
        >
          Deskripsi
        </label>
        <textarea
          id="menu-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi singkat (maks 200 karakter)"
          maxLength={200}
          rows={3}
          className="flex min-h-24 w-full resize-none rounded-xl border border-input/85 bg-white px-3 py-3 text-sm shadow-sm shadow-slate-900/5 outline-none transition-all placeholder:text-muted-foreground/75 hover:border-primary/30 focus:border-ring focus:ring-4 focus:ring-ring/15"
        />
        <p className="text-xs font-medium text-slate-400">
          {description.length}/200 karakter
        </p>
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Price */}
        <div className="space-y-1.5">
          <label
            htmlFor="menu-price"
            className="text-sm font-black text-slate-800"
          >
            Harga (Rp) <span className="text-red-500">*</span>
          </label>
          <Input
            id="menu-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25000"
            min={0}
            className="h-11 bg-white"
          />
          {errors.price && (
            <p className="text-xs text-red-500">{errors.price}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-black text-slate-800">
            Kategori <span className="text-red-500">*</span>
          </label>
          <Select value={categoryId} onValueChange={(val) => { if (val) setCategoryId(val); }}>
            <SelectTrigger aria-label="Pilih kategori" className="h-11 w-full bg-white">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-xs text-red-500">{errors.categoryId}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-black text-slate-800">
          Gambar
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
            aria-label="Upload gambar"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            ) : (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-sky-500 shadow-sm">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-700">
                  Upload gambar menu
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  JPG, PNG, WebP (maks 2MB)
                </p>
                <Upload className="mt-3 h-4 w-4 text-slate-400" />
              </>
            )}
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

      {/* Availability */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <label htmlFor="menu-available" className="text-sm font-black text-slate-800">
            Status Menu
          </label>
          <p className="text-xs font-medium text-slate-500">
            Atur apakah menu bisa dipesan pelanggan.
          </p>
        </div>
        <button
          id="menu-available"
          type="button"
          role="switch"
          aria-checked={isAvailable}
          onClick={() => setIsAvailable((value) => !value)}
          className={`relative h-8 w-14 rounded-full transition ${isAvailable ? "bg-emerald-500" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${isAvailable ? "left-7" : "left-1"}`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="-mx-7 -mb-6 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/90 px-7 py-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="h-11 px-5"
        >
          Batal
        </Button>
        <Button type="submit" disabled={submitting || uploading} className="h-11 px-5">
          {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {initialData ? "Simpan Perubahan" : "Tambah Menu"}
        </Button>
      </div>
    </form>
  );
}
