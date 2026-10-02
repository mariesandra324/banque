package com.erpbanking.audit.entity;

import java.time.LocalDateTime;

import com.erpbanking.utilisateur.entity.Utilisateur;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Journal d'audit : une ligne par action métier importante.
 *
 * L'utilisateur n'est jamais saisi manuellement : il est résolu depuis le
 * SecurityContext par AuditServiceImpl au moment de l'écriture.
 *
 * La relation {@link #utilisateur} est optionnelle pour deux raisons :
 *  - un Client (ClientUserDetails) peut être l'auteur d'une opération sans
 *    être un Utilisateur du personnel ;
 *  - la traçabilité ne doit pas dépendre du cycle de vie du compte (un
 *    utilisateur désactivé reste l'auteur de ses actions passées).
 *
 * Les colonnes utilisateurNom / utilisateurEmail / role sont donc des
 * instantanés figés au moment de l'action, alors que la relation sert à la
 * navigabilité et à l'intégrité référentielle.
 *
 * Aucune donnée sensible (mot de passe, PIN, code personnel) n'est stockée.
 */
@Entity
@Table(
        name = "audit_log",
        indexes = {
                @Index(name = "idx_audit_log_date_action", columnList = "date_action"),
                @Index(name = "idx_audit_log_utilisateur", columnList = "utilisateur_id"),
                @Index(name = "idx_audit_log_module_action", columnList = "module, action")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 30)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "module", nullable = false, length = 30)
    private AuditModule module;

    /** Auteur de l'action. Null si l'auteur est un Client mobile ou une tâche de fond. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    /** Instantané du nom affiché au moment de l'action (ex: "Jean Rakoto"). */
    @Column(name = "utilisateur_nom", length = 200)
    private String utilisateurNom;

    @Column(name = "utilisateur_email", length = 150)
    private String utilisateurEmail;

    /** Rôle au moment de l'action : AGENT, ADMIN, GESTIONNAIRE, CLIENT... */
    @Column(name = "role", length = 50)
    private String role;

    /** Identifiant de l'élément concerné, tel qu'affiché : "Client #125", "0101234567". */
    @Column(name = "entite_id", length = 100)
    private String entiteId;

    @Column(name = "description", length = 500)
    private String description;

    /** Adresse IP de l'appelant, utile pour reconstituer une session. */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @PrePersist
    void prePersist() {
        if (dateAction == null) {
            dateAction = LocalDateTime.now();
        }
    }
}
