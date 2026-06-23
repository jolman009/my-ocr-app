import { PropsWithChildren, useEffect } from "react";
import { setApiBaseUrl, setRequestTimeoutMs } from "@receipt-ocr/shared/api";

/**
 * The shared client is used ONLY for login (it talks to receipt-radar-api,
 * which issues the JWT both products share). All forwarding data goes through
 * the app-local forwardingClient instead — see api/forwardingClient.ts.
 */
export const ApiConfigProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:4000/api");
    setRequestTimeoutMs(15_000);
  }, []);

  return children;
};
