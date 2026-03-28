import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useUploadStore } from "@/stores/upload-store";

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function UploadProgress() {
  const { uploads, removeUpload, clearCompleted } = useUploadStore();

  if (uploads.length === 0) return null;

  const completed = uploads.filter((u) => u.status === "done").length;
  const total = uploads.length;

  return (
    <div className="fixed bottom-16 right-4 left-4 sm:left-auto sm:w-80 bg-card/95 dark:bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-40 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 dark:bg-muted/30 border-b border-border">
        <span className="text-sm font-semibold">
          {completed === total
            ? `${total} upload${total > 1 ? "s" : ""} complete`
            : `Uploading ${completed + 1} of ${total}`}
        </span>
        {completed === total && (
          <button
            onClick={clearCompleted}
            className="text-xs font-medium text-brand hover:opacity-70 transition-opacity"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Upload list */}
      <div className="max-h-48 overflow-y-auto">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0"
          >
            {upload.status === "done" && (
              <span className="animate-scale-in">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              </span>
            )}
            {upload.status === "error" && (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            {(upload.status === "uploading" || upload.status === "queued" || upload.status === "processing") && (
              <Loader2 className="w-4 h-4 text-brand animate-spin shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{upload.filename}</p>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-muted-foreground">{formatSize(upload.size)}</p>
                {upload.status === "uploading" && (
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                {upload.status === "error" && (
                  <p className="text-[11px] text-red-500">{upload.error}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeUpload(upload.id)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
