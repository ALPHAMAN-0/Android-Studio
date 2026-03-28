const API_BASE = "https://api.telegram.org";

interface TelegramUploadResult {
  telegramFileId: string;
  telegramMessageId: number;
}

export async function testConnection(botToken: string): Promise<{ ok: boolean; botName?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/bot${botToken}/getMe`);
    const data = await res.json();
    if (data.ok) {
      return { ok: true, botName: data.result.first_name };
    }
    return { ok: false, error: "Invalid bot token" };
  } catch {
    return { ok: false, error: "Network error — check your connection" };
  }
}

export async function uploadFile(
  file: File,
  botToken: string,
  channelId: string,
  onProgress?: (progress: number) => void
): Promise<TelegramUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("chat_id", channelId);
    formData.append("caption", file.name);
    formData.append("document", file, file.name);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (!data.ok) {
          reject(new Error("Upload failed"));
          return;
        }
        const doc = data.result.document;
        if (!doc) {
          reject(new Error("Upload failed"));
          return;
        }
        resolve({
          telegramFileId: doc.file_id,
          telegramMessageId: data.result.message_id,
        });
      } catch {
        reject(new Error("Upload failed"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", `${API_BASE}/bot${botToken}/sendDocument`);
    xhr.send(formData);
  });
}

export async function uploadChunk(
  chunk: Blob,
  filename: string,
  chunkIndex: number,
  totalChunks: number,
  botToken: string,
  channelId: string,
  onProgress?: (progress: number) => void
): Promise<TelegramUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("chat_id", channelId);
    formData.append("caption", `__chunk__:${filename}:${chunkIndex}:${totalChunks}`);
    formData.append("document", chunk, `${filename}.part${chunkIndex}`);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (!data.ok) {
          reject(new Error(`Upload failed (part ${chunkIndex + 1})`));
          return;
        }
        const doc = data.result.document;
        if (!doc) {
          reject(new Error(`Upload failed (part ${chunkIndex + 1})`));
          return;
        }
        resolve({
          telegramFileId: doc.file_id,
          telegramMessageId: data.result.message_id,
        });
      } catch {
        reject(new Error(`Upload failed (part ${chunkIndex + 1})`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error(`Network error (part ${chunkIndex + 1})`)));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", `${API_BASE}/bot${botToken}/sendDocument`);
    xhr.send(formData);
  });
}

export async function downloadChunkedFile(
  chunks: Array<{ telegramFileId: string }>,
  botToken: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const buffers: ArrayBuffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const url = await getFileUrl(chunks[i].telegramFileId, botToken);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download chunk ${i + 1} of ${chunks.length}`);
    buffers.push(await res.arrayBuffer());
    onProgress?.(Math.round(((i + 1) / chunks.length) * 100));
  }
  return new Blob(buffers);
}

export async function uploadThumbnail(
  blob: Blob,
  filename: string,
  botToken: string,
  channelId: string
): Promise<{ fileId: string; messageId: number } | null> {
  try {
    const formData = new FormData();
    formData.append("chat_id", channelId);
    formData.append("caption", `thumbnail:${filename}`);
    formData.append("photo", blob, `thumb_${filename}.webp`);

    const res = await fetch(`${API_BASE}/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.ok && data.result.photo?.length > 0) {
      return {
        fileId: data.result.photo[data.result.photo.length - 1].file_id,
        messageId: data.result.message_id,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getFileUrl(
  telegramFileId: string,
  botToken: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/bot${botToken}/getFile?file_id=${telegramFileId}`);
  const data = await res.json();
  if (!data.ok || !data.result.file_path) {
    throw new Error("Could not get file path from Telegram");
  }
  return `${API_BASE}/file/bot${botToken}/${data.result.file_path}`;
}

export async function downloadFile(
  telegramFileId: string,
  botToken: string
): Promise<Blob> {
  const url = await getFileUrl(telegramFileId, botToken);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }
  return res.blob();
}

export async function deleteMessage(
  messageId: number,
  botToken: string,
  channelId: string
): Promise<void> {
  await fetch(`${API_BASE}/bot${botToken}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, message_id: messageId }),
  });
}
