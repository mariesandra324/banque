package com.erpbanking.compte.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompteResponse {
    private Long id;

    private String numeroCompte;
    private String typeCompte;
    private  BigDecimal solde;
    private String statut;
    private LocalDate dateCreation;
    private Long clientId;
    private String codeBanque;
    private String codeGuichet;
    private String cleRib;
    private String iban;
}
