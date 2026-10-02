package com.erpbanking.audit.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.erpbanking.audit.dto.AuditFiltresResponse;
import com.erpbanking.audit.dto.AuditLogResponse;
import com.erpbanking.audit.dto.AuditPageResponse;
import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditLog;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.repository.AuditLogRepository;
import com.erpbanking.security.ClientUserDetails;
import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private static final int TAILLE_PAGE_MAX = 200;
    private static final int LIGNE_EXPORT_MAX = 10_000;
    private static final int TAILLE_DESCRIPTION = 500;

    /**
     * Mots jamais autorisés dans une trace d'audit, quel que soit le module.
     * Le contrôle est défensif : les appelants ne construisent déjà pas de
     * description avec ces informations.
     */
    private static final List<String> TERMES_INTERDITS = List.of(
            "motdepasse", "mot_de_passe", "password", "pwd",
            "pin", "code_personnel", "codepersonnel", "secret", "token"
    );

    private final AuditLogRepository auditLogRepository;
    private final UtilisateurRepository utilisateurRepository;

    // ---------------------------------------------------------------- écriture

    @Override
    @Transactional
    public void journaliser(AuditAction action,
                            AuditModule module,
                            String entiteId,
                            String description) {

        AuditLog log = AuditLog.builder()
                .dateAction(LocalDateTime.now())
                .action(action)
                .module(module)
                .entiteId(sanitizer(entiteId, 100))
                .description(sanitizer(description, TAILLE_DESCRIPTION))
                .ipAddress(adresseIp())
                .build();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication == null ? null : authentication.getPrincipal();

        if (principal instanceof Utilisateur utilisateur) {
            // Cas nominal : un membre du personnel connecté.
            log.setUtilisateur(utilisateur);
            log.setUtilisateurNom(nomComplet(utilisateur));
            log.setUtilisateurEmail(utilisateur.getEmail());
            log.setRole(utilisateur.getRole() != null ? utilisateur.getRole().getNom() : null);

        } else if (principal instanceof ClientUserDetails clientUserDetails) {
            // Cas mobile : un Client agit sans être un Utilisateur du personnel.
            var client = clientUserDetails.getClient();
            log.setUtilisateurNom(nomComplet(client.getPrenom(), client.getNom()));
            log.setUtilisateurEmail(client.getEmail());
            log.setRole("CLIENT");

        } else {
            // Tâche de fond (job planifié) : aucun auteur, trace conservée.
            log.setUtilisateurNom("Système");
            log.setRole("SYSTEME");
        }

        auditLogRepository.save(log);
    }

    // ---------------------------------------------------------------- lecture

    @Override
    @Transactional(readOnly = true)
    public AuditPageResponse consulter(Long utilisateurId,
                                       String role,
                                       String module,
                                       String action,
                                       LocalDateTime depuis,
                                       LocalDateTime jusqua,
                                       String recherche,
                                       Pageable pageable) {

        Pageable securise = pageable == null
                ? PageRequest.of(0, 20, triParDateDecroissante())
                : PageRequest.of(
                        Math.max(pageable.getPageNumber(), 0),
                        Math.min(Math.max(pageable.getPageSize(), 1), TAILLE_PAGE_MAX),
                        pageable.getSort().isSorted() ? pageable.getSort() : triParDateDecroissante());

        Page<AuditLog> resultat = auditLogRepository.findAll(
                AuditLogRepository.filtres(
                        utilisateurId,
                        normaliser(role),
                        normaliser(module),
                        normaliser(action),
                        depuis,
                        jusqua,
                        recherche),
                securise);

        Page<AuditLogResponse> page = resultat.map(this::versResponse);

        return AuditPageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditFiltresResponse filtres() {

        Map<Long, Utilisateur> utilisateurs = utilisateurRepository
                .findAllById(auditLogRepository.distinctUtilisateurIds())
                .stream()
                .collect(Collectors.toMap(Utilisateur::getId, Function.identity()));

        List<AuditFiltresResponse.UtilisateurFiltre> listeUtilisateurs =
                auditLogRepository.distinctUtilisateurIds().stream()
                        .map(utilisateurs::get)
                        .filter(java.util.Objects::nonNull)
                        .map(u -> AuditFiltresResponse.UtilisateurFiltre.builder()
                                .id(u.getId())
                                .nom(nomComplet(u))
                                .email(u.getEmail())
                                .role(u.getRole() != null ? u.getRole().getNom() : null)
                                .build())
                        .toList();

        return AuditFiltresResponse.builder()
                .roles(auditLogRepository.distinctRoles())
                .modules(auditLogRepository.distinctModules())
                .actions(auditLogRepository.distinctActions())
                .utilisateurs(listeUtilisateurs)
                .totalEntrees(auditLogRepository.count())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String exporterCsv(Long utilisateurId,
                              String role,
                              String module,
                              String action,
                              LocalDateTime depuis,
                              LocalDateTime jusqua) {

        List<AuditLog> lignes = auditLogRepository.findAll(
                        AuditLogRepository.filtres(
                                utilisateurId,
                                normaliser(role),
                                normaliser(module),
                                normaliser(action),
                                depuis,
                                jusqua,
                                null),
                        PageRequest.of(0, LIGNE_EXPORT_MAX, triParDateDecroissante()))
                .getContent();

        StringBuilder csv = new StringBuilder();
        csv.append('\uFEFF'); // BOM : Excel lit alors l'UTF-8 correctement
        csv.append("Date;Utilisateur;Role;Action;Module;Element concerne;Description;IP\n");

        for (AuditLog log : lignes) {
            csv.append(csvCell(formatDate(log.getDateAction()))).append(';')
               .append(csvCell(log.getUtilisateurNom())).append(';')
               .append(csvCell(log.getRole())).append(';')
               .append(csvCell(log.getAction() == null ? null : log.getAction().getLibelle())).append(';')
               .append(csvCell(log.getModule() == null ? null : log.getModule().getLibelle())).append(';')
               .append(csvCell(log.getEntiteId())).append(';')
               .append(csvCell(log.getDescription())).append(';')
               .append(csvCell(log.getIpAddress()))
               .append('\n');
        }

        return csv.toString();
    }

    // ------------------------------------------------------------------ outils

    private Sort triParDateDecroissante() {
        return Sort.by(Sort.Order.desc("dateAction"), Sort.Order.desc("id"));
    }

    private AuditLogResponse versResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .dateAction(log.getDateAction())
                .utilisateurId(log.getUtilisateur() != null ? log.getUtilisateur().getId() : null)
                .utilisateurNom(log.getUtilisateurNom())
                .utilisateurEmail(log.getUtilisateurEmail())
                .role(log.getRole())
                .action(log.getAction())
                .actionLibelle(log.getAction() == null ? null : log.getAction().getLibelle())
                .module(log.getModule())
                .moduleLibelle(log.getModule() == null ? null : log.getModule().getLibelle())
                .entiteId(log.getEntiteId())
                .description(log.getDescription())
                .ipAddress(log.getIpAddress())
                .build();
    }

    private String nomComplet(Utilisateur utilisateur) {
        return nomComplet(utilisateur.getPrenom(), utilisateur.getNom());
    }

    private String nomComplet(String prenom, String nom) {
        return ((prenom == null ? "" : prenom.trim()) + " " + (nom == null ? "" : nom.trim())).trim();
    }

    private String formatDate(LocalDateTime dateAction) {
        return dateAction == null
                ? ""
                : dateAction.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    /** Normalise un paramètre de filtre : vide -> null, sinon en majuscules. */
    private String normaliser(String valeur) {
        if (valeur == null) {
            return null;
        }
        String taille = valeur.trim();
        return taille.isEmpty() ? null : taille.toUpperCase(Locale.FRANCE);
    }

    /**
     * Empêche toute donnée sensible d'atteindre la table audit_log, y compris
     * par mégarde depuis un appelant futur.
     */
    private String sanitizer(String texte, int longueurMax) {
        if (texte == null) {
            return null;
        }
        String nettoye = texte;
        for (String terme : TERMES_INTERDITS) {
            if (nettoye.toLowerCase(Locale.FRANCE).contains(terme)) {
                log.warn("Trace d'audit rejetée : description contenant un terme sensible.");
                return "[contenu masqué]";
            }
        }
        if (nettoye.length() > longueurMax) {
            nettoye = nettoye.substring(0, longueurMax - 1) + "…";
        }
        return nettoye;
    }

    private String csvCell(String valeur) {
        if (valeur == null) {
            return "";
        }
        String echappe = valeur.replace("\"", "\"\"");
        // Le point-virgule est le séparateur : il doit être neutralisé.
        echappe = echappe.replace(";", ",");
        return "\"" + echappe + "\"";
    }

    private String adresseIp() {
        if (!(RequestContextHolder.getRequestAttributes()
                instanceof ServletRequestAttributes attributes)) {
            return null;
        }
        String ip = attributes.getRequest().getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        return attributes.getRequest().getRemoteAddr();
    }
}
