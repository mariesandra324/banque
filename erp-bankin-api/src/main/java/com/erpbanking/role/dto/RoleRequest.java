package com.erpbanking.role.dto;

import org.hibernate.validator.constraints.NotBlank;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
public class RoleRequest {

    @NotBlank(message = "Le nom est obligatoire.")
    @Size(max = 50)
    private String nom;

    @Size(max = 255)
    private String description;
}
