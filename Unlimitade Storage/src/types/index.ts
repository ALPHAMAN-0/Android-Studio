export interface FileChunk {
  telegramFileId: string;
  telegramMessageId: number;
}

export interface FileItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: string;
  isImage: boolean;
  isVideo: boolean;
  isFavorite: boolean;
  folderId: string | null;
  telegramFileId: string;
  telegramMessageId: number;
  thumbnailFileId: string | null;
  thumbnailMessageId: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
  dateTaken: string | null;
  chunks: FileChunk[] | null;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  _count?: { files: number; children: number };
}

export interface UploadProgress {
  id: string;
  filename: string;
  size: number;
  progress: number;
  status: "queued" | "uploading" | "processing" | "done" | "error";
  error?: string;
}

export interface SearchParams {
  q?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  folderId?: string;
}

export interface AppSettings {
  botToken: string;
  channelId: string;
}
