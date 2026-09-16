package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.auth.dto.MobileLoginRequest;
import com.erpbanking.auth.dto.MobileLoginResponse;
import com.erpbanking.client.entity.Client;
import com.erpbanking.compte.entity.Carte;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.security.ClientUserDetails;
import com.erpbanking.security.JwtService;
import com.erpbanking.security.ClientUserDetails;
import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;
import com.erpbanking.compte.repository.CarteRepository;
import com.erpbanking.compte.repository.CompteRepository;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CarteRepository carteRepository;
    private final UtilisateurRepository utilisateurRepository; 
    private final PasswordEncoder passwordEncoder;
    private final CompteRepository compteRepository;

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
        
        String codeGuichet = null;

        if (utilisateur.getGuichet() != null) {
        codeGuichet = utilisateur.getGuichet().getCodeGuichet();
        }
        return LoginResponse.builder()
                .token(token)
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole().getNom())
                .codeGuichet(codeGuichet)
                .build();

    } catch (Exception e) {

        e.printStackTrace();

        throw e;
    }
}

public MobileLoginResponse mobileLogin (MobileLoginRequest request) {
 String numeroCarte = request.getNumero().trim();

    // =====================================================
    // 1. RECHERCHER LA CARTE
    // =====================================================

    Carte carte = carteRepository
            .findByNumeroCarte(numeroCarte)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Numéro de carte incorrect."
                    )
            );

    System.out.println("===== MOBILE LOGIN =====");
    System.out.println("Carte : " + carte.getNumeroCarte());
    System.out.println("Statut carte : [" + carte.getStatut() + "]");


    // =====================================================
    // 2. VÉRIFIER QUE LA CARTE EST ACTIVE
    // =====================================================

    if (!"ACTIF".equalsIgnoreCase(carte.getStatut())) {

        throw new RuntimeException(
                "Cette carte n'est pas active."
        );
    }


    // =====================================================
    // 3. VÉRIFIER LE PIN
    // =====================================================

    boolean pinCorrect = passwordEncoder.matches(
            request.getPin(),
            carte.getPinHash()
    );

    if (!pinCorrect) {

        throw new RuntimeException(
                "Code PIN incorrect."
        );
    }


    // =====================================================
    // 4. RÉCUPÉRER LE COMPTE
    // =====================================================

    Compte compte = carte.getCompte();

    if (compte == null) {

        throw new RuntimeException(
                "Aucun compte associé à cette carte."
        );
    }

    System.out.println(
            "Compte : " + compte.getNumeroCompte()
    );

    System.out.println(
            "Statut compte : [" + compte.getStatut() + "]"
    );


    // =====================================================
    // 5. VÉRIFIER QUE LE COMPTE EST ACTIF
    // =====================================================

    if (!"ACTIF".equalsIgnoreCase(compte.getStatut())) {

        throw new RuntimeException(
                "Ce compte n'est pas actif."
        );
    }
    Client client = compte.getClient();

if (client == null) {
    throw new RuntimeException(
            "Aucun client associé à ce compte."
    );
}
    ClientUserDetails clientUserDetails = new ClientUserDetails(client);
    String token = jwtService.generateMobileToken( clientUserDetails, client.getId() );

    // =====================================================
    // 6. VÉRIFIER LE CLIENT
    // =====================================================

    if (compte.getClient() == null) {

        throw new RuntimeException(
                "Aucun client associé à ce compte."
        );
    }
    return MobileLoginResponse.builder()
            .token(token)
            .clientId(client.getId())
            .nom(client.getNom())
            .prenom(client.getPrenom())
            .numeroCompte(compte.getNumeroCompte())
            .numeroCarte(carte.getNumeroCarte())
            .typeCompte(compte.getTypeCompte())
            .solde(compte.getSolde())
            .build();
}
}