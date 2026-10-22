package com.erpbanking.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MobileVerifyOtpRequest {
    private String email;
    private String telephone;
    private String cin;
    private String code;
}
