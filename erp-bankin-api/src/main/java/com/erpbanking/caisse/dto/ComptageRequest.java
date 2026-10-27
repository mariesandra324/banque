package com.erpbanking.caisse.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ComptageRequest {
    private Long sessionCaisseId;
    private Long guichetId;
    private BigDecimal montantTheorique;
    private Integer billets10000 = 0;
    private Integer billets5000 = 0;
    private Integer billets2000 = 0;
    private Integer billets1000 = 0;
    private Integer pieces500 = 0;
    private Integer pieces200 = 0;
    private Integer pieces100 = 0;
    private Integer pieces50 = 0;
    private Integer pieces20 = 0;
    private Integer pieces10 = 0;
    private Integer pieces5 = 0;
    private Integer pieces1 = 0;
    private String observation;
}
