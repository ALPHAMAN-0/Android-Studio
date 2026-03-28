import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getSettings, saveSettings as save, clearSettings } from "@/lib/services/settings";
import { testConnection } from "@/lib/services/telegram";
import type { AppSettings } from "@/types";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);

      // Background token validation — warn user if token has been revoked
      if (s?.botToken) {
        testConnection(s.botToken).then((result) => {
          if (!result.ok) {
            toast.error("Bot token is invalid or revoked. Please reconfigure.");
          }
        }).catch(() => {
          // Offline — skip validation silently
        });
      }
    });
  }, []);

  const saveSettingsHandler = useCallback(async (newSettings: AppSettings) => {
    await save(newSettings);
    setSettings(newSettings);
  }, []);

  const logout = useCallback(async () => {
    await clearSettings();
    setSettings(null);
  }, []);

  return {
    settings,
    isConfigured: !!(settings?.botToken && settings?.channelId),
    loading,
    saveSettings: saveSettingsHandler,
    logout,
  };
}
