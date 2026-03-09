import { NavLink, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ReceiptDetailPage } from "./pages/ReceiptDetailPage";

export default function App() {
  return (
    <div className="min-h-screen bg-grid-fade">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <NavLink to="/" className="font-display text-2xl font-semibold text-ink">
          Receipt Radar
        </NavLink>
        <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-panel">
          OCR review workspace
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}