package com.erpbanking.compte.dto;

import lombok.Data;

@Data
public class VerificationPinRequest {
    private Long compteId;
    private String pin;
}