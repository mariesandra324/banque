package com.erpbanking.auth.controller;


import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.auth.dto.MeResponse;
import com.erpbanking.auth.dto.MobileLoginRequest;
import com.erpbanking.auth.dto.MobileLoginResponse;
import com.erpbanking.auth.service.AuthService;
import com.erpbanking.utilisateur.entity.Utilisateur;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthService authService;



    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ){


        return ResponseEntity.ok(
                authService.login(request)
        );

    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(
            @AuthenticationPrincipal Utilisateur utilisateur
    ){
 
        return ResponseEntity.ok(
                MeResponse.builder()
                        .nom(utilisateur.getNom())
                        .prenom(utilisateur.getPrenom())
                        .email(utilisateur.getEmail())
                        .telephone(utilisateur.getTelephone())
                        .role(utilisateur.getRole().getNom())
                        .codeGuichet(
                            utilisateur.getGuichet() != null
                                ? utilisateur.getGuichet().getCodeGuichet()
                                : null
                        )
                        .build()
        );
 
    }

    @PostMapping("/mobile/login")
        public ResponseEntity<MobileLoginResponse> mobileLogin(
                @RequestBody MobileLoginRequest request
        ) {

        return ResponseEntity.ok(
                authService.mobileLogin(request)
        );
        }

        
}