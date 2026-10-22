import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiRequest } from "./api";

/**
 * Notifications push FCM.
 *
 * Le backend envoie des messages FCM natifs (Firebase Admin SDK) et non le
 * service de push Expo : on utilise donc `getDevicePushTokenAsync()` et non
 * `getExpoPushTokenAsync()`.
 *
 * Prérequis (indispensable, sinon aucun push n'arrive) :
 *   - `google-services.json` à la racine du projet, référencé par
 *     `android.googleServicesFile` dans app.json
 *   - un *development build* (`npx expo run:android`) : depuis le SDK 53,
 *     les push ne fonctionnent pas dans Expo Go sur Android
 *   - côté backend : `src/main/resources/firebase/service-account.json`
 */

const TOKEN_STOCKAGE = "erpbanking.pushToken";
const CANAL_ID = "erpbanking";

export type PushNotificationData = {
  type?: string;
  lien?: string;
};

/**
 * Comportement quand l'application est au premier plan.
 * En arrière-plan ou tuée, c'est le système qui affiche la notification —
 * ce handler n'est appelé qu'au premier plan.
 *
 * Volontairement registering *dans* une fonction et non au chargement du
 * module : `setNotificationHandler` touche au module natif, et un throw ici
 * interromprait l'évaluation du fichier, laissant tous ses exports à `undefined`
 * et faisant planter le layout racine. C'est exactement ce qui se passait avec
 * un binaire Android compilé sans `expo-notifications`.
 */
function configurerHandlerPremierPlan() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

type ForegroundListener = (data: PushNotificationData) => void;

const foregroundListeners = new Set<ForegroundListener>();

/**
 * Vrai dès qu'un jeton FCM a pu être enregistré auprès du backend.
 *
 * Le backend poussant la même notification sur les deux canaux (SSE + FCM),
 * l'application ne doit afficher qu'un seul bandeau : quand le push fonctionne
 * c'est le système qui l'affiche, le bandeau in-app devient inutile.
 */
let pushConfigure = false;

export function isPushConfigure(): boolean {
  return pushConfigure;
}

/**
 * S'abonner aux push reçues au premier plan.
 * Le retour est un unsubscribe, à appelé au démontage.
 */
export function onForegroundNotification(listener: ForegroundListener): () => void {
  foregroundListeners.add(listener);
  return () => {
    foregroundListeners.delete(listener);
  };
}

function notifierForeground(data: PushNotificationData) {
  foregroundListeners.forEach((listener) => listener(data));
}

/**
 * Crée le canal Android. Obligatoire avant `getDevicePushTokenAsync` :
 * sans canal, Android 13+ n'affiche jamais la demande de permission.
 */
async function assurerCanal() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(CANAL_ID, {
    name: "Notifications ERPBanking",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#208AEF",
  });
}

async function lireTokenStocke(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_STOCKAGE);
  } catch {
    return null;
  }
}

async function ecrireTokenStocke(token: string | null) {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_STOCKAGE, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_STOCKAGE);
    }
  } catch {
    // Le stockage local n'est pas bloquant : le push fonctionnera quand même
    // pour la session en cours, il sera simplement ré-enregistré au prochain login.
  }
}

/**
 * Enregistre (ou ré-enregistre) un jeton FCM auprès du backend.
 * Idempotent : renvoyer le même jeton ne crée pas de doublon.
 */
export async function synchroniserTokenBackend(token: string) {
  await apiRequest<void>("/notifications/device-token", {
    method: "POST",
    body: JSON.stringify({
      token,
      plateforme: Platform.OS === "ios" ? "IOS" : "ANDROID",
    }),
  });
}

/** Retire le jeton côté backend (déconnexion) et en mémoire. */
export async function desenregistrerToken() {
  const token = await lireTokenStocke();
  if (!token) return;

  try {
    await apiRequest<void>(`/notifications/device-token/${encodeURIComponent(token)}`, {
      method: "DELETE",
    });
  } catch {
    // Best effort : un token fantôme sera purgé par le backend à la
    // prochaine erreur FCM (UNREGISTERED).
  }

  await ecrireTokenStocke(null);
}

/**
 * Demande la permission puis récupère le jeton FCM natif et l'envoie au backend.
 * À appeler après `setAuthToken(...)`, car l'API backend exige le JWT.
 *
 * @returns le jeton enregistré, ou null si la permission est refusée
 */
export async function enregistrerPushNotifications(): Promise<string | null> {
  // Pas de notifications push sur simulateur/émulateur : inutile de demander.
  if (!Device.isDevice) {
    return null;
  }

  await assurerCanal();

  const permission = await Notifications.getPermissionsAsync();
  let status = permission.status;

  if (status !== "granted") {
    const demande = await Notifications.requestPermissionsAsync();
    status = demande.status;
  }

  if (status !== "granted") {
    return null;
  }

  const { data: token } = await Notifications.getDevicePushTokenAsync();

  if (!token) {
    return null;
  }

  await synchroniserTokenBackend(token);
  await ecrireTokenStocke(token);

  pushConfigure = true;

  return token;
}

/**
 * Rejoue l'enregistrement au démarrage.
 * Le jeton FCM peut avoir changé (réinstallation, rotation) : on compare avec
 * celui stocké et on ne renvole que s'il a bougé.
 */
export async function resynchroniserAuDemarrage(): Promise<void> {
  if (!Device.isDevice) return;

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") return;

  const { data: token } = await Notifications.getDevicePushTokenAsync();
  if (!token) return;

  if (token === (await lireTokenStocke())) return;

  await synchroniserTokenBackend(token);
  await ecrireTokenStocke(token);

  pushConfigure = true;
}

/**
 * Branche les listeners push.
 *
 * À appeler une seule fois au montage racine (`app/_layout.tsx`) :
 *  - `reçu`      : push au premier plan (le système la montre déjà)
 *  - `réponse`   : tap sur la notification, y compris depuis l'état arrêté
 *  - `token`     : le jeton a été renouvelé par FCM → réenregistrer
 */
export function brancherListenersPush(): () => void {
  // Le module natif peut manquer (binaire compilé avant l'installation de
  // expo-notifications, ou exécution sur une plateforme non supportée) :
  // on désactive le push proprement plutôt que de casser l'application.
  try {
    configurerHandlerPremierPlan();
  } catch {
    return () => {};
  }

  const subscriptionRecu = Notifications.addNotificationReceivedListener((notification) => {
    notifierForeground(
      (notification.request.content.data ?? {}) as PushNotificationData
    );
  });

  const subscriptionReponse = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      notifierForeground(
        (response.notification.request.content.data ?? {}) as PushNotificationData
      );
    }
  );

  const subscriptionToken = Notifications.addPushTokenListener((token) => {
    // Le listener fournit un objet { data, type } : il faut extraire le jeton.
    const nouveauToken = typeof token.data === "string" ? token.data : null;
    if (!nouveauToken) return;

    void synchroniserTokenBackend(nouveauToken)
      .then(() => ecrireTokenStocke(nouveauToken))
      .catch(() => {
        // L'API peut être injoignable : la resync au prochain login rattrapera.
      });
  });

  return () => {
    subscriptionRecu.remove();
    subscriptionReponse.remove();
    subscriptionToken.remove();
  };
}

/**
 * Tap sur une notification alors que l'application était complètement arrêtée :
 * l'événement n'est pas rejoué par le listener, il faut le lire au démarrage.
 */
export function lireDerniereReponsePush(): PushNotificationData | null {
  const reponse = Notifications.getLastNotificationResponse();
  const data = reponse?.notification?.request?.content?.data;

  return data ? (data as PushNotificationData) : null;
}
