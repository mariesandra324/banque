package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.*;
import com.erpbanking.auth.entity.PasswordResetOtp;
import com.erpbanking.auth.repository.PasswordResetOtpRepository;
import com.erpbanking.compte.service.EmailService;
import com.erpbanking.role.entity.Role;
import com.erpbanking.role.repository.RoleRepository;
import com.erpbanking.security.JwtService;
import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BootstrapServiceImpl implements BootstrapService {
    private static final int OTP_VALIDITE_MINUTES = 10;

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final SecureRandom random = new SecureRandom();

    @Override
    public BootstrapStatusResponse status() {
        return BootstrapStatusResponse.builder()
                .available(utilisateurRepository.count() == 0)
                .build();
    }

    @Override
    @Transactional
    public BootstrapResponse start(BootstrapStartRequest request) {
        if (utilisateurRepository.count() != 0) {
            throw new IllegalStateException("L'initialisation a déjà été effectuée.");
        }

        String email = normalizeEmail(request.getEmail());
        if (utilisateurRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }

        if (request.getTelephone() != null && !request.getTelephone().isBlank()
                && utilisateurRepository.existsByTelephone(request.getTelephone().trim())) {
            throw new IllegalArgumentException("Ce numéro de téléphone est déjà utilisé.");
        }

        otpRepository.deleteByEmail(email);

        String code = String.format("%06d", random.nextInt(1000000));
        LocalDateTime now = LocalDateTime.now();
        otpRepository.save(PasswordResetOtp.builder()
                .email(email)
                .telephone(normalizeOptional(request.getTelephone()))
                .code(code)
                .expiresAt(now.plusMinutes(OTP_VALIDITE_MINUTES))
                .used(false)
                .createdAt(now)
                .build());

        try {
            emailService.envoyerCodeInitialisation(email, request.getPrenom().trim(), code);
        } catch (Exception e) {
            throw new IllegalStateException("Impossible d'envoyer le code de vérification.");
        }

        return BootstrapResponse.builder()
                .message("Un code de vérification a été envoyé à votre adresse e-mail.")
                .build();
    }

    @Override
    @Transactional
    public LoginResponse verify(BootstrapVerifyRequest request) {
        if (utilisateurRepository.count() != 0) {
            throw new IllegalStateException("L'initialisation a déjà été effectuée.");
        }

        String email = normalizeEmail(request.getEmail());
        PasswordResetOtp otp = otpRepository
                .findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(email, request.getCode().trim())
                .orElseThrow(() -> new IllegalArgumentException("Code invalide."));

        if (otp.isUsed() || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Code invalide ou expiré.");
        }

        Role role = roleRepository.findByNom("ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .nom("ADMIN")
                        .description("Administrateur")
                        .actif(true)
                        .build()));

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom().trim())
                .prenom(request.getPrenom().trim())
                .email(email)
                .telephone(normalizeOptional(request.getTelephone()))
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .actif(true)
                .role(role)
                .build();
        utilisateur = utilisateurRepository.save(utilisateur);

        otp.setUsed(true);
        otp.setUsedAt(LocalDateTime.now());
        otpRepository.save(otp);

        String token = jwtService.generateToken(utilisateur);
        return LoginResponse.builder()
                .token(token)
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole().getNom())
                .codeGuichet(null)
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
