package com.erpbanking.credit.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.credit.dto.DemandeCreditRequest;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.repository.DemandeCreditRepository;
import com.erpbanking.credit.entity.PieceJointe;
import com.erpbanking.credit.repository.PieceJointeRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DemandeCreditServiceImpl implements DemandeCreditService {

    private final PieceJointeRepository pieceJointeRepository;
    private final DemandeCreditRepository demandeCreditRepository;
    private final ClientRepository clientRepository;

    @Override
    public DemandeCreditResponse creer(DemandeCreditRequest request,List<MultipartFile> fichiers) {

    Client client = clientRepository.findById(request.getClientId())
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Client introuvable : " + request.getClientId()
                    )
            );

    System.out.println("CLIENT TROUVE : " + client.getId());

    DemandeCredit demande = DemandeCredit.builder()
            .montantDemande(request.getMontantDemande())
            .duree(request.getDuree())
            .motif(request.getMotif())
            .tauxInteret(request.getTauxInteret())

            .profession(request.getProfession())
            .typeContrat(request.getTypeContrat())
            .revenuMensuel(request.getRevenuMensuel())
            .chargesMensuelles(request.getChargesMensuelles())

            .client(client)
            .dateDemande(LocalDateTime.now())
            .statut(StatutDemandeCredit.EN_ATTENTE)
            .dateDecision(null)
            .motifRejet(null)
            .build();

    System.out.println("DEMANDE CONSTRUITE");

    demande = demandeCreditRepository.save(demande);

    if (fichiers != null && !fichiers.isEmpty()) {

    for (MultipartFile fichier : fichiers) {

        if (!fichier.isEmpty()) {

        String cheminFichier = "uploads/credits/" + fichier.getOriginalFilename();
            PieceJointe document = PieceJointe.builder()
                    .nomFichier(fichier.getOriginalFilename())
                    .typeFichier(fichier.getContentType())
                    .demandeCredit(demande)
                    .build();

                pieceJointeRepository.save(document);
        }
    }
}

    System.out.println("DEMANDE SAUVEE : " + demande.getId());

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
                .tauxInteret(demande.getTauxInteret())
                .dateDemande(demande.getDateDemande())
                .statut(demande.getStatut())
                .dateDecision(demande.getDateDecision())
                .motifRejet(demande.getMotifRejet())
                .profession(demande.getProfession())
                .typeContrat(demande.getTypeContrat())
                .revenuMensuel(demande.getRevenuMensuel())
                .chargesMensuelles(demande.getChargesMensuelles())
                .clientId(demande.getClient().getId())
                .clientNom(demande.getClient().getNom())
                .clientPrenom(demande.getClient().getPrenom())
                .build();
    }

    @Override
        public DemandeCreditResponse updateStatut(
                Long id,
                StatutDemandeCredit statut,
                String motifRejet ) {

        DemandeCredit demande = demandeCreditRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Demande de crédit introuvable : " + id
                        )
                );

        demande.setStatut(statut);
        demande.setDateDecision(LocalDateTime.now());

        if (statut == StatutDemandeCredit.REJETER){
                if (motifRejet == null || motifRejet.trim().isEmpty()) {
                        throw new IllegalArgumentException(
                                "Le motif de rejet est obligatoire."
                        );
                }
                demande.setMotifRejet(motifRejet);
        }else{
                demande.setMotifRejet(null);
        }

        demande = demandeCreditRepository.save(demande);

        return toResponse(demande);
        }

}