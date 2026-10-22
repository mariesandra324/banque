import type { ComponentProps } from "react";

import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";

import { useAuth } from "@/contexte/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TAB_ITEMS: {
  name: string;
  label: string;
  icon: IconName;
  iconOutline: IconName;
}[] = [
  { name: "index", label: "Accueil", icon: "home", iconOutline: "home-outline" },
  { name: "cartes", label: "Cartes", icon: "card", iconOutline: "card-outline" },
  { name: "statistique", label: "Statistique", icon: "bar-chart", iconOutline: "bar-chart-outline" },
  { name: "parametre", label: "Paramètres", icon: "settings", iconOutline: "settings-outline" },
];

const HIDDEN_TABS = ["accounts", "credits", "movements", "profile", "search"];

function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: insets.bottom + Spacing.two + Spacing.three },
      ]}
    >
      <View
        style={[
          styles.bar,
          { backgroundColor: theme.surface, borderColor: theme.line },
        ]}
      >
        {state.routes.map((route, index) => {
          const item = TAB_ITEMS.find((t) => t.name === route.name);
          if (!item) return null;

          const options = descriptors[route.key].options;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? item.label}
              accessibilityHint={options.tabBarAccessibilityLabel ? item.label : undefined}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              hitSlop={8}
              style={styles.item}
            >
              <Ionicons
                name={isFocused ? item.icon : item.iconOutline}
                size={24}
                color={isFocused ? theme.primary : theme.textSecondary}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) return <Redirect href="/auth/login" />;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil" }} />
      <Tabs.Screen name="cartes" options={{ title: "Cartes" }} />
      <Tabs.Screen name="statistique" options={{ title: "Statistique" }} />
      <Tabs.Screen name="parametre" options={{ title: "Paramètres" }} />
      {HIDDEN_TABS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.four,
  },
  bar: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "stretch",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});