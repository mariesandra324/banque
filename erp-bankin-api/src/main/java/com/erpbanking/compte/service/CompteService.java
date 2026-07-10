package com.erpbanking.compte.service;

import java.util.List;

import com.erpbanking.compte.dto.CompteRequest;
import com.erpbanking.compte.dto.CompteResponse;

public interface CompteService {
    
    CompteResponse create(CompteRequest request);

    List<CompteResponse> findAll();

    CompteResponse findById(Long id);

    CompteResponse update(Long id, CompteRequest request);

    void delete(Long id);
}
