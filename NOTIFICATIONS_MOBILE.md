# Notifications — contrat mobile (FCM)

Le backend web envoie des notifications push (FCM) vers une **application mobile séparée**.
Ce document décrit le contrat à implémenter côté mobile.

## 1. Prérequis backend (à faire une fois)

1. Créer un projet Firebase et une application Android/iOS (web push non utilisé ici).
2. Générer la clé de compte de service (Service account → Générer une nouvelle clé privée).
3. Placer le fichier dans : `erp-bankin-api/src/main/resources/firebase/service-account.json`
   (le dossier existe déjà, prêt à recevoir le fichier).
4. Redémarrer l'API. Si tout est bon, aucun message "Firebase non initialisé" n'apparaît.

Sans ce fichier, le backend fonctionne normalement mais les pushes sont **ignorés** (loggués).

## 2. Authentification

Le mobile s'authentifie comme un **CLIENT** sur `POST /api/auth/login`
(`{ email, motDePasse }`) et reçoit un JWT. Ce JWT est requis pour tout appel ci-dessous
(header `Authorization: Bearer <token>`).

## 3. Enregistrement d'un appareil

À faire à chaque connexion (et après chaque rafraîchissement du token FCM).

| Méthode | Endpoint                                      | Corps                                   |
|---------|-----------------------------------------------|-----------------------------------------|
| POST    | `/api/notifications/device-token`             | `{ "token": "<fcm-token>", "plateforme": "ANDROID" \| "IOS" }` |
| DELETE  | `/api/notifications/device-token/{token}`     | — (à la déconnexion / jeton invalide)    |

Réponse POST : `200 OK` (idempotent — réenregistrer le même token ne crée pas de doublon).

## 4. Réception d'un push

Payload :

- **notification.title** : `"<emoji> <Libellé du type>"` (ex. `💰 Dépôt effectué`)
- **notification.body** : le message complet (ex. `Dépôt de 10000 Ar sur le compte az-00100001`)
- **data.type** : identifiant du type de notification (ex. `DEPOT_EFFECTUE`, `ECHEANCE_INPROCHAINE`)
- **data.lien** : clé contextuelle permettant d'ouvrir l'écran concerné :
  - `credit:<id>` → écran du crédit
  - `echeance:<id>` → écran de l'échéance
  - `demande-credit:<id>` → suivi de la demande
  - sinon : référence de transaction (ex. `TR-2026-00123`) ou vide

Comportement recommandé : si l'app est au premier plan, afficher un *in-app banner* ;
sinon, `data.lien` dirige la navigation après tap sur la notification.

## 5. Liste des types de notifications clients

| Type                      | Libellé                    | data.lien            |
|---------------------------|----------------------------|----------------------|
| DEPOT_EFFECTUE            | Dépôt effectué             | référence transaction |
| RETRAIT_EFFECTUE          | Retrait effectué           | référence transaction |
| VIREMENT_EFFECTUE         | Virement effectué          | référence transaction |
| CLIENT_CREE               | Compte client créé         | (vide)               |
| COMPTE_CREE               | Compte bancaire créé       | (vide)               |
| DEMANDE_CREDIT_SOUMISE    | Demande de crédit soumise  | demande-credit:<id>   |
| DEMANDE_CREDIT_DECIDEE    | Décision sur la demande     | demande-credit:<id>   |
| CREDIT_ACCORDE            | Crédit accordé             | credit:<id>            |
| ECHEANCE_INPROCHAINE      | Échéance prochaine         | echeance:<id>          |

## 6. Rappel

L'utilisateur (CLIENT) contrôle les pushes par type dans les paramètres de l'application
(côté mobile) — le backend respecte `pushActive` du type concerné avant l'envoi.