package com.erpbanking.permission.dto;

import lombok.*;

@Data
@Builder
public class PermissionResponse {
    private Long id;

    private String nom;

    private String description;

    private Boolean actif;
}
