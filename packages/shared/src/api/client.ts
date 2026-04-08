import type {
  ExportFormat,
  ExportTemplate,
  ReceiptFilters,
  ReceiptListResponse,
  ReceiptRecord,
  UploadableFile
} from "../types/index";
import {
  getApiBaseUrl,
  getApiOrigin,
  getAuthToken,
  getRequestTimeoutMs
} from "./config.js";

type UnauthorizedHandler = () => void;
const unauthorizedHandlers: UnauthorizedHandler[] = [];

export const onUnauthorized = (handler: UnauthorizedHandler) => {
  unauthorizedHandlers.push(handler);
  return () => {
    const index = unauthorizedHandlers.indexOf(handler);
    if (index !== -1) {
      unauthorizedHandlers.splice(index, 1);
    }
  };
};

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface UploadReceiptResponse {
  id: string;
  status: string;
  receipt: ReceiptRecord;
}

export type UploadReceiptInput = File | Blob | UploadableFile;

const normalizeNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return value;
};

const normalizeString = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const toQueryString = (filters?: ReceiptFilters) => {
  const params = new URLSearchParams();

  if (filters?.page) {
    params.set("page", String(filters.page));
  }
  if (filters?.limit) {
    params.set("limit", String(filters.limit));
  }
  if (filters?.merchant) {
    params.set("merchant", filters.merchant);
  }
  if (filters?.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }
  if (filters?.dateTo) {
    params.set("dateTo", filters.dateTo);
  }
  if (filters?.status) {
    params.set("status", filters.status);
  }

  return params.toString();
};

const toExportQueryString = (format: ExportFormat, filters?: ReceiptFilters, template?: ExportTemplate) => {
  const params = new URLSearchParams(toQueryString(filters));
  params.set("format", format);

  if (template) {
    params.set("template", JSON.stringify(template));
  }

  return params.toString();
};

const withTimeout = async (input: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getRequestTimeoutMs());

  try {
    const token = getAuthToken();
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(input, {
      ...init,
      headers,
      signal: controller.signal
    });

    if (response.status === 401) {
      unauthorizedHandlers.forEach((handler) => handler());
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const readError = async (response: Response) => {
  const fallback = `Request failed with status ${response.status}.`;

  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? fallback;
  } catch {
    return fallback;
  }
};

const appendUpload = (formData: FormData, file: UploadReceiptInput) => {
  if (typeof File !== "undefined" && file instanceof File) {
    formData.append("file", file);
    return;
  }

  if (typeof Blob !== "undefined" && file instanceof Blob) {
    formData.append("file", file, "receipt-upload");
    return;
  }

  formData.append("file", file as unknown as Blob);
};

export const getReceiptImageUrl = (imageUrl: string) =>
  imageUrl.startsWith("http://") || imageUrl.startsWith("https://") ? imageUrl : `${getApiOrigin()}${imageUrl}`;

export const listReceipts = async (filters?: ReceiptFilters): Promise<ReceiptListResponse> => {
  const query = toQueryString(filters);
  const response = await withTimeout(`${getApiBaseUrl()}/receipts${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const getReceipt = async (id: string): Promise<ReceiptRecord> => {
  const response = await withTimeout(`${getApiBaseUrl()}/receipts/${id}`);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const uploadReceipt = async (file: UploadReceiptInput): Promise<UploadReceiptResponse> => {
  const formData = new FormData();
  appendUpload(formData, file);

  const response = await withTimeout(`${getApiBaseUrl()}/receipts`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const updateReceipt = async (receipt: ReceiptRecord): Promise<ReceiptRecord> => {
  const response = await withTimeout(`${getApiBaseUrl()}/receipts/${receipt.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      merchantName: normalizeString(receipt.merchantName),
      receiptDate: normalizeString(receipt.receiptDate),
      address: normalizeString(receipt.address),
      subtotal: normalizeNumber(receipt.subtotal),
      tax: normalizeNumber(receipt.tax),
      tip: normalizeNumber(receipt.tip),
      total: normalizeNumber(receipt.total),
      currency: normalizeString(receipt.currency),
      rawText: receipt.rawText,
      confidence: receipt.confidence,
      items: receipt.items.map((item) => ({
        name: item.name.trim(),
        quantity: normalizeNumber(item.quantity),
        unitPrice: normalizeNumber(item.unitPrice),
        totalPrice: normalizeNumber(item.totalPrice) ?? 0
      }))
    })
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const getExportUrl = (format: "csv" | "xlsx", filters?: ReceiptFilters) => {
  const query = toQueryString(filters);
  return `${getApiBaseUrl()}/exports/receipts.${format}${query ? `?${query}` : ""}`;
};

const getDownloadFilename = (response: Response, fallback: string) => {
  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? fallback;
};

export const getTemplatedExportUrl = (format: ExportFormat, filters?: ReceiptFilters, template?: ExportTemplate) => {
  const query = toExportQueryString(format, filters, template);
  return `${getApiBaseUrl()}/exports/receipts.${format}${query ? `?${query}` : ""}`;
};

export const downloadExport = async (
  format: ExportFormat,
  filters?: ReceiptFilters,
  template?: ExportTemplate
): Promise<{ filename: string }> => {
  const response = await withTimeout(getTemplatedExportUrl(format, filters, template));

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const blob = await response.blob();
  const filename = getDownloadFilename(response, `receipts.${format}`);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);

  return { filename };
};

export const register = async (input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> => {
  const response = await withTimeout(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const login = async (input: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await withTimeout(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const response = await withTimeout(`${getApiBaseUrl()}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ idToken })
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const changePassword = async (input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await withTimeout(`${getApiBaseUrl()}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const forgotPassword = async (input: {
  email: string;
}): Promise<{ message: string }> => {
  const response = await withTimeout(`${getApiBaseUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};

export const resetPassword = async (input: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await withTimeout(`${getApiBaseUrl()}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
};
