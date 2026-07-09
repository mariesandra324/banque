package com.erpbanking.auth.dto;

import lombok.*;

@Data
@Builder
public class AuthResponse {
    private String token;


    private String email;


    private String role;
}
