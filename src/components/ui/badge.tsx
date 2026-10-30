import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const theme = useTheme();
  const palette: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: theme.backgroundSelected, fg: theme.textSecondary },
    success: { bg: theme.successSoft, fg: theme.success },
    warning: { bg: theme.warningSoft, fg: theme.warning },
    danger: { bg: theme.dangerSoft, fg: theme.danger },
    primary: { bg: theme.primarySoft, fg: theme.primary },
  };
  const { bg, fg } = palette[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});