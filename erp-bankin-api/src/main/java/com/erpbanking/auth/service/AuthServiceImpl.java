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

        // Génération du JWT
        String token = jwtService.generateToken(utilisateur);

        System.out.println("JWT = " + token);

        return LoginResponse.builder()
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole().getNom())
                .token(token)
                .build();
    }
}