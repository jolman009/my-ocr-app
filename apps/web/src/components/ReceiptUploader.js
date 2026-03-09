import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState, startTransition } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useUploadReceipt } from "../hooks/useReceipts";
import { CameraCapture } from "./CameraCapture";
import { ProcessingState } from "./ProcessingState";
const previewFor = (file) => URL.createObjectURL(file);
export const ReceiptUploader = () => {
    const navigate = useNavigate();
    const uploadMutation = useUploadReceipt();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const handleUpload = useCallback(async (file) => {
        setError(null);
        setPreviewUrl(previewFor(file));
        try {
            const response = await uploadMutation.mutateAsync(file);
            startTransition(() => {
                navigate(`/receipts/${response.id}`);
            });
        }
        catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
        }
    }, [navigate, uploadMutation]);
    const onDrop = useCallback((acceptedFiles) => {
        const [file] = acceptedFiles;
        if (file) {
            void handleUpload(file);
        }
    }, [handleUpload]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/webp": []
        }
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("section", { className: "rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-xs uppercase tracking-[0.3em] text-tide", children: "Input" }), _jsx("h2", { className: "mt-2 font-display text-3xl font-semibold text-ink", children: "Drop a receipt or scan it live" })] }), _jsx("div", { className: "rounded-full bg-ember/10 px-4 py-2 text-sm font-medium text-ember", children: "JPEG, PNG, WEBP" })] }), _jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]", children: [_jsxs("div", { ...getRootProps(), className: `cursor-pointer rounded-[1.75rem] border border-dashed p-8 transition ${isDragActive ? "border-ember bg-ember/10" : "border-slate-300 bg-slate-50"}`, children: [_jsx("input", { ...getInputProps() }), _jsx("p", { className: "font-mono text-xs uppercase tracking-[0.3em] text-slate-500", children: "Upload" }), _jsx("h3", { className: "mt-3 text-2xl font-semibold text-ink", children: "Drag the receipt here" }), _jsx("p", { className: "mt-3 max-w-md text-sm leading-6 text-slate-600", children: "The backend will auto-rotate, normalize, OCR, and save the result for review." }), previewUrl ? (_jsx("img", { src: previewUrl, alt: "Receipt preview", className: "mt-6 max-h-72 rounded-3xl object-contain shadow-lg" })) : (_jsx("div", { className: "mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500", children: "Choose a file or drop one here." }))] }), _jsx(CameraCapture, { onCapture: (file) => void handleUpload(file) })] })] }), _jsx(ProcessingState, { active: uploadMutation.isPending, error: error })] }));
};
