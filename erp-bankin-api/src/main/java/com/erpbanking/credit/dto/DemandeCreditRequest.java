package com.erpbanking.credit.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
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
    @NotNull
    @DecimalMin(value = "1.0")
    private BigDecimal montantDemande;
    
    @NotNull
    @Min(1)
    private Integer duree;

    @NotBlank
    @Size(max = 500)
    private String motif;

    @NotNull
    private Long clientId;
}
