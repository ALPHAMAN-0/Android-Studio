import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { FloatingAddButton } from "@/components/layout/floating-add-button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FileGrid } from "@/components/files/file-grid";
import { FilePreview } from "@/components/files/file-preview";
import { useFiles } from "@/hooks/use-files";
import { useUpload } from "@/hooks/use-upload";
import * as db from "@/lib/services/database";
import { deleteMessage } from "@/lib/services/telegram";
import { getSettings } from "@/lib/services/settings";
import { sanitizeName } from "@/lib/utils";
import type { FileItem } from "@/types";

export function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const { files, folders, mutate } = useFiles(folderId);
  const { uploadFiles } = useUpload(folderId, mutate);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const folderPath = folderId ? db.getFolderPath(folderId) : [];

  const handleToggleFavorite = async (fileId: string, isFavorite: boolean) => {
    await db.updateFile(fileId, { isFavorite });
    mutate();
  };

  const handleDeleteFile = async (fileId: string) => {
    const file = await db.deleteFile(fileId);
    if (file) {
      const settings = await getSettings();
      if (settings?.botToken && settings?.channelId) {
        deleteMessage(file.telegramMessageId, settings.botToken, settings.channelId).catch(() => {});
      }
      toast.success("File deleted");
    }
    mutate();
  };

  const handleRenameFile = async (fileId: string, currentName: string) => {
    const raw = prompt("Rename file:", currentName);
    const newName = raw ? sanitizeName(raw) : null;
    if (!newName) { if (raw !== null) toast.error("Invalid file name"); return; }
    if (newName !== currentName) {
      await db.updateFile(fileId, { originalName: newName });
      mutate();
    }
  };

  const handleCreateFolder = async () => {
    const raw = prompt("Folder name:");
    const name = raw ? sanitizeName(raw) : null;
    if (!name) { if (raw !== null) toast.error("Invalid folder name"); return; }
    await db.createFolder(name, folderId);
    mutate();
  };

  const handleDeleteFolder = async (id: string) => {
    if (confirm("Delete this folder? Files inside will be moved to root.")) {
      await db.deleteFolder(id);
      mutate();
    }
  };

  const handleRenameFolder = async (id: string, currentName: string) => {
    const raw = prompt("Rename folder:", currentName);
    const newName = raw ? sanitizeName(raw) : null;
    if (!newName) { if (raw !== null) toast.error("Invalid folder name"); return; }
    if (newName !== currentName) {
      await db.updateFolder(id, newName);
      mutate();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar
        onCreateFolder={handleCreateFolder}
      />
      <FloatingAddButton onUpload={uploadFiles} />
      <Breadcrumbs path={folderPath} />

      <div className="flex-1 overflow-y-auto pb-16 animate-fade-in">
        <FileGrid
          files={files}
          folders={folders}
          onToggleFavorite={handleToggleFavorite}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
          onFileClick={setPreviewFile}
        />
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          files={files}
          onClose={() => setPreviewFile(null)}
          onNavigate={setPreviewFile}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
