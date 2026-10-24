import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface SectionProps {
  /** Titre principal. */
  title: string;
  /** Petit libellé au-dessus du titre (ex. « Comptes ») — rendu en majuscules espacées. */
  caption?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function Section({ title, caption, right, style }: SectionProps) {
  const theme = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.body}>
        {caption ? (
          <Text style={[styles.caption, { color: theme.primary }]}>{caption}</Text>
        ) : null}
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  caption: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
});