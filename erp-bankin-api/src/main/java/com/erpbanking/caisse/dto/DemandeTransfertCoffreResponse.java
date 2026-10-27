package com.erpbanking.caisse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.caisse.entity.DemandeTransfertCoffre;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeTransfertCoffreResponse {

    private Long id;
    private Long guichetId;
    private String codeGuichet;
    private Long agentDemandeurId;
    private String agentDemandeurNom;
    private Long gestionnaireId;
    private String gestionnaireNom;
    private BigDecimal montant;
    private String motif;
    private String statut;
    private LocalDateTime dateDemande;
    private LocalDateTime dateTraitement;
    private String motifRefus;

    public static DemandeTransfertCoffreResponse from(DemandeTransfertCoffre demande) {
        if (demande == null) {
            return null;
        }
        return DemandeTransfertCoffreResponse.builder()
                .id(demande.getId())
                .guichetId(demande.getGuichet() != null ? demande.getGuichet().getId() : null)
                .codeGuichet(demande.getGuichet() != null ? demande.getGuichet().getCodeGuichet() : null)
                .agentDemandeurId(demande.getAgentDemandeur() != null ? demande.getAgentDemandeur().getId() : null)
                .agentDemandeurNom(nomComplet(demande.getAgentDemandeur()))
                .gestionnaireId(demande.getGestionnaire() != null ? demande.getGestionnaire().getId() : null)
                .gestionnaireNom(nomComplet(demande.getGestionnaire()))
                .montant(demande.getMontant())
                .motif(demande.getMotif())
                .statut(demande.getStatut() != null ? demande.getStatut().name() : null)
                .dateDemande(demande.getDateDemande())
                .dateTraitement(demande.getDateTraitement())
                .motifRefus(demande.getMotifRefus())
                .build();
    }

    private static String nomComplet(com.erpbanking.utilisateur.entity.Utilisateur utilisateur) {
        if (utilisateur == null) {
            return null;
        }
        return ((utilisateur.getNom() != null ? utilisateur.getNom() : "")
                + " "
                + (utilisateur.getPrenom() != null ? utilisateur.getPrenom() : "")).trim();
    }
}
