package com.erpbanking.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class BootstrapStatusResponse {
    private boolean available;
}
