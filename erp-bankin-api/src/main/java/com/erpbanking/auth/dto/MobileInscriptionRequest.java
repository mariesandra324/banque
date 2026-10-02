package com.erpbanking.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MobileInscriptionRequest {

    @NotBlank(message = "Le CIN est obligatoire.")
    @Size(min = 12, max = 12, message = "Le CIN doit contenir exactement 12 chiffres.")
    @Pattern(regexp = "\\d{12}", message = "Le CIN doit contenir uniquement des chiffres.")
    private String cin;

    @NotBlank(message = "Le nom complet est obligatoire.")
    private String nomComplet;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères.")
    private String motDePasse;
}
