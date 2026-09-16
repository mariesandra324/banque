package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.auth.dto.MobileLoginRequest;
import com.erpbanking.auth.dto.MobileLoginResponse;
import com.erpbanking.auth.dto.LoginRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    MobileLoginResponse mobileLogin(MobileLoginRequest request);
}
