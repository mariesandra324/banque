import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Radius, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface RowProps {
  left?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}

/** Ligne-carte premium : surface claire, coin arrondi, ombre douce. */
export function Row({ left, title, subtitle, right, onPress }: RowProps) {
  const theme = useTheme();
  const body = (
    <View style={[styles.row, Shadows.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      {left ? <View style={[styles.left, { backgroundColor: theme.backgroundElement }]}>{left}</View> : null}
      <View style={styles.textBody}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[pressed && styles.pressed]}>{body}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.three,
  },
  left: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  textBody: {
    flex: 1,
    gap: 2,
  },
  right: {},
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.985 }],
  },
});