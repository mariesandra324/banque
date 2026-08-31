package com.erpbanking.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {


    private final UtilisateurRepository utilisateurRepository;


    @Override
public UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException {


    System.out.println("CHARGEMENT USER : " + email);


    Utilisateur utilisateur =
            utilisateurRepository.findByEmail(email)
            .orElseThrow(
                () -> new UsernameNotFoundException(
                    "Utilisateur introuvable"
                )
            );


    System.out.println(
        "USER TROUVE : " + utilisateur.getEmail()
    );

    System.out.println(
        "HASH BD : " + utilisateur.getPassword()
    );

    return utilisateur;
}
    
}
