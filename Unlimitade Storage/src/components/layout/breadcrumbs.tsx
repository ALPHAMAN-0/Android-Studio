import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  path: BreadcrumbItem[];
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 px-4 py-3 overflow-x-auto">
      <Link
        to="/drive"
        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
      >
        <Home className="w-4 h-4" />
        <span>My Drive</span>
      </Link>

      {path.map((item) => (
        <span key={item.id} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="w-4 h-4" />
          <Link
            to={`/drive/${item.id}`}
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}
