package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.*;
import com.erpbanking.auth.entity.PasswordResetOtp;
import com.erpbanking.auth.repository.PasswordResetOtpRepository;
import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final ClientRepository clientRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    // private final SmsService smsService; // à activer si disponible
    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public MobileForgotPasswordResponse forgotPassword(MobileForgotPasswordRequest request) {
        String email = normalize(request.getEmail());
        String telephone = normalize(request.getTelephone());
        String cin = normalize(request.getCin());

        Client client = findClient(email, telephone, cin);
        if (client == null) {
            throw new RuntimeException("Aucun compte trouvé avec ces identifiants.");
        }

        String code = String.format("%06d", random.nextInt(1000000));
        LocalDateTime now = LocalDateTime.now();

        otpRepository.deleteByCinOrEmailOrTelephone(
                client.getCin(),
                client.getEmail(),
                client.getTelephone()
        );

        PasswordResetOtp otp = PasswordResetOtp.builder()
                .cin(client.getCin())
                .email(client.getEmail())
                .telephone(client.getTelephone())
                .code(code)
                .expiresAt(now.plusMinutes(10))
                .used(false)
                .createdAt(now)
                .build();
        otpRepository.save(otp);

        String dest = client.getTelephone() != null && !client.getTelephone().isBlank()
                ? client.getTelephone()
                : client.getEmail();
        // smsService.envoyer(dest, "Votre code de réinitialisation ERP Banking : " + code);

        return MobileForgotPasswordResponse.builder()
                .message("Un code de vérification a été envoyé par SMS au numéro associé à votre compte.")
                .build();
    }

    @Override
    @Transactional
    public MobileVerifyOtpResponse verifyOtp(MobileVerifyOtpRequest request) {
        String email = normalize(request.getEmail());
        String telephone = normalize(request.getTelephone());
        String cin = normalize(request.getCin());
        String code = normalize(request.getCode());

        PasswordResetOtp otp = findOtp(email, telephone, cin, code);
        if (otp == null) {
            throw new RuntimeException("Code invalide ou expiré.");
        }
        if (otp.isUsed()) {
            throw new RuntimeException("Ce code a déjà été utilisé.");
        }
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce code a expiré.");
        }

        return MobileVerifyOtpResponse.builder()
                .message("Code vérifié avec succès.")
                .valid(true)
                .build();
    }

    @Override
    @Transactional
    public MobileResetPasswordOtpResponse resetPassword(MobileResetPasswordOtpRequest request) {
        String email = normalize(request.getEmail());
        String telephone = normalize(request.getTelephone());
        String cin = normalize(request.getCin());
        String code = normalize(request.getCode());
        String nouveauMotDePasse = request.getNouveauMotDePasse();

        PasswordResetOtp otp = findOtp(email, telephone, cin, code);
        if (otp == null) {
            throw new RuntimeException("Code invalide ou expiré.");
        }
        if (otp.isUsed()) {
            throw new RuntimeException("Ce code a déjà été utilisé.");
        }
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce code a expiré.");
        }

        Client client = findClient(email, telephone, cin);
        if (client == null) {
            throw new RuntimeException("Aucun compte trouvé.");
        }

        if (nouveauMotDePasse == null || nouveauMotDePasse.length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères.");
        }

        client.setCodePersonnelHash(passwordEncoder.encode(nouveauMotDePasse));
        clientRepository.save(client);

        otp.setUsed(true);
        otp.setUsedAt(LocalDateTime.now());
        otpRepository.save(otp);

        return MobileResetPasswordOtpResponse.builder()
                .message("Mot de passe réinitialisé avec succès.")
                .build();
    }

    private Client findClient(String email, String telephone, String cin) {
        if (email != null && !email.isBlank()) {
            return clientRepository.findByEmail(email).orElse(null);
        }
        if (telephone != null && !telephone.isBlank()) {
            return clientRepository.findByTelephone(telephone).orElse(null);
        }
        if (cin != null && !cin.isBlank()) {
            return clientRepository.findByCin(cin).orElse(null);
        }
        return null;
    }

    private PasswordResetOtp findOtp(String email, String telephone, String cin, String code) {
        if (cin != null && !cin.isBlank()) {
            return otpRepository.findTopByCinAndCodeAndUsedFalseOrderByCreatedAtDesc(cin, code).orElse(null);
        }
        if (email != null && !email.isBlank()) {
            return otpRepository.findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(email, code).orElse(null);
        }
        if (telephone != null && !telephone.isBlank()) {
            return otpRepository.findTopByTelephoneAndCodeAndUsedFalseOrderByCreatedAtDesc(telephone, code).orElse(null);
        }
        return null;
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
