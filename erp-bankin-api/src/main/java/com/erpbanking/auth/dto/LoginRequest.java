package com.erpbanking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
public class LoginRequest {
    @Email(message = "Format d'email invalide.")
    @NotBlank(message = "L'email est obligatoire.")
    private String email;


    @NotBlank(message = "Le mot de passe est obligatoire.")
    private String motDePasse;
}
