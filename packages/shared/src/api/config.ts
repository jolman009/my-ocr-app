const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

interface ApiRuntimeConfig {
  apiBaseUrl: string;
  authToken: string | null;
  timeoutMs: number;
}

const config: ApiRuntimeConfig = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  authToken: null,
  timeoutMs: 15_000
};

export const setApiBaseUrl = (apiBaseUrl: string) => {
  config.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
};

export const getApiBaseUrl = () => config.apiBaseUrl;

export const setAuthToken = (authToken: string | null) => {
  config.authToken = authToken;
};

export const getAuthToken = () => config.authToken;

export const setRequestTimeoutMs = (timeoutMs: number) => {
  config.timeoutMs = timeoutMs;
};

export const getRequestTimeoutMs = () => config.timeoutMs;

export const getApiOrigin = () => getApiBaseUrl().replace(/\/api$/, "");
