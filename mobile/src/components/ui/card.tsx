import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { Radius, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  /** Ombres marquées (éléments en avant-plan). */
  elevated?: boolean;
}

export function Card({ children, style, padded = true, elevated = false }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        Shadows.card,
        elevated && Shadows.floating,
        { backgroundColor: theme.surface, borderColor: theme.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  padded: {
    padding: Spacing.three,
  },
});