import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuthContext } from "./providers/AuthProvider";
import { LoginPage } from "./pages/LoginPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ReviewQueuePage } from "./pages/ReviewQueuePage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { UploadPage } from "./pages/UploadPage";

const WorkspaceLayout = ({
  onLogout,
  email
}: {
  onLogout: () => void;
  email: string | null;
}) => {
  const navItems = [
    { to: "/app", label: "Documents", end: true },
    { to: "/app/upload", label: "Upload" },
    { to: "/app/review", label: "Review queue" }
  ];

  return (
    <div className="min-h-screen bg-ink text-mist">
      <header className="border-b border-edge/70 bg-panel/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl font-bold tracking-tight text-mist">
                Manifest 956
              </span>
              <span className="hidden rounded-full border border-edge bg-panel px-3 py-1 text-xs font-semibold text-muted md:block">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {email ? <span className="hidden text-muted sm:block">{email}</span> : null}
              <button
                onClick={onLogout}
                className="rounded-full bg-edge px-4 py-2 text-sm font-semibold text-mist transition hover:bg-slate-600"
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
                      ? "bg-ember text-ink"
                      : "border border-edge bg-panel text-muted hover:text-mist"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  const { isAuthenticated, isHydrating, logout, user } = useAuthContext();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink text-mist">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-edge border-t-ember" />
        <p className="mt-4 text-sm font-medium text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />}
      />
      <Route
        path="/app"
        element={
          isAuthenticated ? (
            <WorkspaceLayout onLogout={logout} email={user?.email ?? null} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DocumentsPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="review" element={<ReviewQueuePage />} />
        <Route path="documents/:id" element={<DocumentDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/login"} replace />} />
    </Routes>
  );
}
