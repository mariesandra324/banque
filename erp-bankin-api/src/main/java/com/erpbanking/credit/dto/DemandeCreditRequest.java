package com.erpbanking.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemandeCreditRequest {
    @NotNull(message = "Le montant demandé est requis.")
    @DecimalMin(value = "1.0", message = "Le montant demandé doit être supérieur à 0.")
    @Digits(integer = 13, fraction = 2, message = "Le montant demandé est trop élevé ou trop précis.")
    private BigDecimal montantDemande;
    
    @NotNull(message = "La durée est requise.")
    @Min(value = 1, message = "La durée doit être d'au moins 1 mois.")
    private Integer duree;

    @NotBlank(message = "Le motif est requis.")
    @Size(max = 500, message = "Le motif ne peut pas dépasser 500 caractères.")
    private String motif;

    @NotNull(message = "Le client est requis.")
    private Long clientId;
    
    private Long compteId;
    
    private String profession;

    private BigDecimal tauxInteret;

    private LocalDateTime dateDecision;

    private String typeContrat;

    private BigDecimal revenuMensuel;

    private BigDecimal chargesMensuelles;
}
