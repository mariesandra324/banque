package com.erpbanking.guichet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GuichetRequest {

    @NotBlank(message = "Le code guichet est obligatoire.")
    @Size(max = 5, message = "Le code guichet ne doit pas dépasser 5 caractères.")
    private String codeGuichet;

    private Boolean actif;
}
