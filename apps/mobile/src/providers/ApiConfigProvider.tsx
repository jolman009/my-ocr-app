import { PropsWithChildren, useEffect } from "react";
import Constants from "expo-constants";
import { setApiBaseUrl, setRequestTimeoutMs } from "@receipt-ocr/shared/api";

export const ApiConfigProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const apiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
    setApiBaseUrl(apiUrl ?? "https://receipt-radar-api.onrender.com/api");
    setRequestTimeoutMs(60_000);
  }, []);

  return children;
};
