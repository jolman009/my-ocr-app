import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import Webcam from "react-webcam";
const dataUrlToFile = async (dataUrl) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], `receipt-${Date.now()}.png`, { type: "image/png" });
};
export const CameraCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const handleCapture = async () => {
        const screenshot = webcamRef.current?.getScreenshot();
        if (!screenshot) {
            return;
        }
        const file = await dataUrlToFile(screenshot);
        onCapture(file);
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "overflow-hidden rounded-3xl border border-slate-200 bg-slate-950", children: _jsx(Webcam, { ref: webcamRef, mirrored: false, screenshotFormat: "image/png", className: "aspect-[4/3] w-full object-cover", videoConstraints: { facingMode: "environment" } }) }), _jsx("button", { type: "button", onClick: handleCapture, className: "w-full rounded-2xl bg-tide px-4 py-3 font-medium text-white transition hover:bg-teal-800", children: "Capture receipt photo" })] }));
};
