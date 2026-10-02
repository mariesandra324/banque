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
import com.erpbanking.compte.service.EmailService;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.notification.service.NotificationService;
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
    private final CreditService creditService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AuditService auditService;

        @Override
        public DemandeCreditResponse creer(DemandeCreditRequest request, List<MultipartFile> fichiers) {

        // 1. Recherche du client
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable : " + request.getClientId()));

        System.out.println("CLIENT TROUVE : " + client.getId());

        // 2. Construction de l'entité
        DemandeCredit demande = DemandeCredit.builder()
                .montantDemande(request.getMontantDemande())
                .duree(request.getDuree())
                .motif(request.getMotif())
                .tauxInteret(request.getTauxInteret())
                .profession(request.getProfession())
                .typeContrat(request.getTypeContrat())
                .revenuMensuel(request.getRevenuMensuel())
                .chargesMensuelles(request.getChargesMensuelles())
                .compteId(request.getCompteId())
                .client(client)
                .dateDemande(LocalDateTime.now())
                .statut(StatutDemandeCredit.EN_ATTENTE)
                .dateDecision(null)
                .motifRejet(null)
                .build();

        demande = demandeCreditRepository.save(demande);
        System.out.println("DEMANDE CONSTRUITE ET SAUVEGARDÉE : " + demande.getId());

        // 3. Gestion des fichiers joints
        if (fichiers != null && !fichiers.isEmpty()) {
                Path dossierUpload = Paths.get("uploads", "credits");
                try {
                Files.createDirectories(dossierUpload);
                } catch (IOException e) {
                throw new IllegalStateException("Impossible de créer le dossier de pièces jointes", e);
                }

                for (MultipartFile fichier : fichiers) {
                if (fichier != null && !fichier.isEmpty()) {
                        String nomOriginal = fichier.getOriginalFilename();
                        // Sécurisation du nom de fichier pour éviter le path traversal
                        String nomNettoye = (nomOriginal != null) ? Paths.get(nomOriginal).getFileName().toString() : "document";
                        String nomFichierUnique = UUID.randomUUID() + "_" + nomNettoye;
                        
                        Path cheminFichier = dossierUpload.resolve(nomFichierUnique);

                        try (InputStream inputStream = fichier.getInputStream()) {
                        Files.copy(inputStream, cheminFichier, StandardCopyOption.REPLACE_EXISTING);
                        } catch (IOException e) {
                        throw new IllegalStateException("Impossible de stocker la pièce jointe: " + nomNettoye, e);
                        }

                        String cheminPersistant = cheminFichier.toString().replace('\\', '/');

                        PieceJointe document = PieceJointe.builder()
                                .nomFichier(nomNettoye)
                                .typeFichier(fichier.getContentType())
                                .cheminFichier(cheminPersistant)
                                .dateAjout(LocalDateTime.now())
                                .demandeCredit(demande)
                                .build();

                        pieceJointeRepository.save(document);
                        System.out.println("SAUVEGARDE PIECE JOINTE : " + cheminPersistant);
                }
                }
        }

        // 4. Notification par email + cloche mobile
        if (client.getEmail() != null && !client.getEmail().isBlank()) {
                String nomClient = (client.getNom() != null ? client.getNom() : "") + " " +
                                (client.getPrenom() != null ? client.getPrenom() : "");

                try {
                        if (notificationService.emailActivePourClient(client.getId(), NotificationType.DEMANDE_CREDIT_SOUMISE)) {
                                emailService.envoyerConfirmationDemandeCredit(
                                        client.getEmail(),
                                        nomClient.trim(),
                                        demande.getId().toString(),
                                        demande.getMontantDemande().toString(),
                                        demande.getDuree()
                                );
                                System.out.println("EMAIL CONFIRMATION DEMANDE ENVOYE A : " + client.getEmail());
                        }
                } catch (Exception e) {
                        System.err.println("ERREUR ENVOI EMAIL DEMANDE : " + e.getMessage());
                }
        }

        notificationService.creerPourClient(
                client.getId(),
                NotificationType.DEMANDE_CREDIT_SOUMISE,
                "Votre demande de crédit de " + demande.getMontantDemande()
                        + " Ar sur " + demande.getDuree() + " mois a été envoyée.",
                "demande-credit:" + demande.getId()
        );

        notificationService.creerPourRole(
                NotificationType.DEMANDE_CREDIT_A_TRAITER,
                (client.getPrenom() != null ? client.getPrenom() : "")
                        + " " + (client.getNom() != null ? client.getNom() : "")
                        + " a soumis une demande de crédit de "
                        + demande.getMontantDemande() + " Ar.",
                "/credits/demandes/" + demande.getId()
        );

        if (fichiers != null && !fichiers.isEmpty()) {
        notificationService.creerPourRole(
                NotificationType.PIECE_JOINTE_AJOUTEE,
                "De nouvelles pièces jointes ont été ajoutées à la demande n°"
                        + demande.getId() + ".",
                "/credits/demandes/" + demande.getId()
        );
        }

        auditService.journaliser(
                AuditAction.CREATION,
                AuditModule.CREDITS,
                "Demande #"+demande.getId(),
                "Soumission d'une demande de crédit de "+demande.getMontantDemande()+" Ar sur "+demande.getDuree()+" mois."
        );

        // 5. Retour de la réponse
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
                .compteId(demande.getCompteId())
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

        if (statut == StatutDemandeCredit.REJETER) {
                notificationService.creerPourClient(
                        demande.getClient().getId(),
                        NotificationType.DEMANDE_CREDIT_DECIDEE,
                        "Votre demande de crédit n°" + demande.getId() + " a été refusée.",
                        "demande-credit:" + demande.getId()
                );
                auditService.journaliser(
                        AuditAction.REFUS,
                        AuditModule.CREDITS,
                        "Demande #" + demande.getId(),
                        "Refus de la demande de crédit n°" + demande.getId() + (demande.getMotifRejet() != null ? " - " + demande.getMotifRejet() : "")
                );
        }else if (statut == StatutDemandeCredit.ACCEPTER){
                auditService.journaliser(
                        AuditAction.VALIDATION,
                        AuditModule.CREDITS,
                        "Demande #" + demande.getId(),
                        "Acceptation de la demande de crédit n°" + demande.getId() + "."
                );
        }

        return toResponse(demande);
                }

        @Override
        public DemandeCreditResponse accepter(Long id) {

        DemandeCredit demande = demandeCreditRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Demande de crédit introuvable : " + id
                        )
                );

        if (demande.getStatut() != StatutDemandeCredit.EN_ATTENTE) {
                throw new IllegalArgumentException(
                        "Cette demande ne peut plus être acceptée."
                );
        }

        demande.setStatut(StatutDemandeCredit.ACCEPTER);
        demande.setDateDecision(LocalDateTime.now());
        demande.setMotifRejet(null);

        demande = demandeCreditRepository.save(demande);

        // Création automatique du crédit
        creditService.createFromDemande(demande.getId());

        notificationService.creerPourClient(
                demande.getClient().getId(),
                NotificationType.DEMANDE_CREDIT_DECIDEE,
                "Votre demande de crédit n°" + demande.getId() + " a été acceptée.",
                "demande-credit:" + demande.getId()
        );

        auditService.journaliser(
                AuditAction.VALIDATION,
                AuditModule.CREDITS,
                "Demande #" + demande.getId(),
                "Acceptation de la demande de crédit n°" + demande.getId() + "."
        );

        return toResponse(demande);
        }

}