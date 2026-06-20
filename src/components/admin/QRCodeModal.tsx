"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, RefreshCw, Wifi, WifiOff, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getQRCode, getWhatsAppStatus } from "@/lib/whatsapp-api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

type ModalState = "loading" | "showQR" | "expired" | "error" | "connected";

// ─── Component ───────────────────────────────────────────────────────────────

export default function QRCodeModal({
  isOpen,
  onClose,
  onConnected,
}: QRCodeModalProps) {
  const [state, setState] = useState<ModalState>("loading");
  const [qrCode, setQrCode] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(60);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresAtRef = useRef<string>("");

  // ─── Cleanup intervals ───────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // ─── Start countdown timer ───────────────────────────────────────────────

  const startCountdown = useCallback(
    (expiresAt: string) => {
      // Clear any existing countdown
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }

      const updateCountdown = () => {
        const now = Date.now();
        const expiry = new Date(expiresAt).getTime();
        const remaining = Math.max(0, Math.ceil((expiry - now) / 1000));

        setCountdown(remaining);

        if (remaining <= 0) {
          setState("expired");
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          // Stop polling when expired
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      };

      // Run immediately, then every second
      updateCountdown();
      countdownRef.current = setInterval(updateCountdown, 1000);
    },
    []
  );

  // ─── Start polling for connection status ─────────────────────────────────

  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const status = await getWhatsAppStatus();
        if (status.connected) {
          clearTimers();
          setState("connected");
          onConnected();
        }
      } catch {
        // Silently continue polling on errors
      }
    }, 3000);
  }, [clearTimers, onConnected]);

  // ─── Fetch QR code ───────────────────────────────────────────────────────

  const fetchQRCode = useCallback(async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const response = await getQRCode();
      setQrCode(response.qrCode);
      expiresAtRef.current = response.expiresAt;
      setState("showQR");
      startCountdown(response.expiresAt);
      startPolling();
    } catch (error: unknown) {
      setState("error");
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 503
      ) {
        setErrorMessage("Layanan WhatsApp tidak tersedia");
      } else {
        setErrorMessage("Layanan WhatsApp tidak tersedia. Silakan coba lagi nanti.");
      }
    }
  }, [startCountdown, startPolling]);

  // ─── Effect: Fetch QR when modal opens ───────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      fetchQRCode();
    } else {
      // Reset state when modal closes
      clearTimers();
      setState("loading");
      setQrCode("");
      setCountdown(60);
      setErrorMessage("");
    }

    return () => {
      clearTimers();
    };
  }, [isOpen, fetchQRCode, clearTimers]);

  // ─── Render helpers ──────────────────────────────────────────────────────

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Hubungkan WhatsApp
            </DialogTitle>
            <DialogDescription>
              Scan QR code di bawah menggunakan WhatsApp di HP kamu
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex flex-col items-center gap-4">
            {/* Loading state */}
            {state === "loading" && (
              <div className="flex h-64 w-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm font-medium text-slate-600">
                  Memuat QR code...
                </p>
              </div>
            )}

            {/* QR Code display */}
            {state === "showQR" && (
              <>
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="WhatsApp QR Code"
                    className="h-56 w-56"
                  />
                </div>

                {/* Countdown timer */}
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      countdown > 15 ? "bg-green-500" : "bg-amber-500 animate-pulse"
                    }`}
                  />
                  <span>
                    Berlaku {formatCountdown(countdown)}
                  </span>
                </div>
              </>
            )}

            {/* Expired state */}
            {state === "expired" && (
              <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50">
                <WifiOff className="h-10 w-10 text-slate-400" />
                <p className="text-sm font-bold text-slate-700">
                  QR code kedaluwarsa
                </p>
                <p className="text-center text-xs text-slate-500">
                  QR code telah kedaluwarsa. Klik tombol di bawah untuk mendapatkan QR baru.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={fetchQRCode}
                  className="mt-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh QR
                </Button>
              </div>
            )}

            {/* Error state */}
            {state === "error" && (
              <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50">
                <WifiOff className="h-10 w-10 text-red-400" />
                <p className="text-sm font-bold text-red-700">Koneksi Gagal</p>
                <p className="text-center text-xs text-red-600 px-4">
                  {errorMessage}
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={fetchQRCode}
                  className="mt-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
              </div>
            )}

            {/* Connected state */}
            {state === "connected" && (
              <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-green-100 bg-green-50">
                <Wifi className="h-10 w-10 text-green-500" />
                <p className="text-sm font-bold text-green-700">
                  WhatsApp Terhubung!
                </p>
                <p className="text-center text-xs text-green-600">
                  Sesi WhatsApp berhasil terhubung. Kamu bisa mulai mengirim pesan.
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          {(state === "showQR" || state === "loading") && (
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-700 mb-1.5">
                Cara menghubungkan:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                <li>Buka WhatsApp di HP</li>
                <li>Ketuk Menu (⋮) &gt; Perangkat Tertaut</li>
                <li>Ketuk &ldquo;Tautkan Perangkat&rdquo;</li>
                <li>Arahkan HP ke QR code di atas</li>
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
