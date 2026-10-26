package com.erpbanking.role.dto;

import java.util.Set;

import org.hibernate.validator.constraints.NotBlank;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
public class RoleRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    @Size(max = 50, message = "Le nom ne doit pas dépasser 50 caractères.")
    private String nom;

    @Size(max = 255, message = "La description ne doit pas dépasser 255 caractères.")
    private String description;

    private Boolean actif;

    private Set<Long> permissionIds;
}
