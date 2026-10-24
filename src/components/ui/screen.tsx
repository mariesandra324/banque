import { ReactNode } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  /** Couloir horizontal max pour grands écrans (web/tablette). */
  center?: boolean;
}

export function Screen({ children, scroll = true, style, center = false }: ScreenProps) {
  const theme = useTheme();
  const safeStyle = [styles.safe, { backgroundColor: theme.background }];

  if (!scroll) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={safeStyle}>
        <View style={[styles.content, center && styles.centered, style]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={safeStyle}>
      <ScrollView
        contentContainerStyle={[styles.content, center && styles.centered, style]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  centered: {
    alignItems: "center",
  },
});