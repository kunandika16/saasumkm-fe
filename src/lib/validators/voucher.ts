import { z } from "zod";

/**
 * Voucher code format: 1-20 alphanumeric characters (dashes allowed for legacy codes).
 * Req 6.1: voucher code input validation
 */
const VOUCHER_CODE_REGEX = /^[a-zA-Z0-9\-]{1,20}$/;

/**
 * Voucher code validation schema
 * Req 6.1: validates voucher code format before submission
 */
export const VoucherCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Kode voucher tidak boleh kosong")
    .max(20, "Kode voucher maksimal 20 karakter")
    .regex(VOUCHER_CODE_REGEX, "Kode voucher hanya boleh huruf, angka, atau strip"),
});

export type VoucherCodeInput = z.infer<typeof VoucherCodeSchema>;
