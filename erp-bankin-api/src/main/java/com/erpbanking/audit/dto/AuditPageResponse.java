package com.erpbanking.audit.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Page de journal d'audit + métadonnées de pagination consommées par le tableau
 * de l'écran Rapports.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditPageResponse {

    private List<AuditLogResponse> contenu;
    private int page;
    private int taille;
    private long totalElements;
    private int totalPages;
    private boolean premiere;
    private boolean derniere;

    public static AuditPageResponse from(Page<AuditLogResponse> page) {
        return AuditPageResponse.builder()
                .contenu(page.getContent())
                .page(page.getNumber())
                .taille(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .premiere(page.isFirst())
                .derniere(page.isLast())
                .build();
    }
}
