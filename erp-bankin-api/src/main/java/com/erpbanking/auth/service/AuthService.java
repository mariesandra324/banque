package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.AuthResponse;
import com.erpbanking.auth.dto.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);

}
