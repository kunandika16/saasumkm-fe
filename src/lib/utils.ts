import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale/id"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a non-negative integer as Indonesian Rupiah.
 * Example: 25000 → "Rp 25.000"
 */
export function formatIDR(amount: number): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0
  const formatted = Math.floor(safeAmount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `Rp ${formatted}`
}

/**
 * Format an ISO date string to a readable date.
 * Example: "2024-01-12T10:00:00Z" → "12 Jan 2024"
 */
export function formatDate(isoString: string): string {
  if (!isoString) return "-"
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return "-"
  return format(date, "dd MMM yyyy", { locale: id })
}

/**
 * Format an ISO date string to relative time.
 * Example: "2024-01-12T10:00:00Z" → "2 jam yang lalu"
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return "-"
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return "-"
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: id,
  })
}
