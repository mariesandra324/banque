package com.erpbanking.notification.config;

import java.io.InputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

/**
 * Initialise Firebase Admin à partir du fichier de compte de service.
 * Si le fichier est absent (environnement de développement sans Firebase),
 * l'application démarre en mode dégradé : les push FCM sont simplement ignorés.
 */
@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.service-account:}")
    private String serviceAccountPath;

    @PostConstruct
    public void initialiser() {
        try {
            if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
                System.out.println("FIREBASE : aucun service-account configuré, push FCM désactivé.");
                return;
            }

            ClassPathResource resource = new ClassPathResource(serviceAccountPath);
            if (!resource.exists()) {
                System.out.println("FIREBASE : fichier introuvable  [" + serviceAccountPath + "], push FCM désactivé.");
                return;
            }

            FirebaseOptions options;
            try (InputStream stream = resource.getInputStream()) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(stream))
                        .build();
            }

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("FIREBASE : initialisé avec succès.");
            }
        } catch (Exception e) {
            System.err.println("FIREBASE : échec d'initialisation -> " + e.getMessage());
            e.printStackTrace();
        }
    }
}