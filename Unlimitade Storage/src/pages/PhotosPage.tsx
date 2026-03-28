import { useState } from "react";
import { Camera } from "lucide-react";
import { format } from "date-fns";
import { Topbar } from "@/components/layout/topbar";
import { FilePreview } from "@/components/files/file-preview";
import { usePhotos } from "@/hooks/use-files";
import * as db from "@/lib/services/database";
import type { FileItem } from "@/types";

export function PhotosPage() {
  const { photos, mutate } = usePhotos();
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const handleToggleFavorite = async (fileId: string, isFavorite: boolean) => {
    await db.updateFile(fileId, { isFavorite });
    mutate();
  };

  // Group photos by date
  const grouped = photos.reduce<Record<string, FileItem[]>>((acc, photo) => {
    const date = photo.dateTaken || photo.createdAt;
    const key = format(new Date(date), "MMMM d, yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(photo);
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Photos" />

      <div className="flex-1 overflow-y-auto pb-16">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
              <Camera className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <p className="text-lg font-semibold text-foreground/80 mb-1">No photos yet</p>
            <p className="text-sm text-muted-foreground max-w-[240px] text-center">
              Upload images or videos to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-6 p-4 animate-fade-in">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-[13px] font-semibold text-foreground/70 tracking-tight mb-2">
                  {date}
                </h3>
                <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
                  {items.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setPreviewFile(photo)}
                      className="aspect-square bg-muted overflow-hidden relative active:opacity-80 transition-opacity duration-150"
                    >
                      {photo.thumbnailFileId ? (
                        <ThumbnailImage photo={photo} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          {photo.isVideo ? "Video" : "Image"}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          files={photos}
          onClose={() => setPreviewFile(null)}
          onNavigate={setPreviewFile}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}

function ThumbnailImage({ photo }: { photo: FileItem }) {
  const [url, setUrl] = useState<string | null>(null);

  useState(() => {
    import("@/lib/services/settings").then(({ getSettings }) =>
      getSettings().then((s) => {
        if (s?.botToken && photo.thumbnailFileId) {
          import("@/lib/services/telegram").then(({ getFileUrl }) =>
            getFileUrl(photo.thumbnailFileId!, s.botToken).then(setUrl).catch(() => {})
          );
        }
      })
    );
  });

  if (!url) return <div className="w-full h-full bg-muted animate-pulse" />;
  return <img src={url} alt={photo.originalName} className="w-full h-full object-cover" loading="lazy" />;
}
