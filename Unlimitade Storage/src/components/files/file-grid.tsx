import { FolderOpen } from "lucide-react";
import { FileCard } from "./file-card";
import { FolderCard } from "./folder-card";
import type { FileItem, FolderItem } from "@/types";

interface FileGridProps {
  files: FileItem[];
  folders: FolderItem[];
  onToggleFavorite?: (fileId: string, isFavorite: boolean) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameFile?: (fileId: string, currentName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, currentName: string) => void;
  onFileClick?: (file: FileItem) => void;
}

export function FileGrid({
  files,
  folders,
  onToggleFavorite,
  onDeleteFile,
  onRenameFile,
  onDeleteFolder,
  onRenameFolder,
  onFileClick,
}: FileGridProps) {
  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
          <FolderOpen className="w-10 h-10 text-muted-foreground/60" />
        </div>
        <p className="text-lg font-semibold text-foreground/80 mb-1">No files yet</p>
        <p className="text-sm text-muted-foreground max-w-[240px] text-center">
          Upload files or create folders to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {folders.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-muted-foreground tracking-wide mb-3">
            Folders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map((folder, index) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onRename={onRenameFolder}
                onDelete={onDeleteFolder}
                style={{ animationDelay: `${index * 30}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-muted-foreground tracking-wide mb-3">
            Files
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <FileCard
                key={file.id}
                file={file}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteFile}
                onRename={onRenameFile}
                onClick={onFileClick}
                style={{ animationDelay: `${(folders.length + index) * 30}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
