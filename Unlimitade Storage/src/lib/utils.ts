import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number | string): string {
  const size = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (size === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return `${parseFloat((size / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Sanitize user-provided names for files and folders.
// Returns the cleaned name, or null if the name is invalid.
export function sanitizeName(raw: string): string | null {
  // Strip control characters and filesystem-unsafe characters
  const cleaned = raw.replace(/[\x00-\x1F<>:"/\\|?*]/g, "").trim();
  if (!cleaned || cleaned === "." || cleaned === ".." || cleaned.length > 255) return null;
  return cleaned;
}

export function generateId(): string {
  // Use cryptographically secure random values instead of Math.random()
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
