import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // 5175 keeps the Manifest 956 admin clear of Receipt Radar web (5173/5174).
    port: 5175
  }
});
