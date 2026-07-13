package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.LoginResponse;

public interface AuthService {
    
    LoginResponse login(LoginRequest request);
}
