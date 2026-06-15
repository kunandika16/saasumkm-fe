"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { DiscountType } from "@/types";
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

export interface CreateVoucherInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate: string;
  maxUsage: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

const VOUCHER_CODE_REGEX = /^[a-zA-Z0-9]{1,20}$/;

function validateForm(data: {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  expiryDate: string;
  maxUsage: string;
}): { valid: true; data: CreateVoucherInput } | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Code validation
  if (!data.code.trim()) {
    errors.code = "Kode voucher tidak boleh kosong";
  } else if (data.code.length > 20) {
    errors.code = "Kode voucher maksimal 20 karakter";
  } else if (!VOUCHER_CODE_REGEX.test(data.code)) {
    errors.code = "Kode voucher hanya boleh huruf dan angka (1-20 karakter)";
  }

  // Discount value validation
  const discountValue = parseInt(data.discountValue, 10);
  if (!data.discountValue || isNaN(discountValue)) {
    errors.discountValue = "Nilai diskon harus berupa angka";
  } else if (data.discountType === DiscountType.PERCENTAGE) {
    if (discountValue < 1 || discountValue > 100) {
      errors.discountValue = "Persentase diskon harus antara 1 dan 100";
    }
  } else if (data.discountType === DiscountType.FIXED) {
    if (discountValue < 1000 || discountValue > 10000000) {
      errors.discountValue = "Nilai diskon harus antara Rp 1.000 dan Rp 10.000.000";
    }
  }

  // Expiry date validation
  if (!data.expiryDate) {
    errors.expiryDate = "Tanggal kadaluarsa harus diisi";
  } else {
    const expiry = new Date(data.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry <= today) {
      errors.expiryDate = "Tanggal kadaluarsa harus di masa depan";
    }
  }

  // Max usage validation
  const maxUsage = parseInt(data.maxUsage, 10);
  if (!data.maxUsage || isNaN(maxUsage)) {
    errors.maxUsage = "Maks penggunaan harus berupa angka";
  } else if (maxUsage < 1) {
    errors.maxUsage = "Maks penggunaan minimal 1";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      code: data.code.trim(),
      discountType: data.discountType,
      discountValue,
      expiryDate: data.expiryDate,
      maxUsage,
    },
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface VoucherFormProps {
  onSubmit: (data: CreateVoucherInput) => Promise<void>;
  serverError?: string | null;
}

export default function VoucherForm({ onSubmit, serverError }: VoucherFormProps) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>(
    DiscountType.PERCENTAGE
  );
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = validateForm({
      code,
      discountType,
      discountValue,
      expiryDate,
      maxUsage,
    });

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch {
      // Error handled by parent via serverError prop
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Server Error */}
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {serverError}
        </div>
      )}

      {/* Voucher Code */}
      <div className="space-y-1.5">
        <label htmlFor="voucher-code" className="text-sm font-black text-slate-800">
          Kode Voucher <span className="text-red-500">*</span>
        </label>
        <Input
          id="voucher-code"
          placeholder="Contoh: PROMO50"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={!!errors.code}
          className="h-11 bg-white uppercase"
          maxLength={20}
        />
        {errors.code && (
          <p className="text-xs text-red-500">{errors.code}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Discount Type */}
        <div className="space-y-1.5">
          <label htmlFor="discount-type" className="text-sm font-black text-slate-800">
            Tipe Diskon <span className="text-red-500">*</span>
          </label>
          <Select
            value={discountType}
            onValueChange={(val: string | null) => {
              if (val) setDiscountType(val as DiscountType);
            }}
          >
            <SelectTrigger
              id="discount-type"
              className="h-11 w-full bg-white"
              aria-label="Pilih tipe diskon"
            >
              <SelectValue placeholder="Pilih tipe diskon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DiscountType.PERCENTAGE}>
                Persentase (%)
              </SelectItem>
              <SelectItem value={DiscountType.FIXED}>
                Nominal Tetap (Rp)
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.discountType && (
            <p className="text-xs text-red-500">{errors.discountType}</p>
          )}
        </div>

        {/* Discount Value */}
        <div className="space-y-1.5">
          <label htmlFor="discount-value" className="text-sm font-black text-slate-800">
            Nilai Diskon{" "}
            <span className="font-medium text-slate-400">
              {discountType === DiscountType.PERCENTAGE
                ? "(1 - 100%)"
                : "(Rp)"}
            </span>
          </label>
          <Input
            id="discount-value"
            type="number"
            placeholder={
              discountType === DiscountType.PERCENTAGE ? "50" : "25000"
            }
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            aria-invalid={!!errors.discountValue}
            className="h-11 bg-white"
          />
          {errors.discountValue && (
            <p className="text-xs text-red-500">{errors.discountValue}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Expiry Date */}
        <div className="space-y-1.5">
          <label htmlFor="expiry-date" className="text-sm font-black text-slate-800">
            Tanggal Kadaluarsa <span className="text-red-500">*</span>
          </label>
          <Input
            id="expiry-date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            aria-invalid={!!errors.expiryDate}
            className="h-11 bg-white"
          />
          {errors.expiryDate && (
            <p className="text-xs text-red-500">{errors.expiryDate}</p>
          )}
        </div>

        {/* Max Usage */}
        <div className="space-y-1.5">
          <label htmlFor="max-usage" className="text-sm font-black text-slate-800">
            Maks Penggunaan <span className="text-red-500">*</span>
          </label>
          <Input
            id="max-usage"
            type="number"
            placeholder="100"
            min={1}
            value={maxUsage}
            onChange={(e) => setMaxUsage(e.target.value)}
            aria-invalid={!!errors.maxUsage}
            className="h-11 bg-white"
          />
          {errors.maxUsage && (
            <p className="text-xs text-red-500">{errors.maxUsage}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="-mx-7 -mb-6 flex justify-end border-t border-slate-200 bg-slate-50/90 px-7 py-5">
        <Button type="submit" className="h-11 px-5" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Buat Voucher
        </Button>
      </div>
    </form>
  );
}
