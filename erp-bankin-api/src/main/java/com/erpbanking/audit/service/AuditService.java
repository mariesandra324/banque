package com.erpbanking.audit.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;

import com.erpbanking.audit.dto.AuditFiltresResponse;
import com.erpbanking.audit.dto.AuditLogResponse;
import com.erpbanking.audit.dto.AuditPageResponse;
import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;

public interface AuditService {

    /**
     * Enregistre une action dans le journal. L'utilisateur, son rôle, l'adresse IP
     * et la date sont résolus automatiquement depuis le SecurityContext : rien n'est
     * fourni par l'appelant, donc rien ne peut être falsifié.
     *
     * L'écriture participate à la transaction métier courante : si l'action
     * métier est annulée, sa trace d'audit l'est aussi.
     */
    void journaliser(AuditAction action, AuditModule module, String entiteId, String description);

    AuditPageResponse consulter(Long utilisateurId,
                                String role,
                                String module,
                                String action,
                                LocalDateTime depuis,
                                LocalDateTime jusqua,
                                String recherche,
                                Pageable pageable);

    AuditFiltresResponse filtres();

    /** Export CSV du journal filtré, dans le même ordre et les mêmes colonnes que l'écran. */
    String exporterCsv(Long utilisateurId,
                       String role,
                       String module,
                       String action,
                       LocalDateTime depuis,
                       LocalDateTime jusqua);
}
