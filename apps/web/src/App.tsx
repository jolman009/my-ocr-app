import { NavLink, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ReceiptDetailPage } from "./pages/ReceiptDetailPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { AuthPage } from "./pages/AuthPage";
import { useAuthContext } from "./providers/AuthProvider";

export default function App() {
  const { isAuthenticated, isHydrating, logout } = useAuthContext();
  const location = useLocation();

  if (location.pathname === "/privacy") {
    return (
      <div className="min-h-screen bg-mist">
        <PrivacyPolicyPage />
      </div>
    );
  }

  if (isHydrating) {
    return <div className="flex min-h-screen items-center justify-center bg-mist text-ink">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-mist p-6">
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <NavLink to="/" className="font-display text-2xl font-semibold text-ink">
          Receipt Radar
        </NavLink>
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            OCR review workspace
          </div>
          <button 
            onClick={logout}
            className="text-sm font-semibold text-ember hover:opacity-80 transition-opacity"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}