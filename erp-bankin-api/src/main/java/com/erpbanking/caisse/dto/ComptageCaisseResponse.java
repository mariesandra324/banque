package com.erpbanking.caisse.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.erpbanking.caisse.entity.ComptageCaisse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComptageCaisseResponse {

    private Long id;
    private Long sessionCaisseId;
    private Long guichetId;
    private String codeGuichet;
    private Long agentId;
    private BigDecimal montantTheorique;
    private BigDecimal montantPhysique;
    private BigDecimal ecart;
    private Integer billets10000;
    private Integer billets5000;
    private Integer billets2000;
    private Integer billets1000;
    private Integer pieces500;
    private Integer pieces200;
    private Integer pieces100;
    private Integer pieces50;
    private Integer pieces20;
    private Integer pieces10;
    private Integer pieces5;
    private Integer pieces1;
    private LocalDateTime dateComptage;
    private String observation;

    public static ComptageCaisseResponse from(ComptageCaisse comptage) {
        if (comptage == null) {
            return null;
        }
        return ComptageCaisseResponse.builder()
                .id(comptage.getId())
                .sessionCaisseId(comptage.getSessionCaisse() != null ? comptage.getSessionCaisse().getId() : null)
                .guichetId(comptage.getGuichet() != null ? comptage.getGuichet().getId() : null)
                .codeGuichet(comptage.getGuichet() != null ? comptage.getGuichet().getCodeGuichet() : null)
                .agentId(comptage.getAgent() != null ? comptage.getAgent().getId() : null)
                .montantTheorique(comptage.getMontantTheorique())
                .montantPhysique(comptage.getMontantPhysique())
                .ecart(comptage.getEcart())
                .billets10000(comptage.getBillets10000())
                .billets5000(comptage.getBillets5000())
                .billets2000(comptage.getBillets2000())
                .billets1000(comptage.getBillets1000())
                .pieces500(comptage.getPieces500())
                .pieces200(comptage.getPieces200())
                .pieces100(comptage.getPieces100())
                .pieces50(comptage.getPieces50())
                .pieces20(comptage.getPieces20())
                .pieces10(comptage.getPieces10())
                .pieces5(comptage.getPieces5())
                .pieces1(comptage.getPieces1())
                .dateComptage(comptage.getDateComptage())
                .observation(comptage.getObservation())
                .build();
    }
}
