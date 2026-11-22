package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditRequest {

    @NotNull(message = "La demande de crédit est requise.")
    private Long demandeCreditId;
    @NotNull(message = "Le montant est requis.")
    @DecimalMin(value = "0.01", inclusive = true, message = "Le montant doit être supérieur à zéro.")
    @Digits(integer = 13, fraction = 2, message = "Le montant est invalide.")
    private BigDecimal montant;
    @NotNull(message = "Le taux est requis.")
    @DecimalMin(value = "0.00", inclusive = true, message = "Le taux ne peut pas être négatif.")
    private BigDecimal tauxInteret;
    @NotNull(message = "La durée est requise.")
    @Min(value = 1, message = "La durée doit être d'au moins un mois.")
    private Integer duree;
    @NotNull(message = "La mensualité est requise.")
    @DecimalMin(value = "0.01", inclusive = true, message = "La mensualité doit être supérieure à zéro.")
    private BigDecimal mensualite;
    @NotNull(message = "La date de début est requise.")
    private LocalDateTime dateDebut;
    private String profession;
    private String typeContrat;
    private BigDecimal revenuMensuel;
    private BigDecimal chargesMensuelles;
}
