package com.erpbanking.auth.service;


import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.LoginResponse;
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



    @Override
    public LoginResponse login(LoginRequest request) {

        System.out.println("AVANT AUTHENTIFICATION");
        System.out.println("REQUEST EMAIL : " + request.getEmail());
        System.out.println("REQUEST PASSWORD PRESENT : " + (request.getMotDePasse() != null));
        System.out.println("REQUEST PASSWORD LENGTH : " + (request.getMotDePasse() == null ? 0 : request.getMotDePasse().length()));

        try {

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

                return LoginResponse.builder()
                        .email(utilisateur.getEmail())
                        .role(utilisateur.getRole().getNom())
                        .token("TOKEN")
                        .build();

                } catch (Exception e) {

                e.printStackTrace();

                throw e;
        }

    }

}