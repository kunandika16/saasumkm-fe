"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import apiClient from "@/lib/api-client";
import { isAuthenticated } from "@/lib/auth";

type AccessMethod = "nfc" | "qr" | "direct";

export default function TenantEntryPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenantId } = use(params);
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">(
    "loading"
  );

  useEffect(() => {
    const accessMethod: AccessMethod =
      (searchParams.get("method") as AccessMethod) || "direct";

    async function handleEntry() {
      try {
        if (isAuthenticated()) {
          // Record visit for authenticated member
          try {
            await apiClient.post("/api/visits", { accessMethod });
          } catch {
            // Visit recording is non-blocking — continue even if it fails
          }

          setStatus("redirecting");
          router.replace("/home");
        } else {
          // Not authenticated — let existing members log in, with a path to register.
          setStatus("redirecting");
          router.replace(
            `/member-login?tenantId=${encodeURIComponent(tenantId)}&method=${encodeURIComponent(accessMethod)}`
          );
        }
      } catch {
        setStatus("error");
      }
    }

    handleEntry();
  }, [tenantId, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Memverifikasi akses...
            </p>
          </>
        )}

        {status === "redirecting" && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Mengalihkan...</p>
          </>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              Terjadi kesalahan. Silakan coba lagi.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary underline underline-offset-4"
            >
              Muat Ulang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
