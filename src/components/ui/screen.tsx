import { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { MaxContentWidth, Spacing } from "@/constants/theme";
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
  const webStyle = Platform.OS === "web" ? styles.webContent : undefined;

  const backdrop = (
    <LinearGradient
      colors={[theme.backgroundTop, theme.backgroundBottom]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />
  );

  if (!scroll) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={safeStyle}>
        {backdrop}
        <View style={[styles.content, webStyle, center && styles.centered, style]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={safeStyle}>
      {backdrop}
      <ScrollView
        contentContainerStyle={[styles.content, webStyle, center && styles.centered, style]}
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
  webContent: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  centered: {
    alignItems: "center",
  },
});