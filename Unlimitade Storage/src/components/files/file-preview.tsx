import { useEffect, useCallback, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Download, Star, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileUrl, downloadChunkedFile } from "@/lib/services/telegram";
import { getSettings } from "@/lib/services/settings";
import type { FileItem } from "@/types";

function formatSize(sizeStr: string): string {
  const bytes = parseInt(sizeStr);
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

interface FilePreviewProps {
  file: FileItem;
  files: FileItem[];
  onClose: () => void;
  onNavigate: (file: FileItem) => void;
  onToggleFavorite?: (fileId: string, isFavorite: boolean) => void;
}

export function FilePreview({
  file,
  files,
  onClose,
  onNavigate,
  onToggleFavorite,
}: FilePreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [chunkProgress, setChunkProgress] = useState(0);
  const [chunkBlobUrl, setChunkBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const isChunked = !!(file.chunks && file.chunks.length > 1);
  const currentIndex = files.findIndex((f) => f.id === file.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  // Revoke blob URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [file.id]);

  // Load direct URL for non-chunked files
  useEffect(() => {
    if (isChunked) return;
    setFileUrl(null);
    getSettings().then((s) => {
      if (s?.botToken) {
        getFileUrl(file.telegramFileId, s.botToken).then(setFileUrl).catch(() => {});
      }
    });
  }, [file.telegramFileId, isChunked]);

  // Reset chunk state when file changes
  useEffect(() => {
    setLoadingChunks(false);
    setChunkProgress(0);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setChunkBlobUrl(null);
  }, [file.id]);

  const handleLoadChunked = async () => {
    const settings = await getSettings();
    if (!settings?.botToken || !file.chunks) return;

    setLoadingChunks(true);
    setChunkProgress(0);
    try {
      const blob = await downloadChunkedFile(file.chunks, settings.botToken, setChunkProgress);
      const url = URL.createObjectURL(new Blob([blob], { type: file.mimeType }));
      blobUrlRef.current = url;
      setChunkBlobUrl(url);
    } catch {
      // failed — user can retry
    } finally {
      setLoadingChunks(false);
    }
  };

  const goToPrev = useCallback(() => {
    if (hasPrev) onNavigate(files[currentIndex - 1]);
  }, [hasPrev, currentIndex, files, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) onNavigate(files[currentIndex + 1]);
  }, [hasNext, currentIndex, files, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  const triggerBlobDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleDownload = async () => {
    const settings = await getSettings();
    if (!settings?.botToken) return;

    if (isChunked && file.chunks) {
      if (chunkBlobUrl) {
        triggerBlobDownload(chunkBlobUrl, file.originalName);
      } else {
        setLoadingChunks(true);
        setChunkProgress(0);
        try {
          const blob = await downloadChunkedFile(file.chunks, settings.botToken, setChunkProgress);
          const url = URL.createObjectURL(new Blob([blob], { type: file.mimeType }));
          blobUrlRef.current = url;
          setChunkBlobUrl(url);
          triggerBlobDownload(url, file.originalName);
        } finally {
          setLoadingChunks(false);
        }
      }
    } else {
      // Fetch via blob URL so the token-containing Telegram URL never
      // appears in browser history or DevTools navigation entries
      const telegramUrl = await getFileUrl(file.telegramFileId, settings.botToken);
      const res = await fetch(telegramUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      triggerBlobDownload(url, file.originalName);
      URL.revokeObjectURL(url);
    }
  };

  // Determine what to show in the content area
  const displayUrl = isChunked ? chunkBlobUrl : fileUrl;
  const isVideo = file.isVideo || file.mimeType.startsWith("video/");
  const isImage = file.isImage || file.mimeType.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent safe-area-top">
        <div className="text-white min-w-0">
          <p className="text-base font-semibold truncate">{file.originalName}</p>
          <p className="text-sm text-white/50">
            {formatSize(file.size)}
            {isChunked && (
              <span className="ml-2 text-blue-400">{file.chunks!.length} parts</span>
            )}
            {files.length > 1 && (
              <span className="ml-2">{currentIndex + 1} of {files.length}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/15 rounded-full"
            onClick={() => onToggleFavorite?.(file.id, !file.isFavorite)}
          >
            <Star className={`w-5 h-5 ${file.isFavorite ? "text-yellow-500 fill-yellow-500" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/15 rounded-full"
            onClick={handleDownload}
            disabled={loadingChunks}
          >
            <Download className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/15 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors duration-150"
          onClick={goToPrev}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors duration-150"
          onClick={goToNext}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div className="max-w-[90vw] max-h-[80vh] flex items-center justify-center">
        {isImage && displayUrl ? (
          <img
            src={displayUrl}
            alt={file.originalName}
            className="max-w-full max-h-[80vh] object-contain animate-scale-in rounded-lg"
          />
        ) : isVideo && displayUrl ? (
          <video
            src={displayUrl}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] animate-scale-in rounded-lg"
          />
        ) : loadingChunks ? (
          /* Chunk download progress */
          <div className="text-center text-white animate-fade-in px-8">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-base font-semibold mb-3">Loading file…</p>
            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${chunkProgress}%` }}
              />
            </div>
            <p className="text-sm text-white/50 mt-2">{chunkProgress}%</p>
          </div>
        ) : isChunked && !chunkBlobUrl ? (
          /* Chunked file — not yet loaded */
          <div className="text-center text-white animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Play className="w-9 h-9 text-white ml-1" />
            </div>
            <p className="text-lg font-semibold mb-1">{file.originalName}</p>
            <p className="text-sm text-white/50 mb-6">
              {formatSize(file.size)} · {file.chunks!.length} parts
            </p>
            <Button
              onClick={handleLoadChunked}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6"
            >
              Load &amp; Play
            </Button>
          </div>
        ) : (
          /* Non-previewable file */
          <div className="text-center text-white animate-fade-in">
            <p className="text-lg font-medium mb-4">Preview not available</p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
