package com.erpbanking.credit.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.dto.DemandeCreditRequest;
import com.erpbanking.credit.entity.StatutDemandeCredit;

public interface DemandeCreditService {

    DemandeCreditResponse creer(DemandeCreditRequest request,List<MultipartFile> fichiers);
    List<DemandeCreditResponse> getAll();
    DemandeCreditResponse getById(Long id);
    List<DemandeCreditResponse> getByClientId(Long clientId);
    List<DemandeCreditResponse> getByStatut(StatutDemandeCredit statut);
    DemandeCreditResponse updateStatut(Long id, StatutDemandeCredit statut,String motifRejet);
}
