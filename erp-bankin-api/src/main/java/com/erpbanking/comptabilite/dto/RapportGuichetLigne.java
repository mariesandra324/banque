package com.erpbanking.comptabilite.dto;

import java.math.BigDecimal;

/**
 * Ligne agrégée du rapport de guichet, produite directement par la requête
 * SQL {@code RapportGuichetRepository}. La colonne "solde" n'est pas exposée
 * par la requête : elle se calcule en Java (totalDepots - totalRetraits).
 */
public interface RapportGuichetLigne {

    String getPeriode();

    String getCodeGuichet();

    Long getNombreOperations();

    BigDecimal getTotalDepots();

    BigDecimal getTotalRetraits();

    BigDecimal getTotalVirements();

    BigDecimal getTotalRemboursements();
}
