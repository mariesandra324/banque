package com.erpbanking.notification.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

/** Jeton FCM d'un appareil pour l'envoi de notifications push (app mobile). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "device_tokens")
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(length = 20)
    private String plateforme;

    @Builder.Default
    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();
}