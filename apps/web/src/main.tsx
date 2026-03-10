import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { setApiBaseUrl } from "@receipt-ocr/shared/api";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();
setApiBaseUrl(import.meta.env.VITE_API_URL ?? "http://localhost:4000/api");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
