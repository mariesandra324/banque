package com.erpbanking.notification.entity;

import jakarta.persistence.*;
import lombok.*;

/** Préférence d'un utilisateur (staff ou client) pour un type de notification. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    @Column(name = "client_id")
    private Long clientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_notification", nullable = false, length = 50)
    private NotificationType type;

    /** Cloche navbar / push FCM. Par défaut actif. */
    @Builder.Default
    @Column(name = "push_active", nullable = false)
    private Boolean pushActive = true;

    /** Envoi email. Par défaut actif. */
    @Builder.Default
    @Column(name = "email_active", nullable = false)
    private Boolean emailActive = true;
}