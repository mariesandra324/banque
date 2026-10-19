package com.erpbanking.utilisateur.service;

import java.util.List;
import com.erpbanking.utilisateur.dto.ChangePasswordRequest;
import com.erpbanking.utilisateur.dto.UpdateProfilRequest;
import com.erpbanking.utilisateur.dto.UtilisateurRequest;
import com.erpbanking.utilisateur.dto.UtilisateurResponse;

public interface UtilisateurService {
    UtilisateurResponse create(UtilisateurRequest request);

    UtilisateurResponse findById(Long id);

    List<UtilisateurResponse> findAll();

    UtilisateurResponse update(Long id, UtilisateurRequest request);

    UtilisateurResponse modifierProfil(Long id, UpdateProfilRequest request);

    void changerMotDePasse(Long id, ChangePasswordRequest request);

    void bloquer(Long id);

    void debloquer(Long id);

    void delete(Long id);
}
