import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadShipmentDocuments,
  BATCH_UPLOAD_LIMIT,
  type BatchUploadResponse
} from "../api/forwardingClient";
import { StatusBadge } from "../components/StatusBadge";
import { confidencePct } from "../lib/format";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,.pdf";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const UploadPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<BatchUploadResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (toUpload: File[]) => uploadShipmentDocuments(toUpload),
    onSuccess: (data) => {
      setResult(data);
      setFiles([]);
      // Freshly-created documents should show up in the list/queue immediately.
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });

  // Merge new selections into the pending list, de-duping by name+size and
  // enforcing the same 25-file cap the backend uses.
  const addFiles = (incoming: FileList | File[]) => {
    setResult(null);
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}:${f.size}`));
      const next = [...prev];
      for (const file of Array.from(incoming)) {
        const key = `${file.name}:${file.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          next.push(file);
        }
      }
      return next.slice(0, BATCH_UPLOAD_LIMIT);
    });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    // Reset so re-selecting the same file fires change again.
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const atLimit = files.length >= BATCH_UPLOAD_LIMIT;
  const hasUnsupported = files.some((f) => !ACCEPTED.includes(f.type));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-mist">Upload documents</h1>
        <p className="text-sm text-muted">
          Drop up to {BATCH_UPLOAD_LIMIT} labels, invoices, or PDFs at once. Each is scanned
          for a tracking number and routed to the review queue if it needs a look.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragging ? "border-ember bg-ember/5" : "border-edge bg-panel/30 hover:border-ember/60"
        }`}
      >
        <span className="text-sm font-semibold text-mist">
          Drag files here or click to browse
        </span>
        <span className="text-xs text-muted">JPG · PNG · WEBP · PDF · 15 MB max each</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {atLimit ? (
        <p className="text-xs font-semibold text-amber-400">
          Batch limit reached ({BATCH_UPLOAD_LIMIT} files). Upload these, then add more.
        </p>
      ) : null}

      {files.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-mist">
              {files.length} file{files.length === 1 ? "" : "s"} ready
            </h2>
            <button
              onClick={() => setFiles([])}
              disabled={mutation.isPending}
              className="text-xs font-semibold text-muted hover:text-mist disabled:opacity-40"
            >
              Clear all
            </button>
          </div>
          <ul className="divide-y divide-edge/60 overflow-hidden rounded-2xl border border-edge">
            {files.map((file, index) => {
              const unsupported = !ACCEPTED.includes(file.type);
              return (
                <li
                  key={`${file.name}:${file.size}`}
                  className="flex items-center justify-between gap-4 bg-panel/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-mist">{file.name}</p>
                    <p className="text-xs text-muted">
                      {formatBytes(file.size)}
                      {unsupported ? (
                        <span className="ml-2 font-semibold text-red-400">unsupported type</span>
                      ) : null}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={mutation.isPending}
                    className="shrink-0 text-xs font-semibold text-muted hover:text-red-400 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          {hasUnsupported ? (
            <p className="text-xs text-amber-400">
              Unsupported files will be reported as failed and skipped.
            </p>
          ) : null}

          <button
            onClick={() => mutation.mutate(files)}
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-amber-400 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/40 border-t-ink" />
                Uploading {files.length}…
              </>
            ) : (
              `Upload ${files.length} file${files.length === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      ) : null}

      {mutation.isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {mutation.error instanceof Error ? mutation.error.message : "Upload failed"}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-edge bg-panel/40 p-4 text-sm">
            <span className="font-semibold text-mist">
              Processed {result.summary.total} file{result.summary.total === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
              {result.summary.succeeded} saved
            </span>
            {result.summary.failed ? (
              <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-bold text-red-400">
                {result.summary.failed} failed
              </span>
            ) : null}
          </div>

          <ul className="divide-y divide-edge/60 overflow-hidden rounded-2xl border border-edge">
            {result.results.map((item) => (
              <li
                key={item.index}
                onClick={() =>
                  item.document ? navigate(`/app/documents/${item.document.id}`) : undefined
                }
                className={`flex items-center justify-between gap-4 bg-panel/30 px-4 py-3 ${
                  item.document ? "cursor-pointer transition hover:bg-panel/60" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-mist">{item.filename}</p>
                  {item.document ? (
                    <p className="text-xs text-muted">
                      {item.document.trackingNumber ?? "No tracking number"}
                      {item.document.carrier ? ` · ${item.document.carrier}` : ""}
                      {item.document.duplicateOfId ? (
                        <span className="ml-2 font-semibold text-red-400">duplicate</span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="text-xs text-red-400">{item.error ?? "Failed"}</p>
                  )}
                </div>
                {item.document ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted">
                      {confidencePct(item.document.confidence)}
                    </span>
                    <StatusBadge status={item.document.status} />
                  </div>
                ) : (
                  <span className="shrink-0 rounded-full border border-red-500/40 px-2.5 py-0.5 text-xs font-bold text-red-400">
                    failed
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
