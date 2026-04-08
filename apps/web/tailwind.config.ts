/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        ember: "#f97316",
        tide: "#0f766e",
        fog: "#cbd5e1"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(15, 23, 42, 0.14)"
      },
      fontFamily: {
        display: ["Aptos Display", "Bahnschrift", "sans-serif"],
        body: ["Aptos", "Segoe UI", "sans-serif"],
        mono: ["Cascadia Code", "Consolas", "monospace"]
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(circle at top, rgba(249, 115, 22, 0.18), transparent 38%), linear-gradient(135deg, rgba(15, 118, 110, 0.06), transparent 45%)"
      }
    }
  },
  plugins: []
};