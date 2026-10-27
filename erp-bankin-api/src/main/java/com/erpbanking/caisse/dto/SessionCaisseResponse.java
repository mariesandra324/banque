package com.erpbanking.caisse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.caisse.entity.SessionCaisse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionCaisseResponse {

    private Long id;
    private Long guichetId;
    private String codeGuichet;
    private Long agentId;
    private String agentNom;
    private String statut;
    private BigDecimal soldeOuverture;
    private BigDecimal soldeTheorique;
    private BigDecimal soldeFermeture;
    private LocalDateTime dateOuverture;
    private LocalDateTime dateFermeture;
    private String observation;

    public static SessionCaisseResponse from(SessionCaisse session) {
        if (session == null) {
            return null;
        }
        String agentNom = null;
        if (session.getAgent() != null) {
            agentNom = ((session.getAgent().getNom() != null ? session.getAgent().getNom() : "")
                    + " "
                    + (session.getAgent().getPrenom() != null ? session.getAgent().getPrenom() : "")).trim();
        }
        return SessionCaisseResponse.builder()
                .id(session.getId())
                .guichetId(session.getGuichet() != null ? session.getGuichet().getId() : null)
                .codeGuichet(session.getGuichet() != null ? session.getGuichet().getCodeGuichet() : null)
                .agentId(session.getAgent() != null ? session.getAgent().getId() : null)
                .agentNom(agentNom)
                .statut(session.getStatut() != null ? session.getStatut().name() : null)
                .soldeOuverture(session.getSoldeOuverture())
                .soldeTheorique(session.getSoldeTheorique())
                .soldeFermeture(session.getSoldeFermeture())
                .dateOuverture(session.getDateOuverture())
                .dateFermeture(session.getDateFermeture())
                .observation(session.getObservation())
                .build();
    }
}
