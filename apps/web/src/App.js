import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ReceiptDetailPage } from "./pages/ReceiptDetailPage";
export default function App() {
    return (_jsxs("div", { className: "min-h-screen bg-grid-fade", children: [_jsxs("header", { className: "mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10", children: [_jsx(NavLink, { to: "/", className: "font-display text-2xl font-semibold text-ink", children: "Receipt Radar" }), _jsx("div", { className: "rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-panel", children: "OCR review workspace" })] }), _jsx("main", { className: "mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/receipts/:id", element: _jsx(ReceiptDetailPage, {}) })] }) })] }));
}
