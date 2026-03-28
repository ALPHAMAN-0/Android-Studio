import { useState, useEffect } from "react";
import { Star, MoreVertical, Download, Trash2, Edit3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIconDisplay } from "./file-icon";
import { getFileUrl } from "@/lib/services/telegram";
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

interface FileCardProps {
  file: FileItem;
  onToggleFavorite?: (fileId: string, isFavorite: boolean) => void;
  onDelete?: (fileId: string) => void;
  onRename?: (fileId: string, currentName: string) => void;
  onClick?: (file: FileItem) => void;
  style?: React.CSSProperties;
}

export function FileCard({
  file,
  onToggleFavorite,
  onDelete,
  onRename,
  onClick,
  style,
}: FileCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.isImage && file.thumbnailFileId) {
      getSettings().then((s) => {
        if (s?.botToken) {
          getFileUrl(file.thumbnailFileId!, s.botToken).then(setThumbnailUrl).catch(() => {});
        }
      });
    }
  }, [file.thumbnailFileId, file.isImage]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const settings = await getSettings();
    if (!settings?.botToken) return;
    const url = await getFileUrl(file.telegramFileId, settings.botToken);
    window.open(url, "_blank");
  };

  return (
    <div
      className="group relative bg-card border border-border rounded-2xl p-3 shadow-card hover:shadow-card-hover hover:border-brand/30 dark:hover:border-brand/20 transition-all duration-200 cursor-pointer active:scale-[0.98]"
      onClick={() => onClick?.(file)}
      style={style}
    >
      {/* Thumbnail or Icon */}
      <div className="aspect-square rounded-xl bg-muted flex items-center justify-center mb-3 overflow-hidden">
        {file.isImage && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={file.originalName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FileIconDisplay mimeType={file.mimeType} className="w-12 h-12" />
        )}
      </div>

      {/* File info */}
      <div className="space-y-1">
        <p className="text-[13px] font-semibold leading-tight truncate text-foreground">
          {file.originalName}
        </p>
        <p className="text-[11px] text-muted-foreground">{formatSize(file.size)}</p>
      </div>

      {/* Favorite star */}
      <button
        className="absolute top-2 left-2 p-1 rounded-full bg-white/90 dark:bg-black/40 backdrop-blur-md shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite?.(file.id, !file.isFavorite);
        }}
      >
        <Star
          className={`w-4 h-4 ${
            file.isFavorite
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-400"
          }`}
        />
      </button>

      {/* Menu */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="p-1 rounded-full bg-white/90 dark:bg-black/40 backdrop-blur-md shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename?.(file.id, file.originalName);
              }}
            >
              <Edit3 className="w-4 h-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(file.id, !file.isFavorite);
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              {file.isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(file.id);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
