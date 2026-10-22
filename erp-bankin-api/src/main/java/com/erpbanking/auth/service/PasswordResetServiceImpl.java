package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.*;
import com.erpbanking.auth.entity.PasswordResetOtp;
import com.erpbanking.auth.repository.PasswordResetOtpRepository;
import com.erpbanking.client.entity.Client;
import com.erpbanking.client.entity.ClientMobile;
import com.erpbanking.client.entity.StatutMobile;
import com.erpbanking.client.repository.ClientMobileRepository;
import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.compte.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImpl.class);

    private static final int OTP_VALIDITE_MINUTES = 10;
    private static final int MOT_DE_PASSE_MIN_LONGUEUR = 6;

    private final ClientRepository clientRepository;
    private final ClientMobileRepository clientMobileRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public MobileForgotPasswordResponse forgotPassword(MobileForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        String telephone = normalizeTelephone(request.getTelephone());
        String cin = normalize(request.getCin());

        Client client = findClient(email, telephone, cin);
        if (client == null) {
            throw new RuntimeException("Aucun compte trouvé avec ces identifiants.");
        }

        verifierAccesMobile(client);

        if (client.getEmail() == null || client.getEmail().isBlank()) {
            throw new RuntimeException(
                    "Aucune adresse e-mail n'est associée à ce compte. "
                    + "Contactez votre banque."
            );
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
                .expiresAt(now.plusMinutes(OTP_VALIDITE_MINUTES))
                .used(false)
                .createdAt(now)
                .build();
        otpRepository.save(otp);

        try {
            emailService.envoyerCodeReinitialisation(
                    client.getEmail(),
                    client.getPrenom(),
                    code
            );
        } catch (Exception e) {
            log.error("Echec de l'envoi de l'OTP de reinitialisation pour le client {}",
                    client.getId(), e);
            throw new RuntimeException(
                    "Impossible d'envoyer le code de vérification. Réessayez plus tard."
            );
        }

        log.debug("OTP de reinitialisation genere pour le client {}", client.getId());

        return MobileForgotPasswordResponse.builder()
                .message("Un code de vérification a été envoyé à l'adresse e-mail "
                        + "associée à votre compte.")
                .build();
    }

    @Override
    @Transactional
    public MobileVerifyOtpResponse verifyOtp(MobileVerifyOtpRequest request) {
        Client client = findClient(
                normalizeEmail(request.getEmail()),
                normalizeTelephone(request.getTelephone()),
                normalize(request.getCin())
        );
        if (client == null) {
            throw new RuntimeException("Aucun compte trouvé avec ces identifiants.");
        }

        PasswordResetOtp otp = findOtpForClient(client, normalize(request.getCode()));
        validerOtp(otp);

        return MobileVerifyOtpResponse.builder()
                .message("Code vérifié avec succès.")
                .valid(true)
                .build();
    }

    @Override
    @Transactional
    public MobileResetPasswordOtpResponse resetPassword(MobileResetPasswordOtpRequest request) {
        Client client = findClient(
                normalizeEmail(request.getEmail()),
                normalizeTelephone(request.getTelephone()),
                normalize(request.getCin())
        );
        if (client == null) {
            throw new RuntimeException("Aucun compte trouvé avec ces identifiants.");
        }

        PasswordResetOtp otp = findOtpForClient(client, normalize(request.getCode()));
        validerOtp(otp);

        String nouveauMotDePasse = request.getNouveauMotDePasse();
        String confirmation = request.getConfirmationMotDePasse();

        if (nouveauMotDePasse == null || nouveauMotDePasse.isBlank()) {
            throw new RuntimeException("Le nouveau mot de passe est obligatoire.");
        }
        if (nouveauMotDePasse.length() < MOT_DE_PASSE_MIN_LONGUEUR) {
            throw new RuntimeException("Le mot de passe doit contenir au moins "
                    + MOT_DE_PASSE_MIN_LONGUEUR + " caractères.");
        }
        if (confirmation != null && !confirmation.equals(nouveauMotDePasse)) {
            throw new RuntimeException("Les deux mots de passe ne correspondent pas.");
        }

        String hash = passwordEncoder.encode(nouveauMotDePasse);

        // Le login mobile vérifie Client.codePersonnelHash : c'est ce champ
        // qui doit être mis à jour. ClientMobile.motDePasseHash est conservé
        // synchronisé pour les autres usages (changement de mot de passe).
        client.setCodePersonnelHash(hash);
        clientRepository.save(client);

        Optional<ClientMobile> accesMobile = clientMobileRepository.findByClientId(client.getId());
        accesMobile.ifPresent(acces -> {
            acces.setMotDePasseHash(hash);
            clientMobileRepository.save(acces);
        });

        otp.setUsed(true);
        otp.setUsedAt(LocalDateTime.now());
        otpRepository.save(otp);

        log.info("Mot de passe mobile reinitialise pour le client {}", client.getId());

        return MobileResetPasswordOtpResponse.builder()
                .message("Mot de passe réinitialisé avec succès.")
                .build();
    }

    /**
     * Seuls les clients disposant d'un accès mobile utilisable peuvent
     * réinitialiser leur code personnel depuis l'application.
     */
    private void verifierAccesMobile(Client client) {
        ClientMobile accesMobile = clientMobileRepository.findByClientId(client.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Aucun accès mobile n'est associé à ce compte. "
                        + "Veuillez vous inscrire depuis l'application."
                ));

        if (accesMobile.getStatut() == StatutMobile.BLOQUEE) {
            throw new RuntimeException(
                    "Votre accès mobile est bloqué. Contactez votre banque."
            );
        }
        if (accesMobile.getStatut() == StatutMobile.REFUSEE) {
            throw new RuntimeException(
                    "Votre demande d'accès mobile a été refusée par l'administration."
            );
        }
    }

    private Client findClient(String email, String telephone, String cin) {
        List<Client> candidats = new ArrayList<>();

        if (email != null) {
            candidats.addAll(clientRepository.findAllByEmailIgnoreCase(email));
        }

        if (telephone != null) {
            for (String variante : variantesTelephone(telephone)) {
                candidats.addAll(clientRepository.findAllByTelephone(variante));
            }
        }

        if (cin != null) {
            clientRepository.findByCin(cin).ifPresent(candidats::add);
        }

        return choisirClient(candidats);
    }

    /**
     * Plusieurs clients peuvent partager le meme e-mail ou le meme telephone
     * en base. On privilegie celui qui possede un acces mobile actif, puis
     * l'unique client disposant d'un acces mobile, afin de laisser ensuite
     * verifierAccesMobile produire un message precis (bloque, refuse...).
     */
    private Client choisirClient(List<Client> candidats) {
        Map<Long, Client> uniques = new LinkedHashMap<>();
        for (Client client : candidats) {
            uniques.putIfAbsent(client.getId(), client);
        }

        if (uniques.isEmpty()) {
            return null;
        }

        Client clientActif = null;
        Client clientAvecAcces = null;
        int nombreAvecAcces = 0;

        for (Client client : uniques.values()) {
            Optional<ClientMobile> acces =
                    clientMobileRepository.findByClientId(client.getId());

            if (acces.isEmpty()) {
                continue;
            }

            nombreAvecAcces++;
            clientAvecAcces = client;

            if (acces.get().getStatut() == StatutMobile.ACTIVE) {
                if (clientActif != null) {
                    throw new RuntimeException(
                            "Plusieurs comptes actifs correspondent a ces identifiants. "
                            + "Contactez votre banque."
                    );
                }
                clientActif = client;
            }
        }

        if (clientActif != null) {
            return clientActif;
        }
        if (nombreAvecAcces == 1) {
            return clientAvecAcces;
        }
        if (uniques.size() == 1) {
            return uniques.values().iterator().next();
        }

        return null;
    }

    /**
     * Retrouve l'OTP à partir de l'identité du client (et non du format saisi
     * par l'utilisateur), pour que les variantes de numéro de téléphone et la
     * casse de l'e-mail n'empêchent pas la vérification.
     */
    private PasswordResetOtp findOtpForClient(Client client, String code) {
        if (code == null || code.isBlank()) {
            return null;
        }

        Optional<PasswordResetOtp> otp =
                otpRepository.findTopByCinAndCodeAndUsedFalseOrderByCreatedAtDesc(
                        client.getCin(), code);

        if (otp.isEmpty()) {
            otp = otpRepository.findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(
                    client.getEmail(), code);
        }

        if (otp.isEmpty()) {
            otp = otpRepository.findTopByTelephoneAndCodeAndUsedFalseOrderByCreatedAtDesc(
                    client.getTelephone(), code);
        }

        return otp.orElse(null);
    }

    private void validerOtp(PasswordResetOtp otp) {
        if (otp == null) {
            throw new RuntimeException("Code invalide ou expiré.");
        }
        if (otp.isUsed()) {
            throw new RuntimeException("Ce code a déjà été utilisé.");
        }
        if (otp.getExpiresAt() == null || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce code a expiré.");
        }
    }

    private List<String> variantesTelephone(String telephone) {
        Set<String> variantes = new LinkedHashSet<>();
        variantes.add(telephone);

        String chiffres = telephone.replaceAll("[^0-9]", "");
        if (!chiffres.isBlank()) {
            variantes.add(chiffres);

            if (chiffres.startsWith("261") && chiffres.length() > 3) {
                variantes.add("0" + chiffres.substring(3));
            } else if (chiffres.startsWith("0")) {
                variantes.add("261" + chiffres.substring(1));
            }
        }

        return new ArrayList<>(variantes);
    }

    private String normalizeEmail(String value) {
        String trimmed = normalize(value);
        return trimmed == null ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    private String normalizeTelephone(String value) {
        String trimmed = normalize(value);
        if (trimmed == null) {
            return null;
        }
        return trimmed.replaceAll("[\\s().-]", "");
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
