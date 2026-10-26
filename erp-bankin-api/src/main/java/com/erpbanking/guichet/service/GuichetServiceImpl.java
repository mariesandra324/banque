package com.erpbanking.guichet.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.common.ResourceNotFoundException;
import com.erpbanking.common.exception.DuplicateResourceException;
import com.erpbanking.guichet.dto.GuichetRequest;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.repository.GuichetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuichetServiceImpl implements GuichetService {

    private final GuichetRepository guichetRepository;

    @Override
    public List<Guichet> findAll() {
        return guichetRepository.findAllByOrderByCodeGuichetAsc();
    }

    @Override
    public List<Guichet> findGuichetsDisponibles() {
        return guichetRepository.findGuichetsDisponibles();
    }

    @Override
    @Transactional
    public Guichet create(GuichetRequest request) {
        String code = normaliserCode(request.getCodeGuichet());

        if (guichetRepository.existsByCodeGuichet(code)) {
            throw new DuplicateResourceException("Ce code guichet existe déjà.");
        }

        Guichet guichet = Guichet.builder()
                .codeGuichet(code)
                .actif(request.getActif() == null ? Boolean.TRUE : request.getActif())
                .build();

        return guichetRepository.save(guichet);
    }

    @Override
    @Transactional
    public Guichet update(Long id, GuichetRequest request) {
        Guichet guichet = guichetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guichet introuvable."));

        String code = normaliserCode(request.getCodeGuichet());

        if (!code.equals(guichet.getCodeGuichet())
                && guichetRepository.existsByCodeGuichet(code)) {
            throw new DuplicateResourceException("Ce code guichet existe déjà.");
        }

        guichet.setCodeGuichet(code);

        if (request.getActif() != null) {
            guichet.setActif(request.getActif());
        }

        return guichetRepository.save(guichet);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Guichet guichet = guichetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guichet introuvable."));

        guichet.setActif(false);
        guichetRepository.save(guichet);
    }

    private String normaliserCode(String code) {
        return code == null ? null : code.trim().toUpperCase(Locale.ROOT);
    }
}
