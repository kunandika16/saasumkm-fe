import { z } from "zod";

/**
 * Cart item quantity validation
 * Req 5.1: quantity must be integer in range [1, 99]
 */
export const CartQuantitySchema = z
  .number()
  .int("Quantity harus bilangan bulat")
  .min(1, "Quantity minimal 1")
  .max(99, "Quantity maksimal 99 per item");

/**
 * Single cart item schema
 */
export const CartItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID wajib diisi"),
  quantity: CartQuantitySchema,
});

export type CartItemInput = z.infer<typeof CartItemSchema>;

/**
 * Checkout request schema
 * Req 5.1: items array with quantity 1-99
 */
export const CheckoutSchema = z.object({
  items: z
    .array(CartItemSchema)
    .min(1, "Minimal 1 item diperlukan untuk checkout"),
  voucherCode: z
    .string()
    .min(1, "Kode voucher tidak boleh kosong")
    .max(20, "Kode voucher maksimal 20 karakter")
    .optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
