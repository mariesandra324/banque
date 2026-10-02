package com.erpbanking.audit.dto;

import java.time.LocalDateTime;

import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Ligne du journal d'audit telle qu'affichée dans le tableau de l'écran Rapports.
 * Aucun champ sensible n'est exposé ici.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private LocalDateTime dateAction;

    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurEmail;
    private String role;

    private AuditAction action;
    private String actionLibelle;

    private AuditModule module;
    private String moduleLibelle;

    private String entiteId;
    private String description;
    private String ipAddress;
}
