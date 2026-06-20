"use client";

import { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff } from "lucide-react";

import { getWhatsAppStatus } from "@/lib/whatsapp-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface WhatsAppConnectionStatusProps {
  onConnect: () => void;
  onStatusChange?: (connected: boolean) => void;
}

export function WhatsAppConnectionStatus({
  onConnect,
  onStatusChange,
}: WhatsAppConnectionStatusProps) {
  const [connected, setConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await getWhatsAppStatus();
      setConnected(status.connected);
      setPhoneNumber(status.phoneNumber);
      onStatusChange?.(status.connected);
    } catch {
      // Network error — treat as disconnected
      setConnected(false);
      setPhoneNumber(undefined);
      onStatusChange?.(false);
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 h-9 text-xs font-bold text-slate-500">
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        <span>Checking WhatsApp...</span>
      </div>
    );
  }

  if (connected) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 h-9 text-xs font-bold",
          "border-emerald-100 bg-emerald-50 text-emerald-700"
        )}
        aria-label="WhatsApp Connected"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <Wifi className="h-4 w-4" />
        <span>Connected</span>
        {phoneNumber && (
          <span className="text-emerald-600 font-normal">{phoneNumber}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 h-9 text-xs font-bold",
          "border-rose-100 bg-rose-50 text-rose-700"
        )}
        aria-label="WhatsApp Disconnected"
      >
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        <WifiOff className="h-4 w-4" />
        <span>Disconnected</span>
      </div>
      <Button variant="outline" size="sm" onClick={onConnect}>
        Connect to WhatsApp
      </Button>
    </div>
  );
}
