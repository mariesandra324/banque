package com.erpbanking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BootstrapVerifyRequest {
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    @Email
    private String email;

    private String telephone;

    @NotBlank
    @Size(min = 12)
    private String motDePasse;

    @NotBlank
    @Pattern(regexp = "\\d{6}")
    private String code;
}
