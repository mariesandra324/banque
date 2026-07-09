package com.erpbanking.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import com.erpbanking.auth.dto.AuthResponse;
import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.security.jwt.JwtService;
import com.erpbanking.utilisateur.entity.Utilisateur;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl 
    implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getMotDePasse()));

        Utilisateur utilisateur = (Utilisateur) authentication.getPrincipal();

        String token = jwtService.generateToken(utilisateur);

        return AuthResponse.builder()
                .token(token)
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole().getNom())
                .build();
    }
}
