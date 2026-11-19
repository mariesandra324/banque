package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.BootstrapResponse;
import com.erpbanking.auth.dto.BootstrapStartRequest;
import com.erpbanking.auth.dto.BootstrapStatusResponse;
import com.erpbanking.auth.dto.BootstrapVerifyRequest;
import com.erpbanking.auth.dto.LoginResponse;

public interface BootstrapService {
    BootstrapStatusResponse status();
    BootstrapResponse start(BootstrapStartRequest request);
    LoginResponse verify(BootstrapVerifyRequest request);
}
