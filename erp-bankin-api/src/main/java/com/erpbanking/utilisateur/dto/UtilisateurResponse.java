package com.erpbanking.utilisateur.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UtilisateurResponse {
    private Long id;

    private String nom;

    private String prenom;

    private String email;

    private String telephone;
    
    private String codeGuichet;

    private String role;

    private Boolean actif;
}
