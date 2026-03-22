import { useCallback, useState, startTransition } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useUploadReceipt } from "@receipt-ocr/shared/hooks";
import { CameraCapture } from "./CameraCapture";
import { ProcessingState } from "./ProcessingState";

const previewFor = (file: File) => URL.createObjectURL(file);

export const ReceiptUploader = () => {
  const navigate = useNavigate();
  const uploadMutation = useUploadReceipt();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setPreviewUrl(previewFor(file));
      try {
        const response = await uploadMutation.mutateAsync(file);
        startTransition(() => {
          navigate(`/app/receipts/${response.id}`);
        });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      }
    },
    [navigate, uploadMutation]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [file] = acceptedFiles;
      if (file) {
        void handleUpload(file);
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": []
    }
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Input</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Drop a receipt or scan it live</h2>
          </div>
          <div className="rounded-full bg-ember/10 px-4 py-2 text-sm font-medium text-ember">JPEG, PNG, WEBP</div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-[1.75rem] border border-dashed p-8 transition ${
              isDragActive ? "border-ember bg-ember/10" : "border-slate-300 bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Upload</p>
            <h3 className="mt-3 text-2xl font-semibold text-ink">Drag the receipt here</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              The backend will normalize, OCR, and save the result so you can review the extracted header fields.
            </p>
            {previewUrl ? (
              <img src={previewUrl} alt="Receipt preview" className="mt-6 max-h-72 rounded-3xl object-contain shadow-lg" />
            ) : (
              <div className="mt-6 rounded-3xl bg-white p-6 text-sm text-slate-500">Choose a file or drop one here.</div>
            )}
          </div>
          <CameraCapture onCapture={(file) => void handleUpload(file)} />
        </div>
      </section>
      <ProcessingState active={uploadMutation.isPending} error={error} />
    </div>
  );
};
