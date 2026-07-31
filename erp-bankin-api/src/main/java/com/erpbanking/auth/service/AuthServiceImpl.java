package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.security.JwtService;
import com.erpbanking.utilisateur.entity.Utilisateur;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
public LoginResponse login(LoginRequest request) {

    try {

        System.out.println("AVANT AUTHENTIFICATION");

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getMotDePasse()
                        )
                );

        System.out.println("AUTH OK");

        Utilisateur utilisateur =
                (Utilisateur) authentication.getPrincipal();

        String token = jwtService.generateToken(utilisateur);

        return LoginResponse.builder()
                .token(token)
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole().getNom())
                .build();

    } catch (Exception e) {

        e.printStackTrace();

        throw e;
    }
}
}