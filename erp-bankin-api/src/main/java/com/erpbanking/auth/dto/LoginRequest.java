package com.erpbanking.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
public class LoginRequest {
    @Email
    @NotBlank
    private String email;


    @NotBlank
    private String motDePasse;
}
