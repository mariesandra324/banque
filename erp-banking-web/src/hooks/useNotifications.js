import { useCallback, useEffect, useRef, useState } from "react";
import notificationService from "../service/notificationService";

const API_BASE = "http://localhost:8080/api";
const RECONNECT_DELAY = 5000;
const POLL_INTERVAL = 30000;

/**
 * Connexion SSE avec le header Authorization.
 * EventSource ne permet pas de définir des headers, on consomme donc
 * le flux text/event-stream via fetch + ReadableStream.
 */
async function connectNotificationStream({ signal, onNotification }) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/notifications/stream`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Échec de connexion au flux de notifications");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const hasNotificationEvent = block
        .split("\n")
        .some((line) => line.startsWith("event:") && line.includes("notification"));

      const dataLine = block.split("\n").find((line) => line.startsWith("data:"));
      if (hasNotificationEvent && dataLine) {
        try {
          onNotification(JSON.parse(dataLine.slice(5).trim()));
        } catch {
          // payload non JSON : ignoré
        }
      }
    }
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const streamController = useRef(null);
  const reconnectTimer = useRef(null);
  const pollTimer = useRef(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const [items, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(items);
      setUnread(count);
    } catch {
      // API indisponible : on conserve l'état courant
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    const connect = async () => {
      try {
        await connectNotificationStream({
          signal: streamController.current.signal,
          onNotification: (notification) => {
            setNotifications((prev) =>
              prev.some((n) => n.id === notification.id)
                ? prev
                : [notification, ...prev].slice(0, 50)
            );
            setUnread((prev) => prev + 1);
          },
        });
      } catch (error) {
        if (error.name === "AbortError") return;
      } finally {
        if (mounted.current && !streamController.current.signal.aborted) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      }
    };

    const controller = new AbortController();
    streamController.current = controller;
    connect();

    const initialLoad = setTimeout(() => load(), 0);
    pollTimer.current = setInterval(load, POLL_INTERVAL);

    return () => {
      mounted.current = false;
      controller.abort();
      clearTimeout(initialLoad);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const refreshOnOpen = setTimeout(() => load(), 0);
    return () => clearTimeout(refreshOnOpen);
  }, [open, load]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
    try {
      await notificationService.markRead(id);
    } catch {
      // lecture optimiste : échec silencieux
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setUnread(0);
    try {
      await notificationService.markAllRead();
    } catch {
      // lecture optimiste : échec silencieux
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return {
    notifications,
    unread,
    loading,
    open,
    toggleOpen,
    close,
    markRead,
    markAllRead,
    refresh: load,
  };
}