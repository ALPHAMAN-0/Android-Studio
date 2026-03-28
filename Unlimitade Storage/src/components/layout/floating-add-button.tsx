import { useRef } from "react";
import { Plus } from "lucide-react";

interface FloatingAddButtonProps {
  onUpload: (files: File[]) => void;
}

export function FloatingAddButton({ onUpload }: FloatingAddButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Snapshot into an array immediately — clearing the input below can
      // invalidate the FileList on Android WebView
      const files = Array.from(e.target.files);
      e.target.value = "";
      onUpload(files);
    }
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="fixed right-5 bottom-24 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-transform duration-150"
      >
        <Plus className="w-7 h-7" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  );
}
