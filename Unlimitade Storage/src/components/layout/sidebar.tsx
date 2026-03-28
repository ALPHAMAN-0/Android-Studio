import { Link, useLocation } from "react-router-dom";
import {
  HardDrive,
  Image,
  Star,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/drive", label: "My Drive", icon: HardDrive },
  { href: "/photos", label: "Photos", icon: Image },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2.5">
        <img
          src="/logo.png"
          alt="Unlimitade Storage"
          width={36}
          height={36}
          className="rounded-lg"
        />
        <span className="font-semibold text-lg flex-1">Unlimitade</span>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <Link
          to="/setup"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
