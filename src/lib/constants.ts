// ─── API Configuration ───────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Token Storage Keys ──────────────────────────────────────────────────────

export const ACCESS_TOKEN_KEY = "nfc_loyalty_access_token";
export const REFRESH_TOKEN_KEY = "nfc_loyalty_refresh_token";
