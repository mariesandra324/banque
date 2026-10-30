import type { ComponentProps } from "react";

import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, usePathname } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

import { useAuth } from "@/contexte/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Radius, Spacing } from "@/constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const SIDEBAR_BREAKPOINT = 1024;

const TAB_ITEMS: {
  name: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: IconName;
  iconOutline: IconName;
}[] = [
  {
    name: "index",
    label: "Accueil",
    shortLabel: "Accueil",
    href: "/tabs",
    icon: "home",
    iconOutline: "home-outline",
  },
  {
    name: "cartes",
    label: "Cartes",
    shortLabel: "Cartes",
    href: "/tabs/cartes",
    icon: "card",
    iconOutline: "card-outline",
  },
  {
    name: "statistique",
    label: "Statistiques",
    shortLabel: "Stats",
    href: "/tabs/statistique",
    icon: "bar-chart",
    iconOutline: "bar-chart-outline",
  },
  {
    name: "parametre",
    label: "Paramètres",
    shortLabel: "Réglages",
    href: "/tabs/parametre",
    icon: "settings",
    iconOutline: "settings-outline",
  },
];

const HIDDEN_TABS = ["accounts", "credits", "movements", "profile", "search"];

function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: insets.bottom + Spacing.three },
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
              <Animated.View
                layout={LinearTransition.springify().damping(18).stiffness(180)}
                style={[
                  styles.pill,
                  isFocused && { backgroundColor: theme.primarySoft },
                ]}
              >
                <Ionicons
                  name={isFocused ? item.icon : item.iconOutline}
                  size={21}
                  color={isFocused ? theme.primary : theme.textSecondary}
                />
                {isFocused && (
                  <Animated.Text
                    entering={FadeIn.duration(180)}
                    exiting={FadeOut.duration(120)}
                    style={[styles.pillLabel, { color: theme.primary }]}
                    numberOfLines={1}
                  >
                    {item.shortLabel}
                  </Animated.Text>
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function WebSidebar() {
  const theme = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();

  const isActive = (href: string) =>
    href === "/tabs"
      ? pathname === "/tabs" || pathname === "/tabs/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <View
      style={[
        styles.sidebar,
        { backgroundColor: theme.surface, borderRightColor: theme.line },
      ]}
    >
      <View style={styles.brand}>
        <View style={[styles.brandMark, { backgroundColor: theme.primary }]}>
          <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
        </View>
        <View style={styles.brandText}>
          <Text style={[styles.brandTitle, { color: theme.text }]}>ERP Banking</Text>
          <Text style={[styles.brandCaption, { color: theme.textSecondary }]}>
            Espace client
          </Text>
        </View>
      </View>

      <Text style={[styles.navLabel, { color: theme.textSecondary }]}>Navigation</Text>

      <View style={styles.nav}>
        {TAB_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
              accessibilityLabel={item.label}
              onPress={() => {
                if (!active) router.navigate(item.href);
              }}
              style={({ pressed }) => [
                styles.navItem,
                {
                  backgroundColor: active ? theme.primarySoft : "transparent",
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons
                name={active ? item.icon : item.iconOutline}
                size={21}
                color={active ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.navItemText,
                  { color: active ? theme.primary : theme.textSecondary },
                  active && styles.navItemTextActive,
                ]}
              >
                {item.label}
              </Text>
              {active && (
                <View style={[styles.navItemIndicator, { backgroundColor: theme.primary }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarSpacer} />

      <Pressable
        onPress={() => router.push("/tabs/profile")}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir mon profil"
        style={({ pressed }) => [
          styles.userCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.line,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.userAvatarText}>{initials || "?"}</Text>
        </View>
        <View style={styles.userText}>
          <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
            {user?.prenom} {user?.nom}
          </Text>
          <Text style={[styles.userCaption, { color: theme.textSecondary }]} numberOfLines={1}>
            Mon profil
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const { user } = useAuth();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const showSidebar = Platform.OS === "web" && width >= SIDEBAR_BREAKPOINT;

  if (!user) return <Redirect href="/auth/login" />;

  return (
    <View style={[styles.root, showSidebar && styles.rootWide]}>
      {showSidebar && <WebSidebar />}
      <View style={styles.navigator}>
        <Tabs
          tabBar={showSidebar ? () => null : (props) => <FloatingTabBar {...props} />}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootWide: {
    flexDirection: "row",
  },
  navigator: {
    flex: 1,
  },
  sidebar: {
    width: 264,
    borderRightWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    flex: 1,
    gap: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  brandCaption: {
    fontSize: 12,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: Spacing.two,
  },
  nav: {
    gap: Spacing.one,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    height: 46,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: "600",
  },
  navItemTextActive: {
    fontWeight: "700",
  },
  navItemIndicator: {
    marginLeft: "auto",
    width: 4,
    height: 18,
    borderRadius: Radius.pill,
  },
  sidebarSpacer: {
    flex: 1,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  userText: {
    flex: 1,
    gap: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "700",
  },
  userCaption: {
    fontSize: 11,
  },
  wrapper: {
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingTop: Spacing.one,
  },
  bar: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.one + Spacing.half,
    shadowColor: "#0B1220",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.half,
  },
  pill: {
    minHeight: 50,
    minWidth: 50,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: Radius.md + 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});