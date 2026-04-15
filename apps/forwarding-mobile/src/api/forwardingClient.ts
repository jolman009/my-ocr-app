import { getAuthToken } from "@receipt-ocr/shared/api";

/**
 * Thin fetch helper for the Manifest 956 forwarding-api endpoints.
 *
 * Uses a SEPARATE base URL from the shared @receipt-ocr/shared/api client
 * (which points at receipt-radar-api for login only). Both share the auth
 * token — AuthProvider writes the token into the shared client's global
 * config after login; we read it back via getAuthToken() here.
 *
 * Keeping this tiny and app-local instead of extending @receipt-ocr/shared
 * so Receipt Radar doesn't grow dependencies on forwarding-center types.
 */

const BASE_URL =
  process.env.EXPO_PUBLIC_FORWARDING_API_URL ?? "http://10.0.2.2:4001/forwarding";
const TIMEOUT_MS = 60_000;

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationResponse {
  organization: OrganizationRecord;
  role: string;
}

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
  confidence: number | null;
  status: "processed" | "needs_review" | "failed";
  createdAt: string;
  updatedAt: string;
}

interface ShipmentDocumentListResponse {
  data: ShipmentDocumentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ForwardingApiError extends Error {
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
      const message = (body && typeof body === "object" && "message" in body
        ? (body as { message: string }).message
        : null) ?? `Request failed: ${response.status}`;
      throw new ForwardingApiError(response.status, message);
    }

    return body as T;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const bootstrapOrganization = (): Promise<OrganizationResponse> =>
  request<OrganizationResponse>("/organizations/bootstrap", { method: "POST" });

export const getMyOrganization = (): Promise<OrganizationResponse> =>
  request<OrganizationResponse>("/organizations/me");

export const listShipmentDocuments = (params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<ShipmentDocumentListResponse> => {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return request<ShipmentDocumentListResponse>(`/documents${qs ? `?${qs}` : ""}`);
};

export const getShipmentDocument = (
  id: string
): Promise<{ document: ShipmentDocumentRecord }> =>
  request(`/documents/${id}`);

export const getForwardingApiBaseUrl = () => BASE_URL;
