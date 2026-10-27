package com.erpbanking.compte.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.compte.dto.ParametresInteretsRequest;
import com.erpbanking.compte.dto.ParametresInteretsResponse;
import com.erpbanking.compte.entity.ParametresInterets;
import com.erpbanking.compte.repository.ParametresInteretsRepository;
import com.erpbanking.common.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParametresInteretsService {

    private static final long PARAMETRES_ID = 1L;

    private final ParametresInteretsRepository repository;

    public ParametresInteretsResponse get() {
        return toResponse(chargerParametres());
    }

    @Transactional
    public ParametresInteretsResponse update(ParametresInteretsRequest request) {
        ParametresInterets parametres = chargerParametres();
        parametres.setMontantCourant(request.getMontantCourant());
        parametres.setMontantEpargne(request.getMontantEpargne());
        return toResponse(repository.save(parametres));
    }

    private ParametresInterets chargerParametres() {
        return repository.findById(PARAMETRES_ID)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Les paramètres des intérêts mensuels sont introuvables."));
    }

    private ParametresInteretsResponse toResponse(ParametresInterets parametres) {
        return ParametresInteretsResponse.builder()
                .montantCourant(parametres.getMontantCourant())
                .montantEpargne(parametres.getMontantEpargne())
                .build();
    }
}
