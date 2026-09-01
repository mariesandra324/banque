package com.erpbanking.credit.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.credit.dto.DemandeCreditRequest;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.dto.PieceJointeResponse;
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
        Path dossierUpload = Paths.get("uploads", "credits");
        try {
            Files.createDirectories(dossierUpload);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de créer le dossier de pièces jointes", e);
        }

        for (MultipartFile fichier : fichiers) {
            System.out.println("FICHIER RECU : " + fichier.getOriginalFilename());
            System.out.println("TYPE : " + fichier.getContentType());
            System.out.println("TAILLE : " + fichier.getSize());
            System.out.println("VIDE ? " + fichier.isEmpty());

            if (!fichier.isEmpty()) {
                String nomFichierOriginal = fichier.getOriginalFilename();
                String nomFichierUnique = UUID.randomUUID() + "_" + nomFichierOriginal;
                Path cheminFichier = dossierUpload.resolve(nomFichierUnique);

                try (InputStream inputStream = fichier.getInputStream()) {
                    Files.copy(inputStream, cheminFichier, StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    throw new IllegalStateException("Impossible de stocker la pièce jointe: " + nomFichierOriginal, e);
                }

                String cheminPersistant = cheminFichier.toString().replace('\\', '/');

                PieceJointe document = PieceJointe.builder()
                        .nomFichier(nomFichierOriginal)
                        .typeFichier(fichier.getContentType())
                        .cheminFichier(cheminPersistant)
                        .dateAjout(LocalDateTime.now())
                        .demandeCredit(demande)
                        .build();

                System.out.println("SAUVEGARDE PIECE JOINTE : " + cheminPersistant);
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

        List<PieceJointeResponse> piecesJointes = pieceJointeRepository
                .findByDemandeCreditId(demande.getId())
                .stream()
                .map(p -> PieceJointeResponse.builder()
                        .id(p.getId())
                        .nomFichier(p.getNomFichier())
                        .typeFichier(p.getTypeFichier())
                        .cheminFichier(p.getCheminFichier())
                        .build())
                .toList();

        System.out.println("PIECES TROUVEES POUR ID " + demande.getId() + ": " + piecesJointes.size());

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
                .piecesJointes(piecesJointes)
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