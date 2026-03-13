import { PropsWithChildren, useEffect } from "react";
import Constants from "expo-constants";
import { setApiBaseUrl, setRequestTimeoutMs } from "@receipt-ocr/shared/api";

export const ApiConfigProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const apiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
    setApiBaseUrl(apiUrl ?? "http://192.168.1.181:4000/api");
    setRequestTimeoutMs(15_000);
  }, []);

  return children;
};
