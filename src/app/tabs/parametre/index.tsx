import React from "react";

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/contexte/AuthContext";
import { ThemeMode, useThemeMode } from "@/contexte/ThemeContext";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";
import { Screen } from "@/components/ui/screen";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";

const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "clair", label: "Clair" },
  { value: "sombre", label: "Sombre" },
];

export default function ParametreScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();

  if (!user) return null;

  const initials = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <Screen>
      <Section title="Paramètres" />

      <Card padded style={styles.userCard}>
        {user.photoUri ? (
          <Image source={{ uri: user.photoUri }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
          </View>
        )}
        <View style={styles.userBody}>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user.prenom} {user.nom}
          </Text>
          <Text style={[styles.userSub, { color: theme.textSecondary }]}>
            {user.numeroCompte}
          </Text>
        </View>
      </Card>

      <Section title="Apparence" />
      <View style={styles.modeRow}>
        {MODE_OPTIONS.map((option) => {
          const active = mode === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setMode(option.value)}
              style={[
                styles.modeOption,
                {
                  backgroundColor: active ? theme.primary : theme.backgroundElement,
                  borderColor: active ? theme.primary : theme.line,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  { color: active ? "#ffffff" : theme.text },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Row
        title="Notifications"
        subtitle="Suivre vos alertes"
        left={<Ionicons name="notifications-outline" size={22} color={theme.primary} />}
        onPress={() => router.push("/tabs/profile/notifications")}
      />
      <Row
        title="Paramètres avancés"
        subtitle="Langue, thème, préférences"
        left={<Ionicons name="settings-outline" size={22} color={theme.primary} />}
        onPress={() => router.push("/tabs/profile/settings")}
      />

      <Button
        title="Se déconnecter"
        variant="danger"
        onPress={() => {
          signOut();
          router.replace("/auth/login");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: { fontSize: 20, fontWeight: "700" },
  userBody: { flex: 1, gap: 2 },
  userName: { fontSize: 18, fontWeight: "700" },
  userSub: { fontSize: 13 },
  modeRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  modeOption: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  modeLabel: { fontSize: 14, fontWeight: "600" },
});