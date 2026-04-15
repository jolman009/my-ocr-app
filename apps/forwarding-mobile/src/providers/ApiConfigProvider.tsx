import { PropsWithChildren, useEffect } from "react";
import { setApiBaseUrl, setRequestTimeoutMs } from "@receipt-ocr/shared/api";

/**
 * Points the shared @receipt-ocr/shared client at the Receipt Radar auth API.
 *
 * The shared client holds ONE global API base URL — Manifest 956 uses it
 * ONLY for login (both apps share JWT_SECRET so tokens verify on either
 * backend). All forwarding-specific calls go through the separate
 * forwardingClient (see ../api/forwardingClient.ts).
 */
export const ApiConfigProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const authApiUrl =
      process.env.EXPO_PUBLIC_AUTH_API_URL ?? "http://10.0.2.2:4000/api";
    setApiBaseUrl(authApiUrl);
    setRequestTimeoutMs(60_000);
  }, []);

  return <>{children}</>;
};
