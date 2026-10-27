package com.erpbanking.caisse.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class OuvrirSessionRequest {
    /**
     * Facultatif : un agent ouvre toujours la caisse de son propre guichet.
     * Ce champ sert uniquement aux profils sans guichet affecte.
     */
    private Long guichetId;

    private BigDecimal soldeOuverture;
}
