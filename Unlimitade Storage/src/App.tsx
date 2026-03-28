import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UploadProgress } from "@/components/upload/upload-progress";
import { useSettings } from "@/hooks/use-settings";
import { SetupPage } from "@/pages/SetupPage";
import { DrivePage } from "@/pages/DrivePage";
import { FolderPage } from "@/pages/FolderPage";
import { PhotosPage } from "@/pages/PhotosPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { SearchPage } from "@/pages/SearchPage";
import { Loader2 } from "lucide-react";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <MobileNav />
      <UploadProgress />
    </div>
  );
}

function AppRoutes() {
  const { isConfigured, loading } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />

      {!isConfigured ? (
        <Route path="*" element={<Navigate to="/setup" replace />} />
      ) : (
        <>
          <Route
            path="/drive"
            element={
              <AppLayout>
                <DrivePage />
              </AppLayout>
            }
          />
          <Route
            path="/drive/:folderId"
            element={
              <AppLayout>
                <FolderPage />
              </AppLayout>
            }
          />
          <Route
            path="/photos"
            element={
              <AppLayout>
                <PhotosPage />
              </AppLayout>
            }
          />
          <Route
            path="/favorites"
            element={
              <AppLayout>
                <FavoritesPage />
              </AppLayout>
            }
          />
          <Route
            path="/search"
            element={
              <AppLayout>
                <SearchPage />
              </AppLayout>
            }
          />
          <Route path="*" element={<Navigate to="/drive" replace />} />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}
