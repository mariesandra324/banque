package com.erpbanking.compte.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParametresInteretsRequest {

    @NotNull(message = "Le montant pour un compte courant est requis.")
    @DecimalMin(value = "0.00", message = "Le montant pour un compte courant ne peut pas être négatif.")
    @Digits(integer = 12, fraction = 2, message = "Le montant pour un compte courant est invalide.")
    private BigDecimal montantCourant;

    @NotNull(message = "Le montant pour un compte d'épargne est requis.")
    @DecimalMin(value = "0.00", message = "Le montant pour un compte d'épargne ne peut pas être négatif.")
    @Digits(integer = 12, fraction = 2, message = "Le montant pour un compte d'épargne est invalide.")
    private BigDecimal montantEpargne;
}
