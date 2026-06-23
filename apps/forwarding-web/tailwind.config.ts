/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Manifest 956 palette — mirrors the forwarding-mobile dark UI.
        ink: "#0f172a",
        panel: "#1e293b",
        edge: "#334155",
        ember: "#f97316",
        mist: "#f8fafc",
        muted: "#94a3b8"
      },
      fontFamily: {
        display: ["Aptos Display", "Bahnschrift", "sans-serif"],
        body: ["Aptos", "Segoe UI", "sans-serif"],
        mono: ["Cascadia Code", "Consolas", "monospace"]
      }
    }
  },
  plugins: []
};
