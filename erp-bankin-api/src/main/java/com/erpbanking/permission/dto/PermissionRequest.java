package com.erpbanking.permission.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PermissionRequest {
    @NotBlank(message = "Le nom est obligatoire.")
    private String nom;

    private String description;
}
