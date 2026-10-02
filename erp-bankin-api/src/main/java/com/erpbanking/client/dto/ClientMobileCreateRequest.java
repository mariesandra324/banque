package com.erpbanking.client.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
public class ClientMobileCreateRequest {
    @NotBlank(message = "L'identifiant est obligatoire")
    private String identifiant;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}
