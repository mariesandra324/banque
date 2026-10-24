import { Pressable, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";

import { useTheme } from "@/hooks/use-theme";

/** Retour circulaire + libellé, pour les en-têtes des écrans de détail. */
export function BackButton({ label = "Retour" }: { label?: string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <View style={[styles.circle, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.chevron, { color: theme.text }]}>‹</Text>
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    fontSize: 26,
    fontWeight: "600",
    marginTop: -4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.65,
  },
});