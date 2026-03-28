import { Link, useLocation } from "react-router-dom";
import { HardDrive, Image, Star, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/drive", label: "Drive", icon: HardDrive },
  { href: "/photos", label: "Photos", icon: Image },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/search", label: "Search", icon: Search },
];

export function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              <item.icon
                className={cn(
                  "transition-all duration-200",
                  isActive ? "w-6 h-6" : "w-5 h-5"
                )}
              />
              <span className="text-[11px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
