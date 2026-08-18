package com.erpbanking.credit.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.credit.dto.DemandeCreditRequest;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.repository.DemandeCreditRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DemandeCreditServiceImpl implements DemandeCreditService {

    private final DemandeCreditRepository demandeCreditRepository;
    private final ClientRepository clientRepository;

    @Override
    public DemandeCreditResponse creer(DemandeCreditRequest request) {

        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Client introuvable : " + request.getClientId()
                        )
                );

        DemandeCredit demande = DemandeCredit.builder()
                .montantDemande(request.getMontantDemande())
                .duree(request.getDuree())
                .motif(request.getMotif())
                .client(client)
                .dateDemande(LocalDateTime.now())
                .statut(StatutDemandeCredit.EN_ATTENTE)
                .build();

        demande = demandeCreditRepository.save(demande);

        return toResponse(demande);
    }

    @Override
    public List<DemandeCreditResponse> getAll() {

        List<DemandeCredit> demandes =
                demandeCreditRepository.findAll();

        return demandes.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DemandeCreditResponse getById(Long id) {

        DemandeCredit demande =
                demandeCreditRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Demande de crédit introuvable : " + id
                                )
                        );

        return toResponse(demande);
    }

    @Override
    public List<DemandeCreditResponse> getByClientId(Long clientId) {

        return demandeCreditRepository
                .findByClientId(clientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<DemandeCreditResponse> getByStatut(
            StatutDemandeCredit statut) {

        return demandeCreditRepository
                .findByStatut(statut)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private DemandeCreditResponse toResponse(
            DemandeCredit demande) {

        return DemandeCreditResponse.builder()
                .id(demande.getId())
                .montantDemande(demande.getMontantDemande())
                .duree(demande.getDuree())
                .motif(demande.getMotif())
                .dateDemande(demande.getDateDemande())
                .statut(demande.getStatut())
                .dateDecision(demande.getDateDecision())
                .motifRejet(demande.getMotifRejet())
                .clientId(demande.getClient().getId())
                .clientNom(demande.getClient().getNom())
                .clientPrenom(demande.getClient().getPrenom())
                .build();
    }

    @Override
        public DemandeCreditResponse updateStatut(
                Long id,
                StatutDemandeCredit statut) {

        DemandeCredit demande = demandeCreditRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Demande de crédit introuvable : " + id
                        )
                );

        demande.setStatut(statut);
        demande.setDateDecision(LocalDateTime.now());

        demande = demandeCreditRepository.save(demande);

        return toResponse(demande);
        }

}