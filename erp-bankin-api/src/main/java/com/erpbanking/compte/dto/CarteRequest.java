package com.erpbanking.compte.dto;

import lombok.Data;

@Data 
public class CarteRequest {
    private Long compteId;

    private String typeCarte;
}
