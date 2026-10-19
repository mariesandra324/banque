package com.erpbanking.utilisateur.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.common.ResourceNotFoundException;
import com.erpbanking.common.exception.DuplicateResourceException;
import com.erpbanking.role.repository.RoleRepository;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.repository.GuichetRepository;
import com.erpbanking.role.entity.Role;
import com.erpbanking.utilisateur.dto.ChangePasswordRequest;
import com.erpbanking.utilisateur.dto.UpdateProfilRequest;
import com.erpbanking.utilisateur.dto.UtilisateurRequest;
import com.erpbanking.utilisateur.dto.UtilisateurResponse;
import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.mapper.UtilisateurMapper;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final GuichetRepository guichetRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Override
    public UtilisateurResponse create(UtilisateurRequest request) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Cet email est déjà utilisé.");
        }

        if (request.getTelephone() != null && !request.getTelephone().isBlank()
                && utilisateurRepository.existsByTelephone(request.getTelephone())) {
            throw new DuplicateResourceException("Ce numéro de téléphone est déjà utilisé.");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Rôle introuvable."));

        Guichet guichet= guichetRepository.findById(request.getGuichetId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("code guichet introuvable"));
        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .telephone(request.getTelephone())
                .role(role)
                .guichet(guichet)
                .build();

        utilisateur = utilisateurRepository.save(utilisateur);

        auditService.journaliser(
                AuditAction.CREATION,
                AuditModule.UTILISATEURS,
                "Utilisateur #" + utilisateur.getId(),
                "Création de l'utilisateur " + utilisateur.getPrenom() + " " + utilisateur.getNom()
                        + " (" + utilisateur.getEmail() + ") avec le rôle " + role.getNom() + "."
        );

        return UtilisateurMapper.toResponse(utilisateur);
    }

    @Override
    public UtilisateurResponse findById(Long id) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable."));

        return UtilisateurMapper.toResponse(utilisateur);
    }

    @Override
    public List<UtilisateurResponse> findAll() {

        return utilisateurRepository.findAll()
                .stream()
                .map(UtilisateurMapper::toResponse)
                .toList();
    }

    @Override
    public UtilisateurResponse update(Long id, UtilisateurRequest request) {

    Utilisateur utilisateur = utilisateurRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Utilisateur introuvable."));

    Role role = roleRepository.findById(request.getRoleId())
            .orElseThrow(() ->
                    new ResourceNotFoundException("Rôle introuvable."));

    Guichet guichet = null;

if (request.getGuichetId() != null) {
    guichet = guichetRepository.findById(request.getGuichetId())
            .orElseThrow(() ->
                new RuntimeException("Guichet introuvable")
            );
}

utilisateur.setGuichet(guichet);

    utilisateur.setNom(request.getNom());
    utilisateur.setPrenom(request.getPrenom());
    utilisateur.setRole(role);
    utilisateur.setGuichet(guichet);

    if (!utilisateur.getEmail().equals(request.getEmail())) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Cet email est déjà utilisé.");
        }

        utilisateur.setEmail(request.getEmail());
    }

    String nouveauTelephone = request.getTelephone() != null && !request.getTelephone().isBlank()
            ? request.getTelephone()
            : null;

    if (!java.util.Objects.equals(utilisateur.getTelephone(), nouveauTelephone)
            && nouveauTelephone != null
            && utilisateurRepository.existsByTelephone(nouveauTelephone)) {
        throw new DuplicateResourceException("Ce numéro de téléphone est déjà utilisé.");
    }

    utilisateur.setTelephone(nouveauTelephone);

    if (request.getMotDePasse() != null
            && !request.getMotDePasse().isBlank()) {

        utilisateur.setMotDePasse(
                passwordEncoder.encode(request.getMotDePasse())
        );
    }

        utilisateur = utilisateurRepository.save(utilisateur);

        auditService.journaliser(
                AuditAction.MODIFICATION,
                AuditModule.UTILISATEURS,
                "Utilisateur #" + utilisateur.getId(),
                "Modification de l'utilisateur " + utilisateur.getPrenom() + " " + utilisateur.getNom()
                        + " (" + utilisateur.getEmail() + "), rôle " + role.getNom() + "."
        );

        return UtilisateurMapper.toResponse(utilisateur);
    }

    @Override
    public UtilisateurResponse modifierProfil(Long id, UpdateProfilRequest request) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable."));

        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());

        utilisateur = utilisateurRepository.save(utilisateur);

        auditService.journaliser(
                AuditAction.MODIFICATION,
                AuditModule.UTILISATEURS,
                "Utilisateur #" + utilisateur.getId(),
                "Modification du profil de l'utilisateur " + utilisateur.getPrenom() + " " + utilisateur.getNom() + "."
        );

        return UtilisateurMapper.toResponse(utilisateur);
    }

    @Override
    public void changerMotDePasse(Long id, ChangePasswordRequest request) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable."));

        if (!passwordEncoder.matches(request.getAncienMotDePasse(), utilisateur.getPassword())) {
            throw new RuntimeException("L'ancien mot de passe est incorrect.");
        }

        if (!request.getNouveauMotDePasse().equals(request.getConfirmationMotDePasse())) {
            throw new RuntimeException("La confirmation du mot de passe ne correspond pas.");
        }

        if (request.getNouveauMotDePasse().equals(request.getAncienMotDePasse())) {
            throw new RuntimeException("Le nouveau mot de passe doit être différent de l'ancien.");
        }

        utilisateur.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(utilisateur);

        auditService.journaliser(
                AuditAction.MODIFICATION,
                AuditModule.UTILISATEURS,
                "Utilisateur #" + utilisateur.getId(),
                "Modification du mot de passe de l'utilisateur " + utilisateur.getPrenom() + " " + utilisateur.getNom() + "."
        );
    }

    @Override
    public void bloquer(Long id) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable."));

        utilisateur.setActif(false);

        // Le guichet rattaché est libéré pour pouvoir être réaffecté.
        utilisateur.setGuichet(null);

        utilisateurRepository.save(utilisateur);

        auditService.journaliser(
                AuditAction.DESACTIVATION,
                AuditModule.UTILISATEURS,
                "Utilisateur #" + utilisateur.getId(),
                "Blocage de l'utilisateur " + utilisateur.getPrenom() + " " + utilisateur.getNom()
                        + " (" + utilisateur.getEmail() + ") et libération de son guichet."
        );
    }

    @Override
    public void debloquer(Long id) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable."));

        utilisateur.setActif(true);

        utilisateurRepository.save(utilisateur);

        auditService.journaliser(
                AuditAction.MODIFICATION_STATUT,
                AuditModule.UTILISATEURS,
                "Utilisateur #" + utilisateur.getId(),
                "Déblocage de l'utilisateur " + utilisateur.getPrenom() + " " + utilisateur.getNom()
                        + " (" + utilisateur.getEmail() + ")."
        );
    }

    @Override
    public void delete(Long id) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable."));

        utilisateur.setActif(false);

        utilisateurRepository.save(utilisateur);

        auditService.journaliser(
                AuditAction.DESACTIVATION,
                AuditModule.UTILISATEURS,
                "Utilisateur #" + utilisateur.getId(),
                "Désactivation du compte de l'utilisateur " + utilisateur.getPrenom() + " " + utilisateur.getNom() + "."
        );
    }
    
}
