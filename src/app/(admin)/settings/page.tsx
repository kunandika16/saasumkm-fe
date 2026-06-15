"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  MapPin,
  Coins,
  Gift,
  Building2,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import type { TenantSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsSkeleton } from "@/components/ui/loading-state";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for settings
  const [pointsPerAmount, setPointsPerAmount] = useState(1);
  const [amountPerPoint, setAmountPerPoint] = useState(10000);
  const [pointExpiryDays, setPointExpiryDays] = useState<number | null>(null);
  const [googlePlaceUrl, setGooglePlaceUrl] = useState("");
  const [welcomeVoucherType, setWelcomeVoucherType] = useState<string | null>(
    null
  );
  const [welcomeVoucherValue, setWelcomeVoucherValue] = useState<number | null>(
    null
  );
  const [welcomeVoucherDays, setWelcomeVoucherDays] = useState<number | null>(
    null
  );

  // Business info state
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<
        TenantSettings & {
          tenant?: {
            businessName?: string;
            description?: string | null;
            logoUrl?: string | null;
            bannerUrl?: string | null;
          };
        }
      >("/api/admin/settings");

      if (data) {
        const s = data;
        setPointsPerAmount(s.pointsPerAmount ?? 1);
        setAmountPerPoint(s.amountPerPoint ?? 10000);
        setPointExpiryDays(s.pointExpiryDays ?? null);
        setGooglePlaceUrl(s.googlePlaceUrl ?? "");
        setWelcomeVoucherType(s.welcomeVoucherType ?? null);
        setWelcomeVoucherValue(s.welcomeVoucherValue ?? null);
        setWelcomeVoucherDays(s.welcomeVoucherDays ?? null);

        // Populate tenant info if included in the response
        if (s.tenant) {
          setBusinessName(s.tenant.businessName ?? "");
          setDescription(s.tenant.description ?? "");
          setLogoUrl(s.tenant.logoUrl ?? null);
          setBannerUrl(s.tenant.bannerUrl ?? null);
        }
      }
    } catch {
      setError("Gagal memuat pengaturan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  async function handleSaveSettings() {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload: Record<string, unknown> = {
        pointsPerAmount,
        amountPerPoint,
        pointExpiryDays: pointExpiryDays || null,
        googlePlaceUrl: googlePlaceUrl.trim() || null,
        welcomeVoucherType: welcomeVoucherType || null,
        welcomeVoucherValue: welcomeVoucherValue || null,
        welcomeVoucherDays: welcomeVoucherDays || null,
      };

      await apiClient.patch("/api/admin/settings", payload);
      setSaveSuccess(true);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      setError(
        error.response?.data?.error?.message ?? "Gagal menyimpan pengaturan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(
    file: File,
    type: "logo" | "banner"
  ): Promise<string | null> {
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 2MB.");
      return null;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Format file harus JPG, PNG, atau WebP.");
      return null;
    }

    setUploadError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      if (type === "logo") setUploadingLogo(true);
      else setUploadingBanner(true);

      const { data } = await apiClient.post<{ url: string }>("/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data.url;
    } catch {
      setUploadError(`Gagal mengunggah ${type === "logo" ? "logo" : "banner"}.`);
      return null;
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleUpload(file, "logo");
    if (url) {
      setLogoUrl(url);
      // Save logo URL to settings/tenant
      try {
        await apiClient.patch("/api/admin/settings", { logoUrl: url });
      } catch {
        // Logo uploaded but save failed; still show the uploaded logo
      }
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleUpload(file, "banner");
    if (url) {
      setBannerUrl(url);
      // Save banner URL to settings/tenant
      try {
        await apiClient.patch("/api/admin/settings", { bannerUrl: url });
      } catch {
        // Banner uploaded but save failed; still show the uploaded banner
      }
    }
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-w-0 space-y-4 py-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.75)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900">
              Pengaturan merchant
            </p>
            <p className="text-xs font-medium text-slate-500">
              Bisnis, poin, voucher, dan review booster
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-sm font-semibold text-green-600">
                Tersimpan
              </span>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="h-10 rounded-xl bg-blue-500 px-4 text-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.9)] hover:bg-blue-600"
            >
              {saving ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success Banner */}
      {saveSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Pengaturan berhasil disimpan.
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
          {uploadError}
        </div>
      )}

      {/* Business Info Section */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Informasi Bisnis</h2>
        </div>

        <div className="space-y-4">
          {/* Business Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="businessName"
              className="text-sm font-medium text-foreground"
            >
              Nama Bisnis
            </label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Nama usaha Anda"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Deskripsi
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat bisnis Anda (maks. 500 karakter)"
              maxLength={500}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm shadow-slate-900/5 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 karakter
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Logo (maks. 512x512px, 2MB, JPG/PNG/WebP)
            </label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo bisnis"
                  className="h-16 w-16 rounded-xl border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed bg-muted/30">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground">
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingLogo ? "Mengunggah..." : "Upload Logo"}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={uploadingLogo}
                />
              </label>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Banner (maks. 1920x600px, 2MB, JPG/PNG/WebP)
            </label>
            <div className="space-y-2">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Banner bisnis"
                  className="h-28 w-full rounded-xl border object-cover"
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed bg-muted/30">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground">
                  {uploadingBanner ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingBanner ? "Mengunggah..." : "Upload Banner"}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleBannerChange}
                  disabled={uploadingBanner}
                />
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Point Rules Section */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Aturan Poin</h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Perubahan aturan poin hanya berlaku untuk transaksi baru (Req 8.7).
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Points Per Amount */}
          <div className="space-y-1.5">
            <label
              htmlFor="pointsPerAmount"
              className="text-sm font-medium text-foreground"
            >
              Poin per Jumlah
            </label>
            <Input
              id="pointsPerAmount"
              type="number"
              min={1}
              value={pointsPerAmount}
              onChange={(e) =>
                setPointsPerAmount(parseInt(e.target.value) || 1)
              }
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground">
              Jumlah poin yang diberikan per kelipatan.
            </p>
          </div>

          {/* Amount Per Point */}
          <div className="space-y-1.5">
            <label
              htmlFor="amountPerPoint"
              className="text-sm font-medium text-foreground"
            >
              Jumlah per Poin (Rp)
            </label>
            <Input
              id="amountPerPoint"
              type="number"
              min={1000}
              max={100000}
              step={1000}
              value={amountPerPoint}
              onChange={(e) =>
                setAmountPerPoint(parseInt(e.target.value) || 10000)
              }
              placeholder="10000"
            />
            <p className="text-xs text-muted-foreground">
              Kelipatan belanja untuk mendapatkan poin (Rp1.000 – Rp100.000).
            </p>
          </div>
        </div>

        {/* Point Expiry */}
        <div className="mt-4 space-y-1.5">
          <label
            htmlFor="pointExpiryDays"
            className="text-sm font-medium text-foreground"
          >
            Masa Berlaku Poin (hari)
          </label>
          <Input
            id="pointExpiryDays"
            type="number"
            min={30}
            value={pointExpiryDays ?? ""}
            onChange={(e) =>
              setPointExpiryDays(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            placeholder="Kosongkan jika tidak ada kedaluwarsa"
          />
          <p className="text-xs text-muted-foreground">
            Minimal 30 hari. Kosongkan untuk poin tanpa kedaluwarsa.
          </p>
        </div>
      </Card>

      {/* Welcome Voucher Section */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Welcome Voucher</h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Voucher yang otomatis diberikan saat member baru mendaftar.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Voucher Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Tipe Diskon
            </label>
            <Select
              value={welcomeVoucherType ?? "none"}
              onValueChange={(val) =>
                setWelcomeVoucherType(val === "none" ? null : val)
              }
            >
              <SelectTrigger aria-label="Tipe diskon welcome voucher">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak aktif</SelectItem>
                <SelectItem value="percentage">Persentase (%)</SelectItem>
                <SelectItem value="fixed">Nominal tetap (Rp)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Voucher Value */}
          <div className="space-y-1.5">
            <label
              htmlFor="welcomeVoucherValue"
              className="text-sm font-medium text-foreground"
            >
              Nilai Diskon
            </label>
            <Input
              id="welcomeVoucherValue"
              type="number"
              min={1}
              max={welcomeVoucherType === "percentage" ? 100 : 10000000}
              value={welcomeVoucherValue ?? ""}
              onChange={(e) =>
                setWelcomeVoucherValue(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              placeholder={
                welcomeVoucherType === "percentage" ? "1–100" : "Dalam Rupiah"
              }
              disabled={!welcomeVoucherType}
            />
          </div>

          {/* Voucher Validity Days */}
          <div className="space-y-1.5">
            <label
              htmlFor="welcomeVoucherDays"
              className="text-sm font-medium text-foreground"
            >
              Masa Berlaku (hari)
            </label>
            <Input
              id="welcomeVoucherDays"
              type="number"
              min={1}
              value={welcomeVoucherDays ?? ""}
              onChange={(e) =>
                setWelcomeVoucherDays(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              placeholder="Hari sejak registrasi"
              disabled={!welcomeVoucherType}
            />
          </div>
        </div>
      </Card>

      {/* Google Maps Section */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Google Maps Review Booster</h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          URL Google Maps Place untuk fitur Review Booster. Member akan diarahkan
          ke link ini untuk memberikan review.
        </p>

        <div className="space-y-1.5">
          <label
            htmlFor="googlePlaceUrl"
            className="text-sm font-medium text-foreground"
          >
            Google Maps Place URL
          </label>
          <Input
            id="googlePlaceUrl"
            type="url"
            value={googlePlaceUrl}
            onChange={(e) => setGooglePlaceUrl(e.target.value)}
            placeholder="https://maps.google.com/... atau https://maps.app.goo.gl/..."
            maxLength={2048}
          />
          <p className="text-xs text-muted-foreground">
            Maks. 2048 karakter. Format: https://maps.google.com/...,
            https://www.google.com/maps/..., https://goo.gl/maps/..., atau
            https://maps.app.goo.gl/...
          </p>
        </div>
      </Card>

    </div>
  );
}
