package com.erpbanking.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MobileLoginRequest {

    @NotBlank(message = "Le numéro de carte ou de compte est obligatoire")
    private String numero;

    @NotBlank(message = "Le PIN est obligatoire")
    private String pin;
}