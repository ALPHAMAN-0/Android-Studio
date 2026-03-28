import {
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text/"))
    return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return FileSpreadsheet;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return Presentation;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar") || mimeType.includes("gz"))
    return FileArchive;
  if (mimeType.includes("javascript") || mimeType.includes("json") || mimeType.includes("xml") || mimeType.includes("html"))
    return FileCode;
  return File;
}

export function getFileColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "text-green-500";
  if (mimeType.startsWith("video/")) return "text-purple-500";
  if (mimeType.startsWith("audio/")) return "text-pink-500";
  if (mimeType.includes("pdf")) return "text-red-500";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "text-emerald-600";
  if (mimeType.includes("presentation")) return "text-orange-500";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "text-yellow-600";
  return "text-blue-500";
}

interface FileIconDisplayProps {
  mimeType: string;
  className?: string;
}

export function FileIconDisplay({ mimeType, className = "w-10 h-10" }: FileIconDisplayProps) {
  const Icon = getFileIcon(mimeType);
  const color = getFileColor(mimeType);
  return <Icon className={`${className} ${color}`} />;
}
