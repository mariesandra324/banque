package com.erpbanking.compte.service;

import java.time.LocalDate;
import java.util.List;

import com.erpbanking.compte.dto.CompteRequest;
import com.erpbanking.compte.dto.CompteResponse;

public interface CompteService {

    private String genererNumeroCompte(Long id) {
        int annee = LocalDate.now().getYear();

        return "100" + annee + String.format("%06d", id);
    }
    
    CompteResponse create(CompteRequest request);

    String previewNumeroCompte(Long clientId, String typeCompte);

    List<CompteResponse> findAll();

    CompteResponse findById(Long id);

    CompteResponse update(Long id, CompteRequest request);

    void delete(Long id);

    /**
     * Crédite les intérêts mensuels (montant fixe) sur chaque compte ouvert
     * dès qu'un mois (30 jours) s'est écoulé depuis la création du compte
     * ou depuis le dernier versement. Exécuté automatiquement par le
     * planificateur Spring.
     */
    void appliquerInteretsMensuels();
}
