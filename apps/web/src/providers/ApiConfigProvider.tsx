import { PropsWithChildren, useEffect } from "react";
import { setApiBaseUrl, setRequestTimeoutMs } from "@receipt-ocr/shared/api";

export const ApiConfigProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_URL ?? "http://localhost:4000/api");
    setRequestTimeoutMs(15_000);
  }, []);

  return children;
};
