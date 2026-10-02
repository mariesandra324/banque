package com.erpbanking.notification.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_notification", nullable = false, length = 50)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(length = 2000)
    private String message;

    /** Route frontend (staff web) ou contexte applicatif mobile (clients). */
    @Column(length = 255)
    private String lien;

    /** Diffusion à tout un rôle (ADMIN, AGENT, GESTIONNAIRE, COMPTABLE). */
    @Column(length = 50)
    private String roleNom;

    /** Ciblage vers un utilisateur du personnel précis. */
    @Column(name = "utilisateur_id")
    private Long utilisateurId;

    /** Ciblage vers un client précis. */
    @Column(name = "client_id")
    private Long clientId;

    @Builder.Default
    private boolean lu = false;

    @Builder.Default
    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();
}