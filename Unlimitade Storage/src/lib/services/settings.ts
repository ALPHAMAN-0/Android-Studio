import { Preferences } from "@capacitor/preferences";
import { encryptString, decryptString } from "@/lib/services/crypto";
import type { AppSettings } from "@/types";

const SETTINGS_KEY = "unlimitade-settings";

export async function getSettings(): Promise<AppSettings | null> {
  const { value } = await Preferences.get({ key: SETTINGS_KEY });
  if (!value) return null;
  try {
    const json = await decryptString(value);
    return JSON.parse(json) as AppSettings;
  } catch {
    // Could be legacy unencrypted data — try plain parse then re-save encrypted
    try {
      const parsed = JSON.parse(value) as AppSettings;
      await saveSettings(parsed); // migrate to encrypted format
      return parsed;
    } catch {
      return null;
    }
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const json = JSON.stringify(settings);
  const encrypted = await encryptString(json);
  await Preferences.set({ key: SETTINGS_KEY, value: encrypted });
}

export async function clearSettings(): Promise<void> {
  await Preferences.remove({ key: SETTINGS_KEY });
}

export async function isConfigured(): Promise<boolean> {
  const settings = await getSettings();
  return !!(settings?.botToken && settings?.channelId);
}
