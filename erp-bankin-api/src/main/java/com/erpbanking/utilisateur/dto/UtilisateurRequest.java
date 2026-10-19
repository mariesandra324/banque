package com.erpbanking.utilisateur.dto;

import com.erpbanking.guichet.entity.Guichet;

import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class UtilisateurRequest {
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank(message = "L'email est obligatoire.")
    @Email(message = "Format d'email invalide.")
    private String email;

    // Obligatoire à la création uniquement : en modification, un mot de passe
    // vide signifie "conserver le mot de passe actuel".
    @NotBlank(groups = OnCreate.class, message = "Le mot de passe est obligatoire.")
    @Size(min = 8, max = 100, groups = OnCreate.class, message = "Le mot de passe doit contenir au moins 8 caractères.")
    private String motDePasse;

    private String telephone;

    private Long guichetId;

    private Long roleId;
}
