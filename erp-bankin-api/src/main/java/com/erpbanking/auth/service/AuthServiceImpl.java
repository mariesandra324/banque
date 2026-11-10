package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.LoginRequest;
import com.erpbanking.auth.dto.LoginResponse;
import com.erpbanking.auth.dto.BootstrapAdminRequest;
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
import com.erpbanking.role.entity.Role;
import com.erpbanking.role.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import com.erpbanking.compte.repository.CarteRepository;
import com.erpbanking.compte.repository.CompteRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
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
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompteRepository compteRepository;
    private final ClientRepository clientRepository;
    private final ClientMobileRepository clientMobileRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.bootstrap.secret:}")
    private String bootstrapSecret;

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

    @Override
    @Transactional
    public LoginResponse bootstrapAdmin(BootstrapAdminRequest request, String suppliedSecret) {
        if (bootstrapSecret == null || bootstrapSecret.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "L'initialisation du premier administrateur n'est pas configurée."
            );
        }

        if (suppliedSecret == null || !MessageDigest.isEqual(
                bootstrapSecret.getBytes(StandardCharsets.UTF_8),
                suppliedSecret.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Secret d'initialisation invalide.");
        }

        jdbcTemplate.execute("SELECT pg_advisory_xact_lock(734921046)");
        if (utilisateurRepository.count() != 0 || roleRepository.existsByNom("SUPER_ADMIN")) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "L'initialisation est déjà terminée."
            );
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (utilisateurRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé.");
        }

        Role role = roleRepository.findByNom("SUPER_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .nom("SUPER_ADMIN")
                        .description("Administrateur initial avec tous les accès")
                        .actif(true)
                        .build()));
        role.setActif(true);

        Utilisateur utilisateur = utilisateurRepository.save(Utilisateur.builder()
                .nom(request.getNom().trim())
                .prenom(request.getPrenom().trim())
                .email(email)
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(role)
                .actif(true)
                .build());

        return LoginResponse.builder()
                .token(jwtService.generateToken(utilisateur))
                .email(utilisateur.getEmail())
                .role(role.getNom())
                .build();
    }

    @Override
    public boolean isBootstrapAvailable() {
        return bootstrapSecret != null
                && !bootstrapSecret.isBlank()
                && utilisateurRepository.count() == 0
                && !roleRepository.existsByNom("SUPER_ADMIN");
    }

public MobileLoginResponse mobileLogin (MobileLoginRequest request) {
    String nomComplet = request.getNomComplet().trim();

    // =====================================================
    // 1. RECHERCHER LE CLIENT PAR NOM COMPLET
    // =====================================================

    List<Client> candidats = findByNomComplet(nomComplet);

    if (candidats.isEmpty()) {
        throw new RuntimeException(
                "Nom complet incorrect."
        );
    }

    // =====================================================
    // 2. VÉRIFIER LE MOT DE PASSE (CODE PERSONNEL)
    // =====================================================

    // Plusieurs clients peuvent partager le même nom complet (doublons en
    // base). On ne peut donc pas se contenter du premier résultat : le mot
    // de passe doit être vérifié sur chaque homonyme pour retrouver le bon
    // client, sinon une réinitialisation sur l'un est ignorée si l'autre
    // est renvoyé en premier par la requête.
    Client client = candidats.stream()
            .filter(c -> c.getCodePersonnelHash() != null
                    && passwordEncoder.matches(
                            request.getMotDePasse(),
                            c.getCodePersonnelHash()
                    ))
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                    "Mot de passe incorrect."
            ));

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

private List<Client> findByNomComplet(String nomComplet) {

    String recherche = nomComplet.trim()
            .toLowerCase(Locale.ROOT)
            .replaceAll("\\s+", " ");

    return clientRepository.findByNomComplet(recherche);
}

private Compte premierCompte(Long clientId) {

    List<Compte> comptes = compteRepository.findByClientId(clientId);

    return comptes.stream()
            .filter(c -> "ACTIF".equalsIgnoreCase(c.getStatut()))
            .findFirst()
            .orElse(comptes.isEmpty() ? null : comptes.get(0));
}
}