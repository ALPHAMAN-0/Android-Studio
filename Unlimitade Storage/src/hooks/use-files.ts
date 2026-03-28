import { useState, useEffect, useCallback } from "react";
import * as db from "@/lib/services/database";
import type { FileItem, FolderItem } from "@/types";

export function useFiles(folderId?: string | null) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setFiles(db.getFiles(folderId));
    setFolders(db.getFolders(folderId));
    setIsLoading(false);
  }, [folderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { files, folders, isLoading, mutate: refresh };
}

export function usePhotos() {
  const [photos, setPhotos] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setPhotos(db.getPhotos());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { photos, isLoading, mutate: refresh };
}

export function useFavorites() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setFiles(db.getFavorites());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { files, isLoading, mutate: refresh };
}
