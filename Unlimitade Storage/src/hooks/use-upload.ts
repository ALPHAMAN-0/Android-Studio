import { useCallback } from "react";
import { toast } from "sonner";
import { useUploadStore } from "@/stores/upload-store";
import * as telegram from "@/lib/services/telegram";
import * as db from "@/lib/services/database";
import { generateThumbnail, getImageDimensions } from "@/lib/services/thumbnails";
import { getSettings } from "@/lib/services/settings";
import type { FileChunk } from "@/types";

const CHUNK_SIZE = 19 * 1024 * 1024; // 19MB per chunk — stays under Telegram's 20MB limit
const MAX_BATCH_SIZE = 20;

// On Android, File objects from content:// URIs often report size=0 until the
// data is actually read. This resolves the file into a proper Blob with real data.
function readFileAsBlob(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      const resolved = new File([buf], file.name, {
        type: file.type || "application/octet-stream",
        lastModified: file.lastModified,
      });
      resolve(resolved);
    };
    reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

function splitIntoChunks(file: File): Blob[] {
  const chunks: Blob[] = [];
  let offset = 0;
  while (offset < file.size) {
    chunks.push(file.slice(offset, offset + CHUNK_SIZE));
    offset += CHUNK_SIZE;
  }
  return chunks;
}

export function useUpload(folderId?: string | null, onComplete?: () => void) {
  const { addUpload, updateUpload } = useUploadStore();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      // Convert to array immediately before any async work —
      // on Android WebView, clearing the file input invalidates the FileList reference
      const fileArray = Array.from(files);

      const settings = await getSettings();
      if (!settings?.botToken || !settings?.channelId) {
        toast.error("Bot token not configured");
        return;
      }

      if (fileArray.length > MAX_BATCH_SIZE) {
        toast.error(`Maximum ${MAX_BATCH_SIZE} files per batch`);
        return;
      }

      // Resolve file data upfront — on Android, content:// URI files report size=0
      // until actually read, which would otherwise cause false "empty file" errors
      const resolvedFiles = await Promise.all(
        fileArray.map((f) => readFileAsBlob(f).catch(() => null))
      );

      const validFiles: File[] = [];
      for (const file of resolvedFiles) {
        if (!file) continue;
        if (file.size === 0) {
          toast.error(`${file.name} is empty`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      for (const file of validFiles) {
        const uploadId = addUpload(file);

        try {
          updateUpload(uploadId, { status: "uploading" });

          const isChunked = file.size > CHUNK_SIZE;

          if (isChunked) {
            // --- Chunked upload for large files ---
            const chunkBlobs = splitIntoChunks(file);
            const chunkResults: FileChunk[] = [];

            for (let i = 0; i < chunkBlobs.length; i++) {
              const result = await telegram.uploadChunk(
                chunkBlobs[i],
                file.name,
                i,
                chunkBlobs.length,
                settings.botToken,
                settings.channelId,
                (chunkProgress) => {
                  const overall = Math.round(((i + chunkProgress / 100) / chunkBlobs.length) * 100);
                  updateUpload(uploadId, { progress: overall });
                }
              );
              chunkResults.push(result);
            }

            updateUpload(uploadId, { status: "processing" });

            await db.createFile({
              originalName: file.name,
              mimeType: file.type || "application/octet-stream",
              size: file.size,
              telegramFileId: chunkResults[0].telegramFileId,
              telegramMessageId: chunkResults[0].telegramMessageId,
              isImage: false,
              isVideo: false,
              folderId: folderId || null,
              chunks: chunkResults,
            });

          } else {
            // --- Normal single upload ---
            const result = await telegram.uploadFile(
              file,
              settings.botToken,
              settings.channelId,
              (progress) => updateUpload(uploadId, { progress })
            );

            updateUpload(uploadId, { status: "processing" });

            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");
            let thumbnailFileId: string | null = null;
            let thumbnailMessageId: number | null = null;
            let dimensions: { width: number; height: number } | null = null;

            if (isImage) {
              dimensions = await getImageDimensions(file);
              const thumbBlob = await generateThumbnail(file);
              if (thumbBlob) {
                const thumbResult = await telegram.uploadThumbnail(
                  thumbBlob,
                  file.name,
                  settings.botToken,
                  settings.channelId
                );
                if (thumbResult) {
                  thumbnailFileId = thumbResult.fileId;
                  thumbnailMessageId = thumbResult.messageId;
                }
              }
            }

            await db.createFile({
              originalName: file.name,
              mimeType: file.type || "application/octet-stream",
              size: file.size,
              telegramFileId: result.telegramFileId,
              telegramMessageId: result.telegramMessageId,
              thumbnailFileId,
              thumbnailMessageId,
              isImage,
              isVideo,
              width: dimensions?.width,
              height: dimensions?.height,
              folderId: folderId || null,
              chunks: null,
            });
          }

          updateUpload(uploadId, { status: "done", progress: 100 });
        } catch (error) {
          updateUpload(uploadId, {
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          });
        }
      }

      onComplete?.();
    },
    [folderId, addUpload, updateUpload, onComplete]
  );

  return { uploadFiles };
}
