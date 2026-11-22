import React, { useCallback } from "react";

import { Alert, AlertButton, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import type { ComponentProps } from "react";

import { useAuth } from "@/contexte/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Radius, Shadows, Spacing } from "@/constants/theme";
import { Screen } from "@/components/ui/screen";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { formatDate } from "@/utils/format";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function ProfileScreen() {
  const { user, signOut, updateUserPhoto } = useAuth();
  const theme = useTheme();

  const pickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Autorisation requise", "Accédez à vos photos pour choisir une image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      updateUserPhoto(result.assets[0].uri);
    }
  }, [updateUserPhoto]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Autorisation requise", "Accédez à votre caméra pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      updateUserPhoto(result.assets[0].uri);
    }
  }, [updateUserPhoto]);

  const handleAvatarPress = useCallback(() => {
    const options: AlertButton[] = [
      { text: "Prendre une photo", onPress: takePhoto },
      { text: "Choisir depuis la galerie", onPress: pickFromLibrary },
      { text: "Annuler", style: "cancel" },
    ];
    if (user?.photoUri) {
      options.push({
        text: "Supprimer la photo",
        style: "destructive",
        onPress: () => updateUserPhoto(null),
      });
    }
    Alert.alert("Photo de profil", "Choisissez une source pour votre photo.", options);
  }, [user?.photoUri, takePhoto, pickFromLibrary, updateUserPhoto]);

  if (!user) return null;

  const initials = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase();

  const infos: { icon: IconName; label: string; value?: string }[] = [
    { icon: "mail-outline", label: "Adresse email", value: user.email },
    { icon: "call-outline", label: "Téléphone", value: user.telephone },
    { icon: "location-outline", label: "Adresse", value: user.adresse },
    { icon: "finger-print-outline", label: "N° CIN", value: user.cin },
    {
      icon: "calendar-outline",
      label: "Date de naissance",
      value: user.dateNaissance ? formatDate(user.dateNaissance) : undefined,
    },
  ];

  return (
    <Screen>
      <Section title="Mon profil" caption="Compte" />

      {/* Carte identité */}
      <Card padded style={styles.profileCard}>
        <Pressable
          onPress={handleAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Modifier la photo de profil"
          style={styles.avatarWrap}
        >
          {user.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="camera" size={15} color="#ffffff" />
          </View>
        </Pressable>

        <View style={styles.identity}>
          <Text style={[styles.name, { color: theme.text }]}>
            {user.prenom} {user.nom}
          </Text>
          <Text style={[styles.role, { color: theme.textSecondary }]}>Client ERPBanking</Text>
          <View style={[styles.verifiedChip, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="checkmark-circle" size={13} color={theme.primary} />
            <Text style={[styles.verifiedText, { color: theme.primary }]}>Identité vérifiée</Text>
          </View>
        </View>
      </Card>
      
      {infos.map((info) =>
        info.value ? (
          <View
            key={info.label}
            style={[
              styles.infoRow,
              Shadows.card,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <View style={[styles.infoIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name={info.icon} size={20} color={theme.primary} />
            </View>
            <View style={styles.infoBody}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {info.label}
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{info.value}</Text>
            </View>
          </View>
        ) : null
      )}

      {/* Services */}
      <Section title="Mes services" caption="Accès rapide" />
      <Row
        title="Notifications"
        subtitle="Suivre vos alertes"
        left={<Ionicons name="notifications-outline" size={20} color={theme.primary} />}
        right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
        onPress={() => router.push("/tabs/profile/notifications")}
      />
      <Row
        title="Mot de passe"
        subtitle="Modifier votre code personnel"
        left={<Ionicons name="key-outline" size={20} color={theme.primary} />}
        right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
        onPress={() => router.push("/tabs/profile/password")}
      />
      <Row
        title="Paramètres"
        subtitle="Notifications, langue, thème"
        left={<Ionicons name="settings-outline" size={20} color={theme.primary} />}
        right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
        onPress={() => router.push("/tabs/profile/settings")}
      />

      <Button
        title="Se déconnecter"
        variant="danger"
        icon="log-out-outline"
        onPress={() => {
          signOut();
          router.replace("/auth/login");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "800",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  identity: {
    alignItems: "center",
    gap: Spacing.one,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 14,
  },
  verifiedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    marginTop: Spacing.one,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBody: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
  },
});