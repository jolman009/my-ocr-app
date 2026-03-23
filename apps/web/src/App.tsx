import { NavLink, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { CapturePage } from "./pages/CapturePage";
import { ExportsPage } from "./pages/ExportsPage";
import { ReceiptDetailPage } from "./pages/ReceiptDetailPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuthPage } from "./pages/AuthPage";
import { useAuthContext } from "./providers/AuthProvider";
import { LandingPage } from "./pages/LandingPage";

const WorkspaceLayout = ({ onLogout }: { onLogout: () => void }) => {
  const navItems = [
    { to: "/app", label: "Home", end: true },
    { to: "/app/capture", label: "Capture" },
    { to: "/app/exports", label: "Exports" },
    { to: "/app/settings", label: "Settings" }
  ];

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <NavLink to="/app" className="flex items-center gap-3">
                <img
                  src="/brand/receipt-radar-icon.svg"
                  alt="Receipt Radar icon"
                  className="h-10 w-10 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                />
                <img
                  src="/brand/receipt-radar-dark.svg"
                  alt="Receipt Radar"
                  className="h-8 w-auto"
                />
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
                Marketing site
              </NavLink>
              <button
                onClick={onLogout}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Log out
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-ink text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
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
        <Route path="capture" element={<CapturePage />} />
        <Route path="exports" element={<ExportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="receipts/:id" element={<ReceiptDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/"} replace />} />
    </Routes>
  );
}
