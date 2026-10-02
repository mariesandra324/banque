package com.erpbanking.audit.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Valeurs disponibles pour les filtres de l'écran d'audit.
 * Alimente les listes déroulantes sans exposer de données du journal.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditFiltresResponse {

    private List<String> roles;
    private List<String> modules;
    private List<String> actions;
    private List<UtilisateurFiltre> utilisateurs;
    private long totalEntrees;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisateurFiltre {
        private Long id;
        private String nom;
        private String email;
        private String role;
    }
}
