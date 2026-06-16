"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Gift, CheckCircle } from "lucide-react";

import apiClient from "@/lib/api-client";
import { storeTokens } from "@/lib/auth";
import { RegisterSchema, type RegisterInput } from "@/lib/validators/member";
import { formatIDR } from "@/lib/utils";
import type { ApiError, Voucher, TenantSettings } from "@/types";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { GoogleReviewCTA } from "@/components/member/GoogleReviewCTA";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId") || "";
  const accessMethod = searchParams.get("method") || "direct";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [welcomeVoucher, setWelcomeVoucher] = useState<Voucher | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [googlePlaceUrl, setGooglePlaceUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    if (!tenantId) {
      setServerError("Tenant ID tidak ditemukan. Akses melalui NFC/QR atau link tenant yang valid.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await apiClient.post(
        "/api/auth/register",
        {
          name: data.name,
          whatsapp: data.whatsapp,
          tenantId,
          accessMethod: accessMethod as "nfc" | "qr" | "direct",
        }
      );

      const { accessToken, refreshToken, welcomeVoucher: voucher } = response.data ?? {};

      if (!accessToken || !refreshToken) {
        setServerError("Registrasi gagal. Silakan coba lagi.");
        return;
      }

      // Store authentication tokens
      storeTokens(accessToken, refreshToken);

      // Record visit event after successful registration
      try {
        await apiClient.post("/api/visits", {
          accessMethod: accessMethod as "nfc" | "qr" | "direct",
        });
      } catch {
        // Visit recording is non-blocking
      }

      // Show welcome voucher if returned, then redirect
      if (voucher) {
        setWelcomeVoucher(voucher);
        setRegistrationSuccess(true);

        // Fetch tenant settings to get Google Place URL for review CTA
        try {
          const settingsRes = await apiClient.get<TenantSettings>("/api/admin/settings");
          setGooglePlaceUrl(settingsRes.data?.googlePlaceUrl ?? null);
        } catch {
          // Non-blocking — CTA simply won't show if fetch fails
        }
      } else {
        router.replace("/home");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError | undefined;

        if (error.response?.status === 409) {
          setServerError(
            apiError?.message ||
              "Nomor WhatsApp sudah terdaftar. Silakan login."
          );
        } else {
          setServerError(
            apiError?.message ||
              "Registrasi gagal. Silakan coba lagi."
          );
        }
      } else {
        setServerError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleContinueToHome() {
    router.replace("/home");
  }

  const loginHref = `/member-login?tenantId=${encodeURIComponent(
    tenantId
  )}&method=${encodeURIComponent(accessMethod)}`;

  // Success state — show welcome voucher
  if (registrationSuccess && welcomeVoucher) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle>Registrasi Berhasil!</CardTitle>
            <CardDescription>
              Selamat datang sebagai member baru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Voucher Selamat Datang
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">
                  {welcomeVoucher.discountType === "percentage"
                    ? `Diskon ${welcomeVoucher.discountValue}%`
                    : `Diskon ${formatIDR(welcomeVoucher.discountValue)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Kode: <span className="font-mono font-medium">{welcomeVoucher.code}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Berlaku hingga:{" "}
                  {new Date(welcomeVoucher.expiryDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Google Review CTA — Requirement 11.1, 11.6 */}
            <GoogleReviewCTA googlePlaceUrl={googlePlaceUrl} />

            <Button
              onClick={handleContinueToHome}
              className="w-full"
              size="lg"
            >
              Lanjutkan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Daftar Member</CardTitle>
          <CardDescription>
            Daftarkan diri Anda untuk mulai mengumpulkan poin dan menikmati
            promo eksklusif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name field */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none"
              >
                Nama Lengkap
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* WhatsApp field */}
            <div className="space-y-1.5">
              <label
                htmlFor="whatsapp"
                className="text-sm font-medium leading-none"
              >
                Nomor WhatsApp
              </label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
                aria-invalid={!!errors.whatsapp}
                aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
                {...register("whatsapp")}
              />
              {errors.whatsapp && (
                <p
                  id="whatsapp-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.whatsapp.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {serverError}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Mendaftar...
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </Button>
          </form>
          <div className="mt-4 border-t border-border pt-4">
            <Link
              href={loginHref}
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
              })}
            >
              Sudah terdaftar? Masuk
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
