import { fetch as expoFetch } from "expo/fetch";

import { API_URL } from "@/constants/config";
import { AppNotification } from "@/constants/types";
import { getAuthToken, apiRequest } from "./api";
import { toAppNotification } from "./notificationsService";
import { NotificationBackend } from "./notificationTypes";

export type NotificationListener = (notification: AppNotification) => void;

function decodeUtf8(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  try {
    return decodeURIComponent(escape(binary));
  } catch {
    return binary;
  }
}

/**
 * Souscrit au flux SSE /api/notifications/stream et notifie le listener
 * à chaque notification reçue. Retourne une fonction de désabonnement.
 * Se reconnecte automatiquement si la connexion est perdue.
 */
export function subscribeToNotifications(listener: NotificationListener): () => void {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const connect = async () => {
    if (closed) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await expoFetch(`${API_URL}/notifications/stream`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE status ${response.status}`);
      }

      const reader = response.body.getReader();
      let buffer = "";

      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decodeUtf8(value);

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);

          if (line.startsWith("data:")) {
            const payload = line.slice(5).trim();
            if (!payload || payload === "ping") continue;
            try {
              const raw = JSON.parse(payload) as NotificationBackend;
              if (raw && typeof raw.id !== "undefined") {
                listener(toAppNotification(raw));
              }
            } catch {
              // ignorer les données mal formées
            }
          }
        }
      }
    } catch {
      // connexion interrompue : reconnexion plus tard
    }

    if (!closed) {
      timer = setTimeout(connect, 8000);
    }
  };

  connect();

  return () => {
    closed = true;
    if (timer) clearTimeout(timer);
    controller.abort();
  };
}

export async function refreshUnreadCount(): Promise<number> {
  return apiRequest<number>("/notifications/non-lues");
}