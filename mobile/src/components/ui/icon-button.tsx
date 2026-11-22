import type { ComponentProps } from "react";

import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Radius, Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  /** Taille du bouton (circulaire), défaut 40. */
  size?: number;
  bg?: string;
  fg?: string;
  elevated?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

/** Bouton rond pour les icônes du header (retour, recherche, notification…). */
export function IconButton({
  icon,
  onPress,
  size = 40,
  bg,
  fg,
  elevated = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.btn,
        elevated && Shadows.card,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          backgroundColor: bg ?? theme.surface,
          borderWidth: 1,
          borderColor: theme.line,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.48} color={fg ?? theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
});