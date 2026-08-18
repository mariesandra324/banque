package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private String motif;
    private LocalDateTime dateDemande;
    private StatutDemandeCredit statut;
    private LocalDateTime dateDecision;
    private String motifRejet;

    private Long clientId;
    private String clientNom;
    private String clientPrenom;
}
