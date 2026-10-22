import { StyleSheet, Text, View } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Tone = "neutral" | "success" | "danger" | "primary";

interface KpiTileProps {
  label: string;
  value: string;
  tone?: Tone;
}

/** Petite tuile d'indicateur clé (montant, volume) affichée en rangée. */
export function KpiTile({ label, value, tone = "neutral" }: KpiTileProps) {
  const theme = useTheme();
  const tones: Record<Tone, string> = {
    neutral: theme.text,
    success: theme.success,
    danger: theme.danger,
    primary: theme.primary,
  };

  return (
    <View style={[styles.tile, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, { color: tones[tone] }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: Spacing.half,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
  },
});
