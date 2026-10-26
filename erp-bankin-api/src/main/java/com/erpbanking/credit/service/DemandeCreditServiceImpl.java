package com.erpbanking.credit.service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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
import com.erpbanking.credit.dto.OffreCreditRequest;
import com.erpbanking.credit.dto.PieceJointeResponse;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.OffreCredit;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.repository.DemandeCreditRepository;
import com.erpbanking.credit.repository.OffreCreditRepository;
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
    private final OffreCreditRepository offreCreditRepository;

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
    public List<DemandeCreditResponse> optimiserDemandes() {
        List<DemandeCredit> demandes = demandeCreditRepository.findByStatut(StatutDemandeCredit.EN_ATTENTE);

        if (demandes.isEmpty()) {
            return List.of();
        }

        List<DemandeCredit> demandesTriees = demandes.stream()
                .sorted(Comparator.comparing(d -> calculerScoreConfiance(d), Comparator.reverseOrder()))
                .toList();

        List<DemandeCredit> demandesSelectionnees = new ArrayList<>();

        for (DemandeCredit demande : demandesTriees) {
            if (calculerScoreConfiance(demande) >= 60) {
                demandesSelectionnees.add(demande);
            }
        }

        if (demandesSelectionnees.isEmpty()) {
            return List.of();
        }

        List<DemandeCreditResponse> resultats = new ArrayList<>();

        for (DemandeCredit demande : demandesSelectionnees) {
            demande.setStatut(StatutDemandeCredit.ACCEPTER);
            demande.setDateDecision(LocalDateTime.now());
            demande.setMotifRejet(null);
            demandeCreditRepository.save(demande);

            OffreCreditRequest offreRequest = new OffreCreditRequest();
            offreRequest.setDemandeCreditId(demande.getId());
            offreRequest.setMontantPropose(demande.getMontantDemande());
            offreRequest.setTauxInteret(demande.getTauxInteret());
            offreRequest.setDuree(demande.getDuree());
            offreRequest.setMensualite(calculerMensualite(demande));
            offreRequest.setDateExpiration(LocalDate.now().plusMonths(3));
            offreRequest.setConditions("Offre générée automatiquement après optimisation du score de confiance.");

            if (offreCreditRepository.findByDemandeCreditId(demande.getId()).isEmpty()) {
                OffreCredit offre = OffreCredit.builder()
                        .demandeCredit(demande)
                        .client(demande.getClient())
                        .montantPropose(offreRequest.getMontantPropose())
                        .tauxInteret(offreRequest.getTauxInteret())
                        .duree(offreRequest.getDuree())
                        .mensualite(offreRequest.getMensualite())
                        .dateOffre(LocalDate.now())
                        .dateExpiration(offreRequest.getDateExpiration())
                        .conditions(offreRequest.getConditions())
                        .statut("EN_ATTENTE")
                        .build();
                offre.genererNumeroOffre();
                offre.setToken(UUID.randomUUID().toString());
                offreCreditRepository.save(offre);
            }

            notificationService.creerPourClient(
                    demande.getClient().getId(),
                    NotificationType.DEMANDE_CREDIT_DECIDEE,
                    "Votre demande de crédit n°" + demande.getId() + " a été sélectionnée automatiquement. Une offre de crédit a été générée.",
                    "demande-credit:" + demande.getId()
            );

            auditService.journaliser(
                    AuditAction.VALIDATION,
                    AuditModule.CREDITS,
                    "Demande #" + demande.getId(),
                    "Optimisation automatique : demande sélectionnée et offre générée."
            );

            resultats.add(toResponse(demande));
        }

        return resultats;
    }

    private int calculerScoreConfiance(DemandeCredit demande) {
        if (demande == null) {
            return 0;
        }

        BigDecimal montant = demande.getMontantDemande() != null ? demande.getMontantDemande() : BigDecimal.ZERO;
        BigDecimal revenu = demande.getRevenuMensuel() != null ? demande.getRevenuMensuel() : BigDecimal.ZERO;
        BigDecimal charges = demande.getChargesMensuelles() != null ? demande.getChargesMensuelles() : BigDecimal.ZERO;

        int score = 0;

        if (demande.getProfession() != null && !demande.getProfession().isBlank()) {
            score += 15;
        }
        if (demande.getTypeContrat() != null && !demande.getTypeContrat().isBlank()) {
            score += 15;
        }

        if (revenu.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal capacite = revenu.subtract(charges);
            if (capacite.compareTo(BigDecimal.ZERO) > 0) {
                score += Math.min(40, capacite.divide(revenu, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).intValue());
            }
        }

        if (montant.compareTo(BigDecimal.ZERO) > 0 && revenu.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = montant.divide(revenu, 4, RoundingMode.HALF_UP);
            if (ratio.compareTo(BigDecimal.valueOf(2)) <= 0) {
                score += 20;
            } else if (ratio.compareTo(BigDecimal.valueOf(4)) <= 0) {
                score += 10;
            }
        }

        if (demande.getDuree() != null) {
            if (demande.getDuree() <= 24) {
                score += 10;
            } else if (demande.getDuree() <= 60) {
                score += 5;
            }
        }

        return Math.min(100, Math.max(0, score));
    }

    private BigDecimal calculerMensualite(DemandeCredit demande) {
        BigDecimal montant = demande.getMontantDemande() != null ? demande.getMontantDemande() : BigDecimal.ZERO;
        BigDecimal taux = demande.getTauxInteret() != null ? demande.getTauxInteret() : BigDecimal.ZERO;
        int duree = demande.getDuree() != null ? demande.getDuree() : 1;

        if (montant.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal tauxMensuel = taux.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        BigDecimal facteur = tauxMensuel.multiply(BigDecimal.ONE.add(tauxMensuel).pow(duree));
        BigDecimal denominateur = BigDecimal.ONE.add(tauxMensuel).pow(duree).subtract(BigDecimal.ONE);

        if (denominateur.compareTo(BigDecimal.ZERO) == 0) {
            return montant.divide(BigDecimal.valueOf(duree), 2, RoundingMode.HALF_UP);
        }

        return montant.multiply(facteur).divide(denominateur, 2, RoundingMode.HALF_UP);
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