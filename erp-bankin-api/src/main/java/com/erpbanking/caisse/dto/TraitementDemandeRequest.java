package com.erpbanking.caisse.dto;

import lombok.Data;

@Data
public class TraitementDemandeRequest {
    private boolean accepter;
    private String motifRefus;
}
