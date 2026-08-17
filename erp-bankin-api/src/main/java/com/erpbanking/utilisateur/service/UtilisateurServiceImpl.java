package com.erpbanking.utilisateur.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.erpbanking.common.ResourceNotFoundException;
import com.erpbanking.role.repository.RoleRepository;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.repository.GuichetRepository;
import com.erpbanking.role.entity.Role;
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

    @Override
    public UtilisateurResponse create(UtilisateurRequest request) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email existe déjà.");
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
    utilisateur.setTelephone(request.getTelephone());
    utilisateur.setRole(role);
    utilisateur.setGuichet(guichet);

    if (!utilisateur.getEmail().equals(request.getEmail())) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé.");
        }

        utilisateur.setEmail(request.getEmail());
    }

    if (request.getMotDePasse() != null
            && !request.getMotDePasse().isBlank()) {

        utilisateur.setMotDePasse(
                passwordEncoder.encode(request.getMotDePasse())
        );
    }

    utilisateur = utilisateurRepository.save(utilisateur);

    return UtilisateurMapper.toResponse(utilisateur);
}

    @Override
    public void delete(Long id) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable."));

        utilisateur.setActif(false);

        utilisateurRepository.save(utilisateur);
    }
    
}
