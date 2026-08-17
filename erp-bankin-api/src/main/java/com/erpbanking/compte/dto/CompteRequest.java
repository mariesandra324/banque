package com.erpbanking.compte.dto;

import java.math.BigDecimal;


import lombok.*;

@Data

public class CompteRequest {
    private String numeroCompte;
    
    private String typeCompte;

    private  BigDecimal solde;

    private String statut;

    private Long clientId;
    
}
