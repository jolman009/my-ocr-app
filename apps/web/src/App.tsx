import { NavLink, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ReceiptDetailPage } from "./pages/ReceiptDetailPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { AuthPage } from "./pages/AuthPage";
import { useAuthContext } from "./providers/AuthProvider";
import { LandingPage } from "./pages/LandingPage";

const WorkspaceLayout = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-mist">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-4">
          <NavLink to="/app" className="font-display text-2xl font-semibold text-ink">
            Receipt Radar
          </NavLink>
          <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm md:block">
            Freelancer receipt workspace
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-ink"
          >
            Home
          </NavLink>
          <button
            onClick={onLogout}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  const { isAuthenticated, isHydrating, logout } = useAuthContext();

  if (isHydrating) {
    return <div className="flex min-h-screen items-center justify-center bg-mist text-ink">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/app" replace /> : <AuthPage />} />
      <Route
        path="/privacy"
        element={
          <div className="min-h-screen bg-mist">
            <PrivacyPolicyPage />
          </div>
        }
      />
      <Route
        path="/app"
        element={isAuthenticated ? <WorkspaceLayout onLogout={logout} /> : <Navigate to="/auth?mode=login" replace />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="receipts/:id" element={<ReceiptDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/"} replace />} />
    </Routes>
  );
}
