package com.erpbanking.utilisateur.service;

import java.util.List;
import com.erpbanking.utilisateur.dto.UtilisateurRequest;
import com.erpbanking.utilisateur.dto.UtilisateurResponse;

public interface UtilisateurService {
    UtilisateurResponse create(UtilisateurRequest request);

    UtilisateurResponse findById(Long id);

    List<UtilisateurResponse> findAll();

    UtilisateurResponse update(Long id, UtilisateurRequest request);

    void delete(Long id);
}
