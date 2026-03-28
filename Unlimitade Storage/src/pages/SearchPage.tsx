import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileGrid } from "@/components/files/file-grid";
import { FilePreview } from "@/components/files/file-preview";
import { useSearch } from "@/hooks/use-search";
import * as db from "@/lib/services/database";
import type { FileItem } from "@/types";

const FILE_TYPES = [
  { value: "", label: "All" },
  { value: "images", label: "Images" },
  { value: "videos", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "pdfs", label: "PDFs" },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [fileType, setFileType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const { results, search } = useSearch();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      search({ q });
    }
  }, [searchParams, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      search({
        q: query.trim(),
        type: fileType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
    }
  };

  const handleClear = () => {
    setQuery("");
    setFileType("");
    setDateFrom("");
    setDateTo("");
    setSearchParams({});
  };

  const handleToggleFavorite = async (fileId: string, isFavorite: boolean) => {
    await db.updateFile(fileId, { isFavorite });
    search({ q: query, type: fileType || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search header */}
      <div className="border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 pb-4 space-y-3 sticky top-0 z-30 safe-area-top">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-muted/60 dark:bg-muted/40 border-transparent focus:border-brand/30 focus:bg-background transition-colors duration-200"
            />
          </div>
          <Button type="submit" size="sm" className="active:scale-95 transition-all duration-150">
            Search
          </Button>
          {query && (
            <Button variant="ghost" size="icon" onClick={handleClear} className="active:scale-95 transition-all duration-150">
              <X className="w-4 h-4" />
            </Button>
          )}
        </form>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setFileType(type.value);
                if (query) {
                  search({ q: query, type: type.value || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
                fileType === type.value
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Date filters */}
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              const val = e.target.value;
              setDateFrom(val);
              if (query) search({ q: query, type: fileType || undefined, dateFrom: val || undefined, dateTo: dateTo || undefined });
            }}
            className="text-xs h-8"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              const val = e.target.value;
              setDateTo(val);
              if (query) search({ q: query, type: fileType || undefined, dateFrom: dateFrom || undefined, dateTo: val || undefined });
            }}
            className="text-xs h-8"
            placeholder="To"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto pb-16">
        {results.length > 0 ? (
          <FileGrid
            files={results}
            folders={[]}
            onToggleFavorite={handleToggleFavorite}
            onFileClick={setPreviewFile}
          />
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
              <SearchX className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <p className="text-lg font-semibold text-foreground/80 mb-1">No results</p>
            <p className="text-sm text-muted-foreground max-w-[240px] text-center">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
              <Search className="w-10 h-10 text-muted-foreground/60" />
            </div>
            <p className="text-lg font-semibold text-foreground/80 mb-1">Search your files</p>
            <p className="text-sm text-muted-foreground max-w-[240px] text-center">
              Find files by name, type, or date
            </p>
          </div>
        )}
      </div>

      {previewFile && (
        <FilePreview
          file={previewFile}
          files={results}
          onClose={() => setPreviewFile(null)}
          onNavigate={setPreviewFile}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
