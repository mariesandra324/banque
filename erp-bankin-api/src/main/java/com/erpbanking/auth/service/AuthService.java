package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.auth.dto.LoginRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);

}
