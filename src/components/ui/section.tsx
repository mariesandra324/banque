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
    marginTop: Spacing.one,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  caption: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
});