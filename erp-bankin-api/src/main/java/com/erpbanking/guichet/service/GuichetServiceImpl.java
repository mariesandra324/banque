package com.erpbanking.guichet.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.repository.GuichetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuichetServiceImpl implements GuichetService {

    private final GuichetRepository guichetRepository;

    @Override
    public List<Guichet> findGuichetsDisponibles() {
        return guichetRepository.findGuichetsDisponibles();
    }
}