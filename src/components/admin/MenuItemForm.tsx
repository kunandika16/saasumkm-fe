"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="menu-name"
          className="text-sm font-medium text-foreground"
        >
          Nama Menu <span className="text-red-500">*</span>
        </label>
        <Input
          id="menu-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Nasi Goreng Spesial"
          maxLength={100}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label
          htmlFor="menu-description"
          className="text-sm font-medium text-foreground"
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
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/200 karakter
        </p>
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <label
          htmlFor="menu-price"
          className="text-sm font-medium text-foreground"
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
        />
        {errors.price && (
          <p className="text-xs text-red-500">{errors.price}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Kategori <span className="text-red-500">*</span>
        </label>
        <Select value={categoryId} onValueChange={(val) => { if (val) setCategoryId(val); }}>
          <SelectTrigger aria-label="Pilih kategori">
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

      {/* Image Upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Gambar
        </label>
        {imagePreviewUrl ? (
          <div className="relative inline-block">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="h-32 w-32 rounded-lg object-cover border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              aria-label="Hapus gambar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 transition hover:border-primary/50"
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
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG, WebP (maks 2MB)
                </p>
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
      <div className="flex items-center gap-3">
        <input
          id="menu-available"
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="menu-available" className="text-sm text-foreground">
          Tersedia untuk dipesan
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {initialData ? "Simpan Perubahan" : "Tambah Menu"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
