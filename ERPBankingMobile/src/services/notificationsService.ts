import { USE_MOCKS } from "@/constants/config";
import { notifications } from "@/constants/mockData";
import { AppNotification } from "@/constants/types";
import { NotificationBackend } from "./notificationTypes";

import { apiRequest } from "./api";

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export function toAppNotification(raw: NotificationBackend): AppNotification {
  return {
    id: String(raw.id),
    type: raw.type,
    titre: raw.titre,
    message: raw.message,
    lien: raw.lien,
    date: raw.dateCreation,
    lue: raw.lu,
    emoji: raw.emoji,
  };
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  if (USE_MOCKS) {
    await delay();
    return [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  // GET /api/notifications
  const data = await apiRequest<NotificationBackend[]>("/notifications");
  return (data ?? [])
    .map(toAppNotification)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function fetchUnreadNotificationsCount(): Promise<number> {
  if (USE_MOCKS) {
    await delay(150);
    return notifications.filter((n) => !n.lue).length;
  }
  // GET /api/notifications/non-lues
  const data = await apiRequest<number>("/notifications/non-lues");
  return data ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_MOCKS) {
    await delay(150);
    return;
  }
  // PUT /api/notifications/{id}/lue
  await apiRequest<void>(`/notifications/${id}/lue`, { method: "PUT" });
}

export async function markAllNotificationsRead(): Promise<void> {
  if (USE_MOCKS) {
    await delay(150);
    return;
  }
  // PUT /api/notifications/lues
  await apiRequest<void>("/notifications/lues", { method: "PUT" });
}

export type NotificationPreference = {
  type: string;
  libelle: string;
  emoji: string | null;
  roleCible: string;
  emailActive: boolean;
  pushActive: boolean;
};

export async function fetchNotificationPreferences(): Promise<NotificationPreference[]> {
  // GET /api/notifications/preferences
  const data = await apiRequest<NotificationPreference[]>("/notifications/preferences");
  return data ?? [];
}

export async function saveNotificationPreferences(
  preferences: NotificationPreference[]
): Promise<void> {
  // PUT /api/notifications/preferences
  await apiRequest<void>("/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}