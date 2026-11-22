import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect, useRef } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexte/AuthContext';
import {
  ThemeModeProvider,
  resolveThemeMode,
  useThemeMode,
} from '@/contexte/ThemeContext';
import {
  brancherListenersPush,
  lireDerniereReponsePush,
  onForegroundNotification,
  resynchroniserAuDemarrage,
} from '@/services/pushNotifications';
import { resolveNotificationLink } from '@/utils/notificationLinks';

SplashScreen.preventAutoHideAsync();

/**
 * Redirige vers l'écran correspondant au `data.lien` d'une notification push.
 * Ne s'exécute qu'une fois l'utilisateur connecté : sans session, les écrans
 * clients (offre, crédit) n'ont rien à afficher.
 *
 * Doit être monté à l'intérieur de `AuthProvider` (il consomme `useAuth`).
 */
function NotificationDeepLinkBridge() {
  const { user } = useAuth();
  const traiterLien = useRef<(lien?: string) => void>(() => {});
  // `getLastNotificationResponse` renvoie toujours la même réponse tant qu'une
  // autre n'est pas reçue : on la consomme une seule fois, sinon chaque
  // changement d'identité de `user` rejouerait la navigation.
  const reponseConsommee = useRef(false);

  useEffect(() => {
    traiterLien.current = (lien?: string) => {
      if (!lien) return;

      const cible = resolveNotificationLink(lien);
      if (!cible) return;

      router.push(cible as never);
    };
  }, []);

  useEffect(() => {
    const desabonner = brancherListenersPush();
    const retirerListener = onForegroundNotification((data) =>
      traiterLien.current(data.lien)
    );

    return () => {
      desabonner();
      retirerListener();
    };
  }, []);

  useEffect(() => {
    if (!user || reponseConsommee.current) return;

    // Tap sur une notification alors que l'app était arrêtée : l'événement
    // n'est pas rejoué par le listener, il faut le lire explicitement.
    const data = lireDerniereReponsePush();
    if (data?.lien) {
      reponseConsommee.current = true;
      traiterLien.current(data.lien);
    }

    resynchroniserAuDemarrage().catch(() => {
      // Resync opportuniste : ignorée en cas d'échec.
    });
  }, [user]);

  return null;
}

function RootNavigator() {
  const systemScheme = useColorScheme();
  const { mode } = useThemeMode();
  const scheme = resolveThemeMode(mode, systemScheme);

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <NotificationDeepLinkBridge />
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <RootNavigator />
    </ThemeModeProvider>
  );
}
