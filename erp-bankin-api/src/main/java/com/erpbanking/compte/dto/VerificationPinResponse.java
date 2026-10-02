package com.erpbanking.compte.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerificationPinResponse {
    private boolean valide;
    private String message;
}