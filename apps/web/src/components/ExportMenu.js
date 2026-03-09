import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getExportUrl } from "../api/client";
export const ExportMenu = ({ filters }) => {
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-3 rounded-full border border-white/70 bg-white/85 px-4 py-3 shadow-panel", children: [_jsx("span", { className: "font-mono text-xs uppercase tracking-[0.25em] text-slate-500", children: "Export" }), _jsx("a", { href: getExportUrl("csv", filters), className: "rounded-full bg-ink px-4 py-2 text-sm font-medium text-white", children: "CSV" }), _jsx("a", { href: getExportUrl("xlsx", filters), className: "rounded-full bg-ember px-4 py-2 text-sm font-medium text-white", children: "XLSX" })] }));
};
