package com.erpbanking.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeResponse {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;
    private String codeGuichet;
}