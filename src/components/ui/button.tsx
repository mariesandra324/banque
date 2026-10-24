import type { ComponentProps } from "react";

import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Radius, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const palette: Record<Variant, { bg: string; fg: string; shadow?: boolean }> = {
    primary: { bg: theme.primary, fg: theme.onPrimary, shadow: true },
    secondary: { bg: theme.primarySoft, fg: theme.primary },
    danger: { bg: theme.dangerSoft, fg: theme.danger },
    ghost: { bg: "transparent", fg: theme.text },
  };
  const { bg, fg, shadow } = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg },
        shadow && Shadows.card,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={fg} style={styles.icon} /> : null}
      <Text style={[styles.label, { color: fg }]}>
        {loading ? "Patientez…" : title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  icon: {
    marginRight: 2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
});