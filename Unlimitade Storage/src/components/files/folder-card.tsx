import { Link } from "react-router-dom";
import { Folder, MoreVertical, Edit3, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FolderItem } from "@/types";

interface FolderCardProps {
  folder: FolderItem;
  onRename?: (folderId: string, currentName: string) => void;
  onDelete?: (folderId: string) => void;
  style?: React.CSSProperties;
}

export function FolderCard({ folder, onRename, onDelete, style }: FolderCardProps) {
  return (
    <div className="group relative" style={style}>
      <Link
        to={`/drive/${folder.id}`}
        className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3 shadow-card hover:shadow-card-hover hover:border-brand/30 dark:hover:border-brand/20 transition-all duration-200 active:scale-[0.98]"
      >
        <div className="p-2.5 bg-brand-light dark:bg-brand/10 rounded-xl">
          <Folder className="w-6 h-6 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight truncate text-foreground">
            {folder.name}
          </p>
          {folder._count && (
            <p className="text-[11px] text-muted-foreground">
              {folder._count.files} files, {folder._count.children} folders
            </p>
          )}
        </div>
      </Link>

      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-full bg-white/90 dark:bg-black/40 backdrop-blur-md shadow-sm">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRename?.(folder.id, folder.name)}>
              <Edit3 className="w-4 h-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete?.(folder.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
