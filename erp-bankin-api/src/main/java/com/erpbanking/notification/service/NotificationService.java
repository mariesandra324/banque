package com.erpbanking.notification.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.notification.dto.NotificationPreferenceDto;
import com.erpbanking.notification.dto.NotificationResponse;
import com.erpbanking.notification.entity.DeviceToken;
import com.erpbanking.notification.entity.Notification;
import com.erpbanking.notification.entity.NotificationPreference;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.notification.repository.DeviceTokenRepository;
import com.erpbanking.notification.repository.NotificationPreferenceRepository;
import com.erpbanking.notification.repository.NotificationRepository;
import com.erpbanking.notification.service.CurrentUserService.IdentiteCourante;
import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

/**
 * Création, lecture et diffusion des notifications métier.
 *
 * Canaux gérés :
 * <ul>
 *   <li>Cloche navbar (staff) / liste in-app : notif persistée en base</li>
 *   <li>Temps réel : broadcast SSE aux émetteurs connectés du destinataire</li>
 *   <li>Push FCM : envoyé aux appareils enregistrés du client</li>
 * </ul>
 * Les préférences par type (push et email) sont respectées à la diffusion
 * et à la lecture.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int LIMITE_LISTE = 50;
    private static final int LIMITE_VISION = 500;

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationSseHub sseHub;
    private final FcmPushService fcmPushService;
    private final CurrentUserService currentUserService;

    // =========================================================
    // CREATION (points d'appel métier)
    // =========================================================

    @Transactional
    public NotificationResponse creerPourRole(
            NotificationType type,
            String message,
            String lien) {

        Notification notification = Notification.builder()
                .type(type)
                .titre(type.getLibelle())
                .message(message)
                .lien(lien)
                .roleNom(type.getRoleCible())
                .build();

        Notification saved = notificationRepository.save(notification);
        diffuserPourRole(saved);
        return toResponse(saved);
    }

    @Transactional
    public NotificationResponse creerPourUtilisateur(
            Long utilisateurId,
            NotificationType type,
            String message,
            String lien) {

        Notification notification = Notification.builder()
                .type(type)
                .titre(type.getLibelle())
                .message(message)
                .lien(lien)
                .utilisateurId(utilisateurId)
                .build();

        Notification saved = notificationRepository.save(notification);

        utilisateurRepository.findById(utilisateurId).ifPresent(utilisateur -> {
            if (pushActivePourStaff(utilisateurId, type)) {
                sseHub.broadcast("email:" + utilisateur.getEmail(), toResponse(saved));
            }
        });

        return toResponse(saved);
    }

    @Transactional
    public NotificationResponse creerPourClient(
            Long clientId,
            NotificationType type,
            String message,
            String lien) {

        Notification notification = Notification.builder()
                .type(type)
                .titre(type.getLibelle())
                .message(message)
                .lien(lien)
                .clientId(clientId)
                .build();

        Notification saved = notificationRepository.save(notification);

        if (pushActivePourClient(clientId, type)) {
            sseHub.broadcast("client:" + clientId, toResponse(saved));
            fcmPushService.envoyerClient(clientId, type, message, lien);
        }

        return toResponse(saved);
    }

    // =========================================================
    // LECTURE (utilisateur courant)
    // =========================================================

    @Transactional(readOnly = true)
    public List<NotificationResponse> listerPourCourant() {

        IdentiteCourante identite = currentUserService.identite();
        if (identite == null) {
            return List.of();
        }

        List<Notification> notifications;
        if (identite.isClient()) {
            notifications = notificationRepository.findPourClient(
                    identite.clientId(), PageRequest.of(0, LIMITE_VISION));
        } else if (identite.isStaff()) {
            notifications = notificationRepository.findPourUtilisateur(
                    rolesNormalise(identite.roleNom()),
                    identite.utilisateurId(),
                    PageRequest.of(0, LIMITE_VISION));
        } else {
            return List.of();
        }

        List<NotificationResponse> resultat = new ArrayList<>();
        for (Notification notification : notifications) {
            if (!preferenceAutorise(identite, notification.getType())) {
                continue;
            }
            resultat.add(toResponse(notification));
            if (resultat.size() >= LIMITE_LISTE) {
                break;
            }
        }
        return resultat;
    }

    @Transactional(readOnly = true)
    public long compterNonLuesPourCourant() {

        IdentiteCourante identite = currentUserService.identite();
        if (identite == null) {
            return 0;
        }

        List<Notification> nonLues;
        if (identite.isClient()) {
            nonLues = notificationRepository.findNonLuesClient(
                    identite.clientId(), PageRequest.of(0, LIMITE_VISION));
        } else if (identite.isStaff()) {
            nonLues = notificationRepository.findNonLuesUtilisateur(
                    rolesNormalise(identite.roleNom()),
                    identite.utilisateurId(),
                    PageRequest.of(0, LIMITE_VISION));
        } else {
            return 0;
        }

        return nonLues.stream()
                .filter(n -> preferenceAutorise(identite, n.getType()))
                .count();
    }

    @Transactional
    public void marquerLue(Long id) {

        IdentiteCourante identite = currentUserService.identite();
        if (identite == null) {
            return;
        }

        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null || !appartientA(identite, notification)) {
            return;
        }

        if (!notification.isLu()) {
            notification.setLu(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void marquerToutesLues() {

        IdentiteCourante identite = currentUserService.identite();
        if (identite == null) {
            return;
        }

        List<Notification> nonLues;
        if (identite.isClient()) {
            nonLues = notificationRepository.findNonLuesClient(
                    identite.clientId(), PageRequest.of(0, LIMITE_VISION));
        } else if (identite.isStaff()) {
            nonLues = notificationRepository.findNonLuesUtilisateur(
                    rolesNormalise(identite.roleNom()),
                    identite.utilisateurId(),
                    PageRequest.of(0, LIMITE_VISION));
        } else {
            return;
        }

        for (Notification notification : nonLues) {
            if (preferenceAutorise(identite, notification.getType())) {
                notification.setLu(true);
            }
        }
        notificationRepository.saveAll(nonLues);
    }

    // =========================================================
    // PRÉFÉRENCES par type
    // =========================================================

    @Transactional(readOnly = true)
    public List<NotificationPreferenceDto> preferencesPourCourant() {

        IdentiteCourante identite = currentUserService.identite();
        List<NotificationPreferenceDto> resultat = new ArrayList<>();

        for (NotificationType type : NotificationType.values()) {

            boolean emailActive = true;
            boolean pushActive = true;
            NotificationPreference preference = null;

            if (identite != null && identite.isClient()) {
                preference = preferenceRepository
                        .findByClientIdAndType(identite.clientId(), type)
                        .orElse(null);
            } else if (identite != null && identite.isStaff()) {
                preference = preferenceRepository
                        .findByUtilisateurIdAndType(identite.utilisateurId(), type)
                        .orElse(null);
            }

            if (preference != null) {
                emailActive = preference.getEmailActive() == null || preference.getEmailActive();
                pushActive = preference.getPushActive() == null || preference.getPushActive();
            }

            resultat.add(NotificationPreferenceDto.builder()
                    .type(type)
                    .libelle(type.getLibelle())
                    .emoji(type.getEmoji())
                    .roleCible(type.getRoleCible())
                    .emailActive(emailActive)
                    .pushActive(pushActive)
                    .build());
        }

        return resultat;
    }

    @Transactional
    public void majPreferences(List<NotificationPreferenceDto> toggles) {

        IdentiteCourante identite = currentUserService.identite();
        if (identite == null || toggles == null) {
            return;
        }

        for (NotificationPreferenceDto dto : toggles) {
            if (dto.getType() == null) {
                continue;
            }

            NotificationPreference preference;
            if (identite.isClient()) {
                preference = preferenceRepository
                        .findByClientIdAndType(identite.clientId(), dto.getType())
                        .orElseGet(() -> NotificationPreference.builder()
                                .clientId(identite.clientId())
                                .type(dto.getType())
                                .build());
            } else {
                preference = preferenceRepository
                        .findByUtilisateurIdAndType(identite.utilisateurId(), dto.getType())
                        .orElseGet(() -> NotificationPreference.builder()
                                .utilisateurId(identite.utilisateurId())
                                .type(dto.getType())
                                .build());
            }

            preference.setEmailActive(dto.isEmailActive());
            preference.setPushActive(dto.isPushActive());
            preferenceRepository.save(preference);
        }
    }

    // =========================================================
    // CLOCHES EMAIL (point d'appel métier)
    // =========================================================

    /** Contrôle l'envoi de l'email d'un événement selon la préférence du client. */
    public boolean emailActivePourClient(Long clientId, NotificationType type) {
        return preferenceRepository.findByClientIdAndType(clientId, type)
                .map(p -> p.getEmailActive() == null || p.getEmailActive())
                .orElse(true);
    }

    /** Vérifie qu'une notification du type donné existe déjà pour ce client et ce lien. */
    @Transactional(readOnly = true)
    public boolean existeDeja(Long clientId, NotificationType type, String lien) {
        return notificationRepository.existsByClientIdAndTypeAndLien(clientId, type, lien);
    }

    // =========================================================
    // JETONS FCM (app mobile client)
    // =========================================================

    @Transactional
    public void enregistrerTokenClient(String token, String plateforme) {

        if (token == null || token.isBlank()) {
            return;
        }

        IdentiteCourante identite = currentUserService.identite();
        if (identite == null) {
            return;
        }

        DeviceToken existing = deviceTokenRepository.findByToken(token).orElse(null);
        if (existing != null) {
            existing.setClientId(identite.isClient() ? identite.clientId() : null);
            existing.setUtilisateurId(identite.isStaff() ? identite.utilisateurId() : null);
            deviceTokenRepository.save(existing);
            return;
        }

        DeviceToken deviceToken = DeviceToken.builder()
                .token(token)
                .plateforme(plateforme)
                .clientId(identite.isClient() ? identite.clientId() : null)
                .utilisateurId(identite.isStaff() ? identite.utilisateurId() : null)
                .build();

        deviceTokenRepository.save(deviceToken);
    }

    @Transactional
    public void supprimerToken(String token) {
        deviceTokenRepository.findByToken(token)
                .ifPresent(deviceTokenRepository::delete);
    }

    // =========================================================
    // OUTILS INTERNES
    // =========================================================

    private void diffuserPourRole(Notification notification) {

        List<Utilisateur> utilisateurs = new ArrayList<>();
        for (String role : rolesNormalise(notification.getType().getRoleCible())) {
            utilisateurs.addAll(utilisateurRepository.findByRole_Nom(role));
        }

        for (Utilisateur utilisateur : utilisateurs) {
            if (!Boolean.TRUE.equals(utilisateur.getActif())) {
                continue;
            }
            if (pushActivePourStaff(utilisateur.getId(), notification.getType())) {
                sseHub.broadcast("email:" + utilisateur.getEmail(), toResponse(notification));
            }
        }
    }

    private boolean appartientA(IdentiteCourante identite, Notification notification) {

        if (identite.isClient()) {
            return notification.getClientId() != null
                    && notification.getClientId().equals(identite.clientId());
        }

        if (identite.isStaff()) {
            if (notification.getUtilisateurId() != null
                    && notification.getUtilisateurId().equals(identite.utilisateurId())) {
                return true;
            }
            if (notification.getRoleNom() != null) {
                return rolesNormalise(identite.roleNom()).contains(notification.getRoleNom());
            }
        }

        return false;
    }

    private boolean preferenceAutorise(IdentiteCourante identite, NotificationType type) {
        if (identite.isClient()) {
            return pushActivePourClient(identite.clientId(), type);
        }
        return pushActivePourStaff(identite.utilisateurId(), type);
    }

    private boolean pushActivePourClient(Long clientId, NotificationType type) {
        return preferenceRepository.findByClientIdAndType(clientId, type)
                .map(p -> p.getPushActive() == null || p.getPushActive())
                .orElse(true);
    }

    private boolean pushActivePourStaff(Long utilisateurId, NotificationType type) {
        return preferenceRepository.findByUtilisateurIdAndType(utilisateurId, type)
                .map(p -> p.getPushActive() == null || p.getPushActive())
                .orElse(true);
    }

    /**
     * Normalise les rôles : GESTIONNAIRE et GESTIONNAIRE sont traités
     * comme équivalents (le frontend utilise GESTIONNAIRE, le backend crédit
     * GESTIONNAIRE).
     */
    private Collection<String> rolesNormalise(String role) {
        if ("GESTIONNAIRE".equals(role)) {
            return List.of("GESTIONNAIRE", "GESTIONNAIRE");
        }
        if ("GESTIONNAIRE".equals(role)) {
            return List.of("GESTIONNAIRE", "GESTIONNAIRE");
        }
        return List.of(role == null ? "" : role);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .titre(notification.getTitre())
                .message(notification.getMessage())
                .lien(notification.getLien())
                .lu(notification.isLu())
                .dateCreation(notification.getDateCreation())
                .emoji(notification.getType() != null ? notification.getType().getEmoji() : null)
                .build();
    }
}