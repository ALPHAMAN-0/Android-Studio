import { create } from "zustand";
import type { UploadProgress } from "@/types";

interface UploadStore {
  uploads: UploadProgress[];
  addUpload: (file: File) => string;
  updateUpload: (id: string, updates: Partial<UploadProgress>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
}

let counter = 0;

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],

  addUpload: (file: File) => {
    const id = `upload-${++counter}-${Date.now()}`;
    set((state) => ({
      uploads: [
        ...state.uploads,
        {
          id,
          filename: file.name,
          size: file.size,
          progress: 0,
          status: "queued",
        },
      ],
    }));
    return id;
  },

  updateUpload: (id, updates) => {
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, ...updates } : u
      ),
    }));
  },

  removeUpload: (id) => {
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== "done"),
    }));
  },
}));
