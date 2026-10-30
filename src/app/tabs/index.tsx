import React, { useCallback, useEffect, useRef, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/contexte/AuthContext";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTheme } from "@/hooks/use-theme";
import { usePinGate } from "@/hooks/use-pin-gate";
import { PinModal } from "@/components/ui/pin-modal";
import { IconButton } from "@/components/ui/icon-button";
import { Gradients, Radius, Shadows, Spacing } from "@/constants/theme";
import { fetchAccounts, fetchAllOperations, verifyPin } from "@/services/accountsService";
import { fetchDashboard } from "@/services/dashboardService";
import { fetchUnreadNotificationsCount } from "@/services/notificationsService";
import { subscribeToNotifications } from "@/services/notificationStream";
import { isPushConfigure } from "@/services/pushNotifications";
import { Account, AppNotification } from "@/constants/types";
import { Screen } from "@/components/ui/screen";
import { Section } from "@/components/ui/section";
import { Row } from "@/components/ui/row";
import { formatAr, formatDate, formatMoney, maskNumber } from "@/utils/format";

const BALANCE_GRADIENT = Gradients.hero;

function getInitials(prenom?: string, nom?: string): string {
  return `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && width >= 1024;
  const { visible: pinVisible, requestPin, handleConfirm, handleCancel } = usePinGate();

  const { data: dashboard, reload: reloadDashboard } = useAsyncData(fetchDashboard, []);
  const { data: accounts, reload: reloadAccounts } = useAsyncData(fetchAccounts, []);
  const { data: operations, reload: reloadOperations } = useAsyncData(fetchAllOperations, []);
  const {
    data: unreadCount,
    setData: setUnreadCount,
    reload: reloadUnread,
  } = useAsyncData(fetchUnreadNotificationsCount, []);

  const [balanceHidden, setBalanceHidden] = useState(true);
  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      reloadDashboard();
      reloadAccounts();
      reloadOperations();
      reloadUnread();
    }, [reloadDashboard, reloadAccounts, reloadOperations, reloadUnread])
  );

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      setUnreadCount((current) => (current ?? 0) + 1);

      // Le backend notifie sur les deux canaux : si le push FCM fonctionne,
      // Android affiche déjà le bandeur système (cliquable vers le bon écran).
      // On n'affiche donc le bandeau in-app qu'en repli, quand le push
      // n'est pas configuré ou a échoué.
      if (isPushConfigure()) return;

      setLatestNotification(notification);
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setLatestNotification(null), 6000);
    });
    return () => {
      unsubscribe();
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, [setUnreadCount]);

  useEffect(() => {
    return () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, []);

  const totalBalance = dashboard?.soldeTotal ?? 0;
  const allAccounts = (accounts ?? []).filter((a) => a.balance != null);

  const openAccount = (account: Account) => {
    requestPin(
      async (pin) => {
        await verifyPin(Number(account.id), pin);
      },
      () =>
        router.push({ pathname: "/tabs/accounts/[id]", params: { id: account.id } })
    );
  };

  const renderAccount = ({ item }: { item: Account }) => {
    const isEpargne = item.type === "epargne";
    return (
      <Pressable
        onPress={() => openAccount(item)}
        style={({ pressed }) => [
          Shadows.card,
          pressed && styles.accountCardPressed,
        ]}
      >
        <View style={[styles.accountCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <LinearGradient
            colors={Gradients.heroAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accountAccent}
          />
          <View style={styles.accountCardTop}>
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              <Ionicons
                name={isEpargne ? "leaf-outline" : "wallet-outline"}
                size={19}
                color={theme.primary}
              />
            </View>
            <View
              style={[
                styles.accountStatusChip,
                { backgroundColor: isEpargne ? theme.successSoft : theme.primarySoft },
              ]}
            >
              <View
                style={[
                  styles.accountStatusDot,
                  { backgroundColor: isEpargne ? theme.success : theme.primary },
                ]}
              />
              <Text
                style={[
                  styles.accountStatusChipText,
                  { color: isEpargne ? theme.success : theme.primary },
                ]}
              >
                {isEpargne ? "Épargne" : "Actif"}
              </Text>
            </View>
          </View>
          <Text style={[styles.accountCardType, { color: theme.text }]} numberOfLines={1}>
            {isEpargne ? "Compte épargne" : "Compte courant"}
          </Text>
          <Text style={[styles.accountCardNumber, { color: theme.textSecondary }]}>
            {maskNumber(item.numero)}
          </Text>
          <Text style={[styles.accountCardBalance, { color: theme.text }]}>
            {balanceHidden ? "••••••" : formatAr(item.balance)}
          </Text>
          <View style={styles.accountFooter}>
            <Text style={[styles.accountCardStatus, { color: theme.textSecondary }]}>
              Disponible · {item.currency}
            </Text>
            <Ionicons name="arrow-forward" size={15} color={theme.primary} />
          </View>
        </View>
      </Pressable>
    );
  };

  const quickActions = [
    {
      label: "Virement",
      icon: "swap-horizontal" as const,
      color: theme.primary,
      background: theme.primarySoft,
      onPress: () => router.push("/tabs/movements/transfer/new"),
    },
    {
      label: "Dépôt",
      icon: "arrow-down-circle-outline" as const,
      color: theme.success,
      background: theme.successSoft,
      onPress: () => router.push("/tabs/movements/deposit"),
    },
    {
      label: "Cartes",
      icon: "card-outline" as const,
      color: theme.accent,
      background: theme.accentSoft,
      onPress: () => router.navigate("/tabs/cartes"),
    },
    {
      label: "Crédits",
      icon: "pricetags-outline" as const,
      color: theme.warning,
      background: theme.warningSoft,
      onPress: () => router.push("/tabs/credits"),
    },
  ];

  return (
    <Screen>
      {/* Bannière notification entrante */}
      {latestNotification && (
        <Pressable
          onPress={() => {
            setLatestNotification(null);
            router.push("/tabs/profile/notifications");
          }}
          style={[styles.banner, Shadows.card, { backgroundColor: theme.surface, borderColor: theme.line }]}
        >
          <View style={[styles.bannerIcon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="notifications" size={18} color={theme.primary} />
          </View>
          <View style={styles.bannerBody}>
            <Text style={[styles.bannerTitle, { color: theme.text }]} numberOfLines={1}>
              {latestNotification.titre}
            </Text>
            <Text style={[styles.bannerMessage, { color: theme.textSecondary }]} numberOfLines={2}>
              {latestNotification.message}
            </Text>
          </View>
          <Ionicons name="close" size={18} color={theme.textSecondary} />
        </Pressable>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerUser} onPress={() => router.push("/tabs/profile")}>
<View style={[styles.avatarRing, { borderColor: theme.primary }]}>
          {user?.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={[styles.avatarText, { color: theme.onPrimary }]}>
                {getInitials(user?.prenom, user?.nom)}
              </Text>
            </View>
          )}
        </View>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: theme.text }]} numberOfLines={1}>
              Bonjour, {user?.prenom}
            </Text>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
              Bienvenue chez ERPBanking
            </Text>
          </View>
        </Pressable>

        <View style={styles.headerIcons}>
          <IconButton
            icon="search-outline"
            onPress={() => router.push("/tabs/search")}
            elevated
            accessibilityLabel="Rechercher"
          />
          <View>
            <IconButton
              icon="notifications-outline"
              onPress={() => router.push("/tabs/profile/notifications")}
              elevated
              accessibilityLabel="Notifications"
            />
            {unreadCount != null && unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Solde total */}
      <LinearGradient
        colors={BALANCE_GRADIENT}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.balanceCard, isWideWeb && styles.balanceCardWide]}
      >
        <View style={styles.balanceSheen} />
        <View style={styles.balanceSheenSoft} />
        <View style={styles.balanceCardTop}>
          <View style={styles.balanceLabelChip}>
            <Ionicons name="wallet-outline" size={13} color="#E8F1FC" />
            <Text style={styles.balanceLabel}>Solde total</Text>
          </View>
          <Pressable onPress={() => setBalanceHidden((v) => !v)} hitSlop={8} style={styles.eyeBtn}>
            <Ionicons
              name={balanceHidden ? "eye-outline" : "eye-off-outline"}
              size={16}
              color="#ffffff"
            />
            <Text style={styles.eyeText}>{balanceHidden ? "Afficher" : "Masquer"}</Text>
          </Pressable>
        </View>
        <Text style={[styles.balanceAmount, isWideWeb && styles.balanceAmountWide]}>
          {balanceHidden ? "••••••" : formatAr(totalBalance)}
        </Text>
        <View style={styles.balanceMeta}>
          <Ionicons name="person-outline" size={13} color="#E8F1FC" />
          <Text style={styles.balanceMetaText}>
            {allAccounts.length} compte{allAccounts.length > 1 ? "s" : ""} · {dashboard?.prenom} {dashboard?.nom}
          </Text>
        </View>
      </LinearGradient>

      {/* Actions rapides */}
      <View
        style={[
          styles.quickCard,
          Shadows.card,
          { backgroundColor: theme.surface, borderColor: theme.line },
        ]}
      >
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [styles.quickItem, pressed && styles.quickItemPressed]}
          >
            <View style={[styles.quickIcon, { backgroundColor: action.background }]}>
              <Ionicons name={action.icon} size={21} color={action.color} />
            </View>
            <Text style={[styles.quickLabel, { color: theme.text }]} numberOfLines={1}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Mes comptes */}
      <Section
        title="Mes comptes"
        caption="Vue d'ensemble"
        right={
          <Pressable onPress={() => router.push("/tabs/accounts")} hitSlop={8}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>Voir tout</Text>
          </Pressable>
        }
      />
      {allAccounts.length > 0 ? (
        <FlatList
          data={allAccounts}
          renderItem={renderAccount}
          keyExtractor={(a) => a.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountList}
        />
      ) : (
        <Text style={{ color: theme.textSecondary }}>Aucun compte.</Text>
      )}

      {/* Transactions récentes */}
      <Section
        title="Transactions récentes"
        caption="5 dernières opérations"
        right={
          <Pressable onPress={() => router.push("/tabs/movements/history")} hitSlop={8}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>Voir tout</Text>
          </Pressable>
        }
      />
      {(operations ?? []).slice(0, 5).map((op) => (
        <Row
          key={op.id}
          title={op.label}
          subtitle={`${op.reference} · ${formatDate(op.date)}`}
          leftBackground={op.direction === "entrant" ? theme.successSoft : theme.dangerSoft}
          left={
            <Ionicons
              name={op.direction === "entrant" ? "arrow-down-outline" : "arrow-up-outline"}
              size={19}
              color={op.direction === "entrant" ? theme.success : theme.danger}
            />
          }
          right={
            <View style={styles.txRight}>
              <Text
                style={[
                  styles.txAmount,
                  { color: op.direction === "entrant" ? theme.success : theme.danger },
                ]}
              >
                {op.direction === "entrant" ? "+" : "-"}
                {formatMoney(op.amount)}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
            </View>
          }
          onPress={() => router.push("/tabs/movements/history")}
        />
      ))}
      {!operations?.length && (
        <Text style={{ color: theme.textSecondary }}>Aucune opération récente.</Text>
      )}

      <PinModal
        visible={pinVisible}
        title="Accès au compte"
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerBody: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  bannerMessage: {
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  headerUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flex: 1,
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    padding: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subGreeting: {
    fontSize: 13,
    marginTop: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },

  balanceCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: "hidden",
  },
  balanceCardWide: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "flex-start",
    padding: Spacing.three,
  },
  balanceSheen: {
    position: "absolute",
    top: -70,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  balanceSheenSoft: {
    position: "absolute",
    bottom: -90,
    left: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(98,166,255,0.20)",
  },
  balanceCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  balanceLabel: {
    color: "#E8F1FC",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  eyeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  eyeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  balanceAmount: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginTop: Spacing.one,
  },
  balanceAmountWide: {
    fontSize: 30,
  },
  balanceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  balanceMetaText: {
    color: "#E8F1FC",
    fontSize: 12,
  },

  quickCard: {
    flexDirection: "row",
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  quickItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  quickItemPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "700",
  },

  txRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  accountList: {
    paddingRight: Spacing.one,
    gap: Spacing.two,
  },
  accountCard: {
    width: 218,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    paddingTop: Spacing.three + Spacing.one,
    gap: 2,
    overflow: "hidden",
  },
  accountAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  accountCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  accountIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  accountCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  accountStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  accountStatusChipText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  accountCardType: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: Spacing.two,
  },
  accountCardNumber: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  accountCardBalance: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: Spacing.one,
    letterSpacing: -0.4,
  },
  accountFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  accountCardStatus: {
    fontSize: 11,
    fontWeight: "600",
  },
});