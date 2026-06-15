"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ArrowUpRight,
  Coffee,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { z } from "zod";

import apiClient from "@/lib/api-client";
import { storeTokens } from "@/lib/auth";
import type { ApiError } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const AdminLoginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: AdminLoginInput) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await apiClient.post(
        "/api/auth/admin/login",
        {
          email: data.email,
          password: data.password,
        }
      );

      const { accessToken, refreshToken } = response.data ?? {};

      if (!accessToken || !refreshToken) {
        setServerError("Login gagal. Silakan coba lagi.");
        return;
      }

      storeTokens(accessToken, refreshToken);
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError | undefined;

        if (error.response?.status === 401) {
          setServerError("Email atau password salah.");
        } else {
          setServerError(
            apiError?.message || "Login gagal. Silakan coba lagi."
          );
        }
      } else {
        setServerError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#f8fcff_0%,#eef8ff_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-14 h-64 w-[680px] -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_90px_-42px_rgba(15,23,42,0.55)] ring-1 ring-slate-900/5 lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative hidden overflow-hidden bg-[#061826] p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-[0_18px_40px_-22px_rgba(52,211,153,0.9)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="mt-8 max-w-md">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-200/75">
                NFC Loyalty Platform
              </p>
              <h1 className="mt-4 text-[2.35rem] font-black leading-tight tracking-tight text-white">
                Kelola member, promo, dan order dalam satu dashboard.
              </h1>
              <p className="mt-5 text-sm leading-6 text-slate-300">
                Panel operasional yang dibuat untuk bisnis harian: cepat dibaca,
                mudah dipakai, dan siap membantu pelanggan balik lagi.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { label: "Member", value: "2.4K", icon: Users },
                { label: "Reward", value: "128", icon: Ticket },
                { label: "Orders", value: "840", icon: Coffee },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                    <Icon className="h-5 w-5 text-emerald-300" />
                    <p className="mt-4 text-xl font-black text-white">{item.value}</p>
                    <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mt-8 rounded-[22px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white">Today Snapshot</p>
                <p className="text-xs text-slate-400">Real-time merchant signal</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">
                Live
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Returning customers", value: "68%", color: "bg-emerald-300" },
                { label: "Voucher redemption", value: "42%", color: "bg-sky-300" },
                { label: "Order validation", value: "91%", color: "bg-violet-300" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.label}</span>
                    <span className="font-black text-white">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="flex min-h-[560px] w-full flex-col justify-center border-0 bg-white shadow-none">
          <div className="mx-auto w-full max-w-md px-6 py-10 sm:px-0">
          <CardHeader className="px-0 pt-0">
            <div className="mb-9 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <LogIn className="h-6 w-6" />
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 sm:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Secure admin access
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-950">
              Selamat datang kembali
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Masuk ke dashboard untuk mengelola bisnis Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-bold leading-none text-slate-800"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="h-12 rounded-xl bg-slate-50/80 px-4"
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-bold leading-none text-slate-800"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className="h-12 rounded-xl bg-slate-50/80 px-4 pr-12"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.password.message}
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

            <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-black text-slate-800">Token sesi aman</p>
                  <p className="text-xs font-medium text-slate-500">Akses otomatis diproteksi.</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-emerald-600 shadow-[0_18px_34px_-20px_rgba(5,150,105,0.9)] hover:bg-emerald-700"
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
          </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
