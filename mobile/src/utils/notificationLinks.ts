/**
 * Résolution du champ `data.lien` envoyé par le backend (voir
 * NOTIFICATIONS_MOBILE.md §4) vers une route expo-router.
 *
 * Une seule source de vérité : l'écran de liste des notifications et le
 * deep-link depuis une notification push appellent tous les deux cette
 * fonction, pour qu'un tap mène exactement au même endroit quel que soit
 * le chemin d'arrivée.
 */
export type NotificationTarget =
  | { pathname: "/tabs/credits/offer/[id]"; params: { id: string } }
  | { pathname: "/tabs/credits/loan/[id]"; params: { id: string } }
  | { pathname: "/tabs/credits/requests" }
  | { pathname: "/tabs/credits/loans" }
  | { pathname: "/tabs/credits/offers" };

/**
 * Extrait l'id d'un lien de la forme `prefixe:<id>`.
 * L'id peut être absent ou vide : dans ce cas on renvoie null plutôt que
 * de pousser une route avec un id `undefined`.
 */
function extraireId(lien: string, prefixe: string): string | null {
  const valeur = lien.slice(prefixe.length).trim();
  return valeur.length > 0 ? valeur : null;
}

/**
 * @param lien valeur du champ `lien` (notifications en base et data des push)
 * @returns la route à ouvrir, ou null si le lien ne cible rien de connu
 */
export function resolveNotificationLink(lien: string | null | undefined): NotificationTarget | null {
  if (!lien) return null;

  const value = lien.trim();

  // Offre de crédit : c'est la seule cible qui autorise le client à agir
  // (accepter / refuser) depuis son téléphone.
  if (value.startsWith("offre-credit:")) {
    const id = extraireId(value, "offre-credit:");
    return id ? { pathname: "/tabs/credits/offer/[id]", params: { id } } : null;
  }

  if (value.startsWith("demande-credit:")) {
    // Pas d'écran de détail pour une demande : on ouvre la liste.
    return { pathname: "/tabs/credits/requests" };
  }

  if (value.startsWith("credit:")) {
    const id = extraireId(value, "credit:");
    return id ? { pathname: "/tabs/credits/loan/[id]", params: { id } } : null;
  }

  if (value.startsWith("echeance:")) {
    // L'id d'échéance n'est pas un id de crédit : l'ouvrir sur l'écran
    // "loan/[id]" afficherait un écran vide. On renvoie vers la liste.
    return { pathname: "/tabs/credits/loans" };
  }

  return null;
}
