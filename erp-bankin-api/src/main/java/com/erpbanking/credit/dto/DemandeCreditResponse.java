package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.erpbanking.credit.entity.StatutDemandeCredit;

import lombok.*;

@Getter
@Builder
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemandeCreditResponse {
    
    private Long id;
    private BigDecimal montantDemande;
    private Integer duree;
    private BigDecimal tauxInteret;
    private String motif;
    private LocalDateTime dateDemande;
    private StatutDemandeCredit statut;
    private LocalDateTime dateDecision;
    private String motifRejet;

    private String profession;
    private String typeContrat;
    private BigDecimal revenuMensuel;
    private BigDecimal chargesMensuelles;

    private Long clientId;
    private String clientNom;
    private String clientPrenom;

    private Long compteId;

    private List<PieceJointeResponse> piecesJointes;
}
