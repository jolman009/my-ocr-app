import { useRef } from "react";
import Webcam from "react-webcam";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const dataUrlToFile = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], `receipt-${Date.now()}.png`, { type: "image/png" });
};

export const CameraCapture = ({ onCapture }: CameraCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = async () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      return;
    }

    const file = await dataUrlToFile(screenshot);
    onCapture(file);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
        <Webcam
          ref={webcamRef}
          mirrored={false}
          screenshotFormat="image/png"
          className="aspect-[4/3] w-full object-cover"
          videoConstraints={{ facingMode: "environment" }}
        />
      </div>
      <button
        type="button"
        onClick={handleCapture}
        className="w-full rounded-2xl bg-tide px-4 py-3 font-medium text-white transition hover:bg-teal-800"
      >
        Capture receipt photo
      </button>
    </div>
  );
};