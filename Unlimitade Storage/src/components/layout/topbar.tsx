import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onCreateFolder?: () => void;
  title?: string;
}

export function Topbar({ onCreateFolder, title }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="shrink-0 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-30 px-4 pb-3 space-y-3 safe-area-top">
      {/* Title row */}
      <div className="flex items-center justify-between">
        {title && (
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onCreateFolder && (
            <Button
              variant="outline"
              size="icon"
              onClick={onCreateFolder}
            >
              <FolderPlus className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/60 dark:bg-muted/40 border-transparent focus:border-brand/30 focus:bg-background h-10 rounded-xl transition-colors duration-200"
          />
        </div>
      </form>
    </header>
  );
}
