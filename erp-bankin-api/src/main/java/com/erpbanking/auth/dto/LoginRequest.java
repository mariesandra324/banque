package com.erpbanking.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class LoginRequest {
    
    private String email;

    @JsonAlias({"password"})
    private String motDePasse;
}
