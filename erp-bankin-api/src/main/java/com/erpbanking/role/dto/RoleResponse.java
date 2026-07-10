package com.erpbanking.role.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleResponse {
    private Long id;

    private String nom;

    private String description;

    private Boolean actif;

    private LocalDateTime dateCreation;
}
