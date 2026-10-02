package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.auth.dto.MobileLoginRequest;
import com.erpbanking.auth.dto.MobileLoginResponse;
import com.erpbanking.client.entity.Client;
import com.erpbanking.client.entity.ClientMobile;
import com.erpbanking.client.entity.StatutMobile;
import com.erpbanking.client.repository.ClientMobileRepository;
import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.compte.entity.Carte;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.security.ClientUserDetails;
import com.erpbanking.security.JwtService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CarteRepository carteRepository;
    private final UtilisateurRepository utilisateurRepository; 
    private final PasswordEncoder passwordEncoder;
    private final CompteRepository compteRepository;
    private final ClientRepository clientRepository;
    private final ClientMobileRepository clientMobileRepository;

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
    String nomComplet = request.getNomComplet().trim();

    // =====================================================
    // 1. RECHERCHER LE CLIENT PAR NOM COMPLET
    // =====================================================

    Client client = findByNomComplet(nomComplet);

    if (client == null) {
        throw new RuntimeException(
                "Nom complet incorrect."
        );
    }

    // =====================================================
    // 2. VÉRIFIER LE MOT DE PASSE (CODE PERSONNEL)
    // =====================================================

    if (client.getCodePersonnelHash() == null
            || !passwordEncoder.matches(
                    request.getMotDePasse(),
                    client.getCodePersonnelHash()
            )) {

        throw new RuntimeException(
                "Mot de passe incorrect."
        );
    }

    // =====================================================
    // 3. VÉRIFIER LE STATUT DE L'ACCÈS MOBILE
    // =====================================================

    ClientMobile accesMobile = clientMobileRepository
            .findByClientId(client.getId())
            .orElseThrow(() ->
                new RuntimeException(
                    "Aucune demande d'accès mobile trouvée. "
                    + "Veuillez vous inscrire depuis l'application."
                )
            );

    if (accesMobile.getStatut() == StatutMobile.EN_ATTENTE) {
        throw new RuntimeException(
                "Votre demande d'accès mobile est en attente "
                + "de validation par l'administration."
        );
    }

    if (accesMobile.getStatut() == StatutMobile.REFUSEE) {
        throw new RuntimeException(
                "Votre demande d'accès mobile a été refusée "
                + "par l'administration."
        );
    }

    if (accesMobile.getStatut() == StatutMobile.BLOQUEE) {
        throw new RuntimeException(
                "Votre accès mobile est bloqué. Contactez votre banque."
        );
    }

    accesMobile.setDerniereConnexion(LocalDateTime.now());
    clientMobileRepository.save(accesMobile);

    // =====================================================
    // 4. GÉNÉRER LE TOKEN
    // =====================================================

    ClientUserDetails clientUserDetails = new ClientUserDetails(client);
    String token = jwtService.generateMobileToken(clientUserDetails, client.getId());

    // =====================================================
    // 5. COMPLÉTER LA RÉPONSE AVEC COMPTE / CARTE (SI EXISTE)
    // =====================================================

    Compte compte = premierCompte(client.getId());
    Carte carte = null;

    if (compte != null) {
        carte = carteRepository.findByCompteId(compte.getId())
                .orElse(null);
    }

    return MobileLoginResponse.builder()
            .token(token)
            .clientId(client.getId())
            .nom(client.getNom())
            .prenom(client.getPrenom())
            .numeroCompte(
                compte != null ? compte.getNumeroCompte() : null
            )
            .numeroCarte(
                carte != null ? carte.getNumeroCarte() : null
            )
            .typeCompte(
                compte != null ? compte.getTypeCompte() : null
            )
            .solde(
                compte != null ? compte.getSolde() : null
            )
            .build();
}

private Client findByNomComplet(String nomComplet) {

    String recherche = nomComplet.trim()
            .toLowerCase(Locale.ROOT)
            .replaceAll("\\s+", " ");

    List<Client> clients = clientRepository.findByNomComplet(recherche);

    if (clients.isEmpty()) {
        return null;
    }

    return clients.get(0);
}

private Compte premierCompte(Long clientId) {

    List<Compte> comptes = compteRepository.findByClientId(clientId);

    return comptes.stream()
            .filter(c -> "ACTIF".equalsIgnoreCase(c.getStatut()))
            .findFirst()
            .orElse(comptes.isEmpty() ? null : comptes.get(0));
}
}