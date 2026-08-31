package com.erpbanking.credit.service;

import java.util.List;

import com.erpbanking.credit.dto.CreditRequest;
import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.entity.StatutCredit;

public interface CreditService {
    CreditResponse create(CreditRequest request);
    List<CreditResponse> getAll();
    CreditResponse getByNumero(String numeroCredit);
    CreditResponse getById(Long id);
    List<CreditResponse> getByClientId(Long clientId);
    List<CreditResponse> getByStatut(StatutCredit statut);
}
