import { Preferences } from "@capacitor/preferences";

const KEY_PREF = "unlimitade-ek";

// Get or create the device-specific AES-GCM encryption key.
// The key is generated once per installation and stored in Preferences.
async function getOrCreateKey(): Promise<CryptoKey> {
  const { value } = await Preferences.get({ key: KEY_PREF });

  if (value) {
    const raw = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey(
      "raw",
      raw.buffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // First run — generate a new 256-bit key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  await Preferences.set({
    key: KEY_PREF,
    value: btoa(String.fromCharCode(...raw)),
  });
  return key;
}

// AES-GCM encrypt a string. Returns base64-encoded (IV + ciphertext).
export async function encryptString(plaintext: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

// AES-GCM decrypt a base64-encoded (IV + ciphertext) string.
export async function decryptString(ciphertext: string): Promise<string> {
  const key = await getOrCreateKey();
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}
