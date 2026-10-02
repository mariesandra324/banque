package com.erpbanking.compte.service;

import java.util.List;

import com.erpbanking.compte.dto.CarteRequest;
import com.erpbanking.compte.dto.CarteResponse;
import com.erpbanking.compte.dto.VerificationPinRequest;
import com.erpbanking.compte.dto.VerificationPinResponse;

public interface CarteService {
    CarteResponse create(CarteRequest request);

    List<CarteResponse> findAll();

    CarteResponse findById(Long id);

    CarteResponse findByCompteId(Long compteId);

    CarteResponse update(Long id, CarteRequest request);

    void delete(Long id);

    VerificationPinResponse verifierPin(Long clientId, VerificationPinRequest request);
}
