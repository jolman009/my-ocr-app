import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from "clsx";
const steps = ["Upload", "OCR", "Parse", "Save"];
export const ProcessingState = ({ active, error }) => {
    if (!active && !error) {
        return null;
    }
    return (_jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-panel", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-xs uppercase tracking-[0.3em] text-tide", children: "Processing" }), _jsx("h3", { className: "mt-2 font-display text-xl font-semibold text-ink", children: error ? "Receipt processing failed" : "Extracting receipt data" })] }), _jsx("div", { className: clsx("h-3 w-3 rounded-full", error ? "bg-red-500" : "animate-pulse bg-ember") })] }), _jsx("div", { className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4", children: steps.map((step, index) => (_jsxs("div", { className: "rounded-2xl bg-slate-50 px-3 py-4 text-center", children: [_jsxs("div", { className: "font-mono text-xs text-slate-500", children: ["0", index + 1] }), _jsx("div", { className: "mt-1 text-sm font-medium text-ink", children: step })] }, step))) }), error ? _jsx("p", { className: "mt-4 text-sm text-red-600", children: error }) : null] }));
};
