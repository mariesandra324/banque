package com.erpbanking.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MobileLoginRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    private String nomComplet;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}
