package com.erpbanking.notification.service;

import java.util.List;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.erpbanking.notification.entity.DeviceToken;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.notification.repository.DeviceTokenRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;

/**
 * Envoi de notifications push (FCM) vers les appareils enregistrés d'un client.
 * Non bloquant pour les transactions métier : exécuté en asynchrone.
 */
@Service
@RequiredArgsConstructor
public class FcmPushService {

    private final DeviceTokenRepository deviceTokenRepository;

    @Async
    public void envoyerClient(
            Long clientId,
            NotificationType type,
            String message,
            String lien) {

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                System.out.println("FCM : Firebase non initialisé, push ignoré (client " + clientId + ").");
                return;
            }

            List<DeviceToken> tokens = deviceTokenRepository.findByClientId(clientId);
            if (tokens.isEmpty()) {
                return;
            }

            Notification notification = Notification.builder()
                    .setTitle(type.getEmoji() + " " + type.getLibelle())
                    .setBody(message)
                    .build();

            for (DeviceToken deviceToken : tokens) {
                try {
                    Message push = Message.builder()
                            .setToken(deviceToken.getToken())
                            .setNotification(notification)
                            .putData("type", type.name())
                            .putData("lien", lien == null ? "" : lien)
                            .build();

                    FirebaseMessaging.getInstance().send(push);
                    System.out.println("FCM : push envoyé à " + deviceToken.getToken());

                } catch (FirebaseMessagingException e) {

                    // Un token invalide ou révoqué pollue la base pour rien :
                    // on le supprime au lieu de renvoyer l'échec à chaque notification.
                    MessagingErrorCode code = e.getMessagingErrorCode();

                    if (code == MessagingErrorCode.UNREGISTERED
                            || code == MessagingErrorCode.INVALID_ARGUMENT
                            || code == MessagingErrorCode.SENDER_ID_MISMATCH) {

                        deviceTokenRepository.delete(deviceToken);
                        System.out.println("FCM : token supprimé (" + code + ") pour le client "
                                + clientId);

                    } else {
                        System.err.println("FCM : envoi échoué (" + code + ") -> "
                                + e.getMessage());
                    }

                } catch (Exception e) {
                    System.err.println("FCM : envoi échoué -> " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("FCM : erreur globale -> " + e.getMessage());
        }
    }
}