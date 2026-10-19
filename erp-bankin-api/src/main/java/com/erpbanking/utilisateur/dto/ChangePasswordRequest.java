package com.erpbanking.utilisateur.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "L'ancien mot de passe est obligatoire.")
    private String ancienMotDePasse;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire.")
    @Size(min = 8, max = 100, message = "Le mot de passe doit contenir au moins 8 caractères.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$",
            message = "Le mot de passe doit contenir au moins une lettre, un chiffre et un caractère spécial."
    )
    private String nouveauMotDePasse;

    @NotBlank(message = "La confirmation du mot de passe est obligatoire.")
    private String confirmationMotDePasse;
}
