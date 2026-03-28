import { useState, useCallback } from "react";
import { searchFiles } from "@/lib/services/database";
import type { FileItem, SearchParams } from "@/types";

export function useSearch() {
  const [results, setResults] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback((params: SearchParams) => {
    setIsLoading(true);
    const files = searchFiles(params);
    setResults(files);
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
  }, []);

  return { results, isLoading, search, clear };
}
