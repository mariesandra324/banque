package com.erpbanking.credit.service;

import java.util.List;

import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.dto.OffreCreditRequest;
import com.erpbanking.credit.dto.OffreCreditResponse;

public interface OffreCreditService {

    OffreCreditResponse create(OffreCreditRequest request);

    OffreCreditResponse getById(Long id);

    List<OffreCreditResponse> getAll();

    CreditResponse accepterOffre(Long offreId);

    List<OffreCreditResponse> getByClientId(Long clientId);

    List<OffreCreditResponse> getByDemandeCreditId(Long demandeCreditId);

    OffreCreditResponse updateStatut(Long id, String statut);

    void delete(Long id);

    OffreCreditResponse refuserOffre(Long offreId);

    OffreCreditResponse consulterParToken(String token);

    CreditResponse accepterParToken(String token);

    OffreCreditResponse refuserParToken(String token);
}
