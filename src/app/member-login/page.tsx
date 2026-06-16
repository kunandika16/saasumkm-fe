"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { LogIn, Phone, UserPlus } from "lucide-react";

import apiClient from "@/lib/api-client";
import { storeTokens } from "@/lib/auth";
import { WhatsAppSchema, type WhatsAppInput } from "@/lib/validators/member";
import type { ApiError, AuthResponse } from "@/types";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AccessMethod = "nfc" | "qr" | "direct";

function hasEnvelopeError(
  data: unknown
): data is { error: { message?: string }; message?: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "object"
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | unknown;

    if (hasEnvelopeError(data)) {
      return data.message ?? data.error.message ?? fallback;
    }

    return (data as ApiError | undefined)?.message ?? fallback;
  }

  return fallback;
}

function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId") || "";
  const accessMethod = (searchParams.get("method") || "direct") as AccessMethod;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WhatsAppInput>({
    resolver: zodResolver(WhatsAppSchema),
    defaultValues: {
      whatsapp: "",
    },
  });

  async function onSubmit(data: WhatsAppInput) {
    if (!tenantId) {
      setServerError(
        "Tenant ID tidak ditemukan. Akses melalui NFC/QR atau link tenant yang valid."
      );
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/login", {
        whatsapp: data.whatsapp,
        tenantId,
      });

      const { accessToken, refreshToken } = response.data ?? {};

      if (!accessToken || !refreshToken) {
        setServerError("Login gagal. Silakan coba lagi.");
        return;
      }

      storeTokens(accessToken, refreshToken);

      try {
        await apiClient.post("/api/visits", { accessMethod });
      } catch {
        // Visit recording is non-blocking.
      }

      router.replace("/home");
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        setServerError("Nomor WhatsApp belum terdaftar. Silakan daftar dulu.");
      } else {
        setServerError(getErrorMessage(error, "Login gagal. Silakan coba lagi."));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const registerHref = `/register?tenantId=${encodeURIComponent(
    tenantId
  )}&method=${encodeURIComponent(accessMethod)}`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Masuk Member</CardTitle>
          <CardDescription>
            Masuk dengan nomor WhatsApp yang sudah terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="whatsapp"
                className="text-sm font-medium leading-none"
              >
                Nomor WhatsApp
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  autoComplete="tel"
                  className="pl-9"
                  aria-invalid={!!errors.whatsapp}
                  aria-describedby={
                    errors.whatsapp ? "whatsapp-error" : undefined
                  }
                  {...register("whatsapp")}
                />
              </div>
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

            {serverError && (
              <div
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-4 border-t border-border pt-4">
            <Link
              href={registerHref}
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Daftar member baru
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MemberLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MemberLoginForm />
    </Suspense>
  );
}
