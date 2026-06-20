import apiClient from "@/lib/api-client";

// ─── Response Interfaces ─────────────────────────────────────────────────────

export interface WhatsAppStatusResponse {
  connected: boolean;
  phoneNumber?: string;
  connectedAt?: string;
}

export interface QRCodeResponse {
  qrCode: string; // Base64-encoded QR image
  expiresAt: string; // ISO timestamp
}

export interface TemplateResponse {
  category: string;
  template: string;
}

export interface RecipientsCountResponse {
  count: number;
  sampleRecipient?: { name: string; whatsapp: string };
}

export interface BlastRequest {
  category: "reminder" | "promo" | "announcement" | "custom";
  inactivityPeriod?: "1week" | "1month" | "3months";
  message: string;
}

export interface BlastResponse {
  jobId: string;
  status: string;
  totalRecipients: number;
}

export interface BlastJobStatusResponse {
  jobId: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  completedAt?: string;
  failedRecipients?: Array<{ name: string; whatsapp: string; reason: string }>;
}

export interface SendSingleRequest {
  memberId: string;
  category: string;
  message: string;
}

export interface SendSingleResponse {
  success: boolean;
  error?: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function getWhatsAppStatus(): Promise<WhatsAppStatusResponse> {
  const { data } = await apiClient.get<WhatsAppStatusResponse>(
    "/api/admin/whatsapp/status"
  );
  return data;
}

export async function getQRCode(): Promise<QRCodeResponse> {
  const { data } = await apiClient.get<QRCodeResponse>(
    "/api/admin/whatsapp/qr"
  );
  return data;
}

export async function disconnectWhatsApp(): Promise<{ success: boolean }> {
  const { data } = await apiClient.post<{ success: boolean }>(
    "/api/admin/whatsapp/disconnect"
  );
  return data;
}

export async function getTemplates(category: string): Promise<TemplateResponse> {
  const { data } = await apiClient.get<TemplateResponse>(
    `/api/admin/whatsapp/templates/${category}`
  );
  return data;
}

export async function getRecipientCount(
  category: string,
  inactivityPeriod?: string
): Promise<RecipientsCountResponse> {
  const params: Record<string, string> = { category };
  if (inactivityPeriod) {
    params.inactivityPeriod = inactivityPeriod;
  }
  const { data } = await apiClient.get<RecipientsCountResponse>(
    "/api/admin/whatsapp/recipients",
    { params }
  );
  return data;
}

export async function createBlast(body: BlastRequest): Promise<BlastResponse> {
  const { data } = await apiClient.post<BlastResponse>(
    "/api/admin/whatsapp/blast",
    body
  );
  return data;
}

export async function getBlastStatus(
  jobId: string
): Promise<BlastJobStatusResponse> {
  const { data } = await apiClient.get<BlastJobStatusResponse>(
    `/api/admin/whatsapp/blast/${jobId}/status`
  );
  return data;
}

export async function sendSingle(
  body: SendSingleRequest
): Promise<SendSingleResponse> {
  const { data } = await apiClient.post<SendSingleResponse>(
    "/api/admin/whatsapp/send-single",
    body
  );
  return data;
}
