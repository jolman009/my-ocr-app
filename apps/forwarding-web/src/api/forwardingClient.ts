import { getAuthToken } from "@receipt-ocr/shared/api";

/**
 * Thin fetch helper for the Manifest 956 forwarding-api endpoints.
 *
 * Mirrors apps/forwarding-mobile/src/api/forwardingClient.ts: a SEPARATE base
 * URL from the shared client (which points at receipt-radar-api for login),
 * sharing the auth token written by AuthProvider via setAuthToken().
 */

const BASE_URL =
  import.meta.env.VITE_FORWARDING_API_URL ?? "http://localhost:4001/forwarding";
const TIMEOUT_MS = 30_000;

export type ShipmentDocumentStatus = "processed" | "needs_review" | "failed";
export type DocumentType = "label" | "invoice" | "packing_slip" | "customs" | "unknown";

export interface ShipmentDocumentRecord {
  id: string;
  organizationId: string;
  uploadedById: string | null;
  imageUrl: string;
  trackingNumber: string | null;
  carrier: string | null;
  barcodeRaw: string | null;
  barcodeFormat: string | null;
  ocrRawText: string | null;
  documentType: DocumentType | null;
  recipientName: string | null;
  mailboxNumber: string | null;
  matchedCustomerId: string | null;
  customerMatchConfidence: number | null;
  confidence: number | null;
  status: ShipmentDocumentStatus;
  duplicateOfId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentDocumentListResponse {
  data: ShipmentDocumentRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface FieldCorrectionRecord {
  id: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  userId: string | null;
  createdAt: string;
}

export interface CustomerAccountRecord {
  id: string;
  name: string;
  mailboxNumber: string;
  active: boolean;
}

export interface OrganizationResponse {
  organization: { id: string; name: string; slug: string };
  role: string;
}

export interface ShipmentDocumentPatch {
  trackingNumber?: string | null;
  carrier?: string | null;
  recipientName?: string | null;
  mailboxNumber?: string | null;
  documentType?: DocumentType | null;
  matchedCustomerId?: string | null;
  status?: ShipmentDocumentStatus;
}

export class ForwardingApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ForwardingApiError";
  }
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message =
        (body && typeof body === "object" && "message" in body
          ? (body as { message: string }).message
          : null) ?? `Request failed: ${response.status}`;
      throw new ForwardingApiError(response.status, message);
    }

    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getMyOrganization = (): Promise<OrganizationResponse> =>
  request<OrganizationResponse>("/organizations/me");

export interface ListDocumentsParams {
  q?: string;
  status?: ShipmentDocumentStatus;
  type?: DocumentType;
  customerId?: string;
  page?: number;
  limit?: number;
}

export const listShipmentDocuments = (
  params: ListDocumentsParams = {}
): Promise<ShipmentDocumentListResponse> => {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);
  if (params.customerId) search.set("customerId", params.customerId);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return request<ShipmentDocumentListResponse>(`/documents${qs ? `?${qs}` : ""}`);
};

export const getShipmentDocument = (
  id: string
): Promise<{ document: ShipmentDocumentRecord }> => request(`/documents/${id}`);

export const updateShipmentDocument = (
  id: string,
  patch: ShipmentDocumentPatch
): Promise<{ document: ShipmentDocumentRecord }> =>
  request(`/documents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });

export const getDocumentCorrections = (
  id: string
): Promise<{ corrections: FieldCorrectionRecord[] }> =>
  request(`/documents/${id}/corrections`);

export const listCustomers = (): Promise<{ data: CustomerAccountRecord[] }> =>
  request("/customers");

export const getDocumentImageUrl = (imageUrl: string) =>
  imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
    ? imageUrl
    : `${BASE_URL.replace(/\/forwarding$/, "")}${imageUrl}`;
