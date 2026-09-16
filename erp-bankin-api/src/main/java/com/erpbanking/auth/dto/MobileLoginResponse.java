package com.erpbanking.auth.dto;

import java.math.BigDecimal;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MobileLoginResponse {
    private String token;
    private Long clientId;
    private String nom;
    private String prenom;
    private String numeroCompte;
    private String numeroCarte;
    private String typeCompte;
    private BigDecimal solde;
}
