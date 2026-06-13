"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  AtSign,
  Globe,
  Music,
  ExternalLink,
  Loader2,
  AlertCircle,
  Tag,
  Clock,
} from "lucide-react";

import apiClient from "@/lib/api-client";
import { cn, formatDate, formatIDR } from "@/lib/utils";
import type { Tenant, Voucher, DiscountType } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Social Media Icon Mapping ───────────────────────────────────────────────

function getSocialIcon(platform: string) {
  const key = platform.toLowerCase();
  if (key.includes("instagram")) return AtSign;
  if (key.includes("facebook")) return Globe;
  if (key.includes("tiktok")) return Music;
  return ExternalLink;
}

function getSocialLabel(platform: string): string {
  const key = platform.toLowerCase();
  if (key.includes("instagram")) return "Instagram";
  if (key.includes("facebook")) return "Facebook";
  if (key.includes("tiktok")) return "TikTok";
  if (key.includes("twitter") || key.includes("x")) return "X";
  return platform;
}

// ─── Voucher Discount Display ────────────────────────────────────────────────

function formatDiscount(type: DiscountType, value: number): string {
  if (type === "percentage") {
    return `${value}%`;
  }
  return formatIDR(value);
}

// ─── Landing Page Component ──────────────────────────────────────────────────

export default function LandingPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [promotions, setPromotions] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const [tenantRes, vouchersRes] = await Promise.all([
          apiClient.get<Tenant>("/api/tenant"),
          apiClient.get<Voucher[]>("/api/vouchers/active"),
        ]);

        setTenant(tenantRes.data);
        const vouchersData = vouchersRes.data;
        setPromotions(
          Array.isArray(vouchersData)
            ? vouchersData.slice(0, 10)
            : []
        );
      } catch {
        setError("Gagal memuat informasi bisnis. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // ─── Loading State ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────

  if (error || !tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Terjadi Kesalahan
            </p>
            <p className="text-sm text-muted-foreground">
              {error || "Data tidak ditemukan."}
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="min-h-tap-target min-w-tap-target"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // ─── Social Links (max 5) ────────────────────────────────────────────────

  const socialEntries = tenant.socialLinks
    ? Object.entries(tenant.socialLinks).slice(0, 5)
    : [];

  // ─── Main Content ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Image */}
      {tenant.bannerUrl && (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={tenant.bannerUrl}
            alt={`${tenant.businessName} banner`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Logo + Business Info */}
      <div className="px-4 pb-6">
        {/* Logo */}
        {tenant.logoUrl && (
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-md",
              tenant.bannerUrl ? "-mt-10 relative z-10" : "mt-6"
            )}
          >
            <Image
              src={tenant.logoUrl}
              alt={`${tenant.businessName} logo`}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Business Name */}
        <h1
          className={cn(
            "text-center text-xl font-bold text-foreground",
            tenant.logoUrl ? "mt-3" : "mt-6"
          )}
        >
          {tenant.businessName}
        </h1>

        {/* Description (max 500 chars) */}
        {tenant.description && (
          <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground max-w-prose mx-auto">
            {tenant.description.slice(0, 500)}
          </p>
        )}

        {/* Location Map Link */}
        {tenant.locationMapUrl && (
          <div className="mt-4 flex justify-center">
            <a
              href={tenant.locationMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-tap-target min-w-tap-target items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-muted/80"
              aria-label="Lihat lokasi di Google Maps"
            >
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>Lihat di Google Maps</span>
            </a>
          </div>
        )}

        {/* Social Media Links */}
        {socialEntries.length > 0 && (
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {socialEntries.map(([platform, url]) => {
                const Icon = getSocialIcon(platform);
                const label = getSocialLabel(platform);
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-tap-target min-w-tap-target items-center justify-center rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80"
                    aria-label={`Kunjungi ${label}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Promotions Section */}
      {promotions.length > 0 && (
        <section className="px-4 pb-8" aria-label="Promo aktif">
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Promo Aktif
          </h2>
          <div className="space-y-3">
            {promotions.map((voucher) => (
              <Card key={voucher.id} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary shrink-0" />
                      <CardTitle className="text-sm">
                        Diskon {formatDiscount(voucher.discountType, voucher.discountValue)}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {voucher.code}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Berlaku hingga {formatDate(voucher.expiryDate)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sisa kuota: {voucher.maxUsage - voucher.currentUsage}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
