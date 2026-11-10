package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.auth.dto.MobileLoginRequest;
import com.erpbanking.auth.dto.MobileLoginResponse;
import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.BootstrapAdminRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse bootstrapAdmin(BootstrapAdminRequest request, String bootstrapSecret);
    boolean isBootstrapAvailable();
    MobileLoginResponse mobileLogin(MobileLoginRequest request);
}
