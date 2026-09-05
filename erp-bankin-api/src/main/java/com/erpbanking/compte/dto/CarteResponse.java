package com.erpbanking.compte.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder 
public class CarteResponse {
    private Long id;

    private String numeroCarte;

    private LocalDate dateExpiration;

    private String typeCarte;

    private String statut;

    private Long compteId;
}
