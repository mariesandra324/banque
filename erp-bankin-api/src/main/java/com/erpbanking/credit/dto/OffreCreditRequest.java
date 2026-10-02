package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OffreCreditRequest {

    @NotNull(message = "La demande de crédit est requise.")
    private Long demandeCreditId;

    @NotNull(message = "Le montant proposé est requis.")
    @DecimalMin(value = "1.00", message = "Le montant proposé doit être supérieur à 0.")
    @Digits(integer = 13, fraction = 2, message = "Le montant proposé est trop élevé ou trop précis.")
    private BigDecimal montantPropose;

    @NotNull(message = "Le taux d'intérêt est requis.")
    @DecimalMin(value = "0.00", message = "Le taux d'intérêt ne peut pas être négatif.")
    @Digits(integer = 3, fraction = 2, message = "Le taux d'intérêt ne peut pas dépasser 999.99 %.")
    private BigDecimal tauxInteret;

    @NotNull(message = "La durée est requise.")
    @Min(value = 1, message = "La durée doit être d'au moins 1 mois.")
    @Max(value = 600, message = "La durée ne peut pas dépasser 600 mois (50 ans).")
    private Integer duree;

    @NotNull(message = "La mensualité est requise.")
    @DecimalMin(value = "0.01", message = "La mensualité doit être supérieure à 0.")
    @Digits(integer = 13, fraction = 2, message = "La mensualité est trop précise ou trop élevée.")
    private BigDecimal mensualite;

    @NotNull(message = "La date d'expiration est requise.")
    @Future(message = "La date d'expiration doit être dans le futur.")
    private LocalDate dateExpiration;

    @Size(max = 4000, message = "Les conditions ne peuvent pas dépasser 4000 caractères.")
    private String conditions;
}
