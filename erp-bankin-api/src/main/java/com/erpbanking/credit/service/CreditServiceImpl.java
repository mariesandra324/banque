package com.erpbanking.credit.service;

import java.util.List;

import com.erpbanking.client.entity.Client;
import com.erpbanking.credit.dto.CreditRequest;
import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.entity.Credit;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.StatutCredit;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.repository.CreditRepository;
import com.erpbanking.credit.repository.DemandeCreditRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class CreditServiceImpl implements CreditService {
    
    private final CreditRepository creditRepository;
    private final DemandeCreditRepository demandeCreditRepository;

    @Override
    public CreditResponse create(CreditRequest request)
    {
        DemandeCredit demande = demandeCreditRepository
            .findById(request.getDemandeCreditId())
            .orElseThrow(()->
                new IllegalArgumentException("Demande de crédit introuvable:" +request.getDemandeCreditId())
        );

        if(demande.getStatut() != StatutDemandeCredit.ACCEPTER)
        {
            throw new IllegalArgumentException("la demande de crédit doit être validée avant de créer le crédits");
        }

        if(creditRepository
            .findByDemandeCreditId(demande.getId())
            .isPresent())
        {
            throw new IllegalArgumentException("un crédit existe déjà pour cette demande.");
        }

        Client client = demande.getClient();
        
        Credit credit = Credit.builder()
                .numeroCredit(genererNumeroCredit())
                .montant(request.getMontant())
                .tauxInteret(request.getTauxInteret())
                .duree(request.getDuree())
                .mensualite(request.getMensualite())
                .dateDebut(request.getDateDebut())
                .capitalRestant(request.getMontant())
                .statut(StatutCredit.ACTIF)
                .demandeCredit(demande)
                .client(client)
                .build();

        credit = creditRepository.save(credit);

        return toResponse(credit);
    }

     @Override
    public List<CreditResponse> getAll() {

        return creditRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CreditResponse getById(Long id) {

        Credit credit = creditRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Crédit introuvable : " + id
                        )
                );

        return toResponse(credit);
    }

    @Override
    public CreditResponse getByNumero(String numeroCredit) {

        Credit credit = creditRepository
                .findByNumeroCredit(numeroCredit)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Crédit introuvable : " + numeroCredit
                        )
                );

        return toResponse(credit);
    }

    @Override
    public List<CreditResponse> getByClientId(Long clientId) {

        return creditRepository.findByClientId(clientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<CreditResponse> getByStatut(StatutCredit statut) {

        return creditRepository.findByStatut(statut)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String genererNumeroCredit() {

        return "CR-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    private CreditResponse toResponse(Credit credit) {

        return CreditResponse.builder()
                .id(credit.getId())
                .numeroCredit(credit.getNumeroCredit())
                .montant(credit.getMontant())
                .tauxInteret(credit.getTauxInteret())
                .duree(credit.getDuree())
                .mensualite(credit.getMensualite())
                .dateDebut(credit.getDateDebut())
                .capitalRestant(credit.getCapitalRestant())
                .statut(credit.getStatut())
                .demandeCreditId(
                        credit.getDemandeCredit().getId()
                )
                .clientId(
                        credit.getClient().getId()
                )
                .clientNom(
                        credit.getClient().getNom()
                )
                .clientPrenom(
                        credit.getClient().getPrenom()
                )
                .build();
    }
}
