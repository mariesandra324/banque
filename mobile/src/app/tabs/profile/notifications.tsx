import React, { useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationsService";
import { AppNotification } from "@/constants/types";
import { Screen } from "@/components/ui/screen";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Spacing } from "@/constants/theme";
import { formatDateTime } from "@/utils/format";
import { resolveNotificationLink } from "@/utils/notificationLinks";

function openNotification(n: AppNotification) {
  const cible = resolveNotificationLink(n.lien);

  if (!cible) return;

  router.push(cible as never);
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const { data: notifications, loading, reload } = useAsyncData(fetchNotifications, []);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = (notifications ?? []).filter((n) => !n.lue).length;

  const handleOpen = async (n: AppNotification) => {
    if (!n.lue) {
      await markNotificationRead(n.id).catch(() => {});
      reload();
    }
    openNotification(n);
  };

  const handleMarkAll = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      reload();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <BackButton />
        <Pressable
          onPress={handleMarkAll}
          disabled={markingAll || unreadCount === 0}
          hitSlop={8}
          style={styles.markAllBtn}
        >
          <Ionicons
            name="checkmark-done-outline"
            size={18}
            color={unreadCount === 0 ? theme.textSecondary : theme.primary}
          />
          <Text
            style={[
              styles.markAllText,
              { color: unreadCount === 0 ? theme.textSecondary : theme.primary },
            ]}
          >
            {markingAll ? "..." : "Tout marquer comme lu"}
          </Text>
        </Pressable>
      </View>

      <Section title="Notifications" caption="Alertes et messages" />

      {loading && <Text style={{ color: theme.textSecondary }}>Chargement…</Text>}

      {notifications?.map((n) => (
        <Pressable key={n.id} onPress={() => handleOpen(n)}>
          <Card
            padded
            style={{ borderColor: n.lue ? theme.line : theme.primary }}
          >
            <View style={styles.notifRow}>
              <View style={[styles.emojiBadge, { backgroundColor: theme.primarySoft }]}>
                <Text style={styles.emojiText}>{n.emoji ?? "🔔"}</Text>
              </View>
              <View style={styles.notifBody}>
                <View style={styles.notifHeader}>
                  <Text
                    style={[
                      styles.notifTitle,
                      { color: theme.text, fontWeight: n.lue ? "600" : "800" },
                    ]}
                    numberOfLines={1}
                  >
                    {n.titre}
                  </Text>
                  {!n.lue && <Badge label="Nouveau" tone="primary" />}
                </View>
                <Text style={[styles.notifMessage, { color: theme.textSecondary }]} numberOfLines={2}>
                  {n.message}
                </Text>
                <Text style={[styles.notifDate, { color: theme.textSecondary }]}>
                  {formatDateTime(n.date)}
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}

      {!loading && notifications?.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={40} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary }}>Aucune notification.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  notifRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  emojiBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 20,
  },
  notifBody: {
    flex: 1,
    gap: Spacing.one,
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  notifTitle: {
    fontSize: 15,
    flexShrink: 1,
  },
  notifMessage: {
    fontSize: 13,
  },
  notifDate: {
    fontSize: 11,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
});