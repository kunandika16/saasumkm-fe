"use client";

import Barcode from "react-barcode";
import { CheckCircle2, Copy, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { useState } from "react";

interface PaymentBarcodeProps {
  paymentBarcode: string;
  orderId: string;
  finalTotal: number;
}

export function PaymentBarcode({
  paymentBarcode,
  orderId,
  finalTotal,
}: PaymentBarcodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentBarcode ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available, ignore
    }
  };

  const displayOrderId = orderId
    ? orderId.slice(-8).toUpperCase()
    : "--------";

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Pesanan Berhasil Dibuat!
        </h2>
        <p className="text-sm text-muted-foreground">
          Order #{displayOrderId}
        </p>
      </div>

      {/* Barcode card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Payment Barcode
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {/* Barcode rendering */}
          <div className="w-full overflow-x-auto flex justify-center">
            {paymentBarcode ? (
              <Barcode
                value={paymentBarcode}
                format="CODE128"
                width={1.5}
                height={60}
                displayValue={true}
                fontSize={12}
                margin={8}
                background="transparent"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Barcode tidak tersedia</p>
            )}
          </div>

          {/* Total */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Pembayaran</p>
            <p className="text-lg font-bold text-foreground">
              {formatIDR(finalTotal ?? 0)}
            </p>
          </div>

          {/* Copy barcode value */}
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] gap-2"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Tersalin!" : "Salin Kode"}
          </Button>
        </CardContent>
      </Card>

      {/* Payment instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instruksi Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </span>
              <span>
                Tunjukkan barcode ini ke kasir untuk pembayaran secara{" "}
                <strong className="text-foreground">tunai</strong> atau{" "}
                <strong className="text-foreground">transfer</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </span>
              <span>
                Admin akan memverifikasi pembayaran Anda secara manual.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                3
              </span>
              <span>
                Setelah dikonfirmasi, poin akan otomatis ditambahkan ke akun
                Anda.
              </span>
            </li>
          </ol>

          <p className="mt-4 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            ⏳ Pesanan akan otomatis kedaluwarsa jika tidak dibayar dalam 24 jam.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
