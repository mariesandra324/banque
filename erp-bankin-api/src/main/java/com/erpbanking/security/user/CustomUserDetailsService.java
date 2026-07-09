package com.erpbanking.security.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.*;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {


    private final UtilisateurRepository utilisateurRepository;


    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {


        return utilisateurRepository
                .findByEmail(email)
                .orElseThrow(
                    () -> new UsernameNotFoundException(
                        "Utilisateur introuvable"
                    )
                );

    }
    
}
