package com.erpbanking.credit.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.client.entity.Client;
import com.erpbanking.compte.service.EmailService;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.notification.service.NotificationService;
import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.dto.OffreCreditRequest;
import com.erpbanking.credit.dto.OffreCreditResponse;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.OffreCredit;
import com.erpbanking.credit.repository.OffreCreditRepository;
import com.erpbanking.credit.repository.CreditRepository;
import com.erpbanking.credit.repository.DemandeCreditRepository;
import com.erpbanking.credit.service.OffreCreditService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OffreCreditServiceImpl implements OffreCreditService {

    private final OffreCreditRepository offreCreditRepository;
    private final DemandeCreditRepository demandeCreditRepository;    
    private final CreditService creditService;
    private final CreditRepository creditRepository;
    private final EmailService emailService;
    private final OffrePdfService offrePdfService;
    private final NotificationService notificationService;
    

    @Override
    public OffreCreditResponse create(OffreCreditRequest request) {

        // 0. Garde-fou : le contrôleur applique déjà @NotNull, mais ce service
        //    peut être appelé directement (tests, imports, jobs).
        if (request.getDemandeCreditId() == null) {
            throw new IllegalArgumentException(
                    "La demande de crédit est requise pour créer une offre."
            );
        }

        // 1. Vérifier la demande
        DemandeCredit demandeCredit = demandeCreditRepository
                .findById(request.getDemandeCreditId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Demande de crédit introuvable : "
                                        + request.getDemandeCreditId()
                        )
                );

        // 2. Vérifier qu'aucune offre encore active n'existe déjà pour cette demande.
        //    Une offre REFUSEE ou EXPIREE ne bloque plus : le gestionnaire peut
        //    soumettre une nouvelle proposition sur le même dossier.
        List<String> statutsBloquants = List.of("EN_ATTENTE", "ACCEPTEE");

        if (offreCreditRepository.existsByDemandeCreditIdAndStatutIn(
                request.getDemandeCreditId(),
                statutsBloquants)) {

            OffreCredit offreActive = offreCreditRepository
                    .findByDemandeCreditId(request.getDemandeCreditId())
                    .stream()
                    .filter(o -> statutsBloquants.stream().anyMatch(
                            s -> s.equalsIgnoreCase(o.getStatut())))
                    .findFirst()
                    .orElse(null);

            String libelleStatut = offreActive != null
                    && "ACCEPTEE".equalsIgnoreCase(offreActive.getStatut())
                    ? "déjà acceptée"
                    : "en attente";

            throw new IllegalArgumentException(
                    "Une offre " + libelleStatut
                            + (offreActive != null
                                ? " (n°" + offreActive.getNumeroOffre() + ")"
                                : "")
                            + " existe déjà pour cette demande de crédit."
                            + " Supprimez-la avant d'en créer une nouvelle."
            );
        }

        // 3. Récupérer automatiquement le client
        Client client = demandeCredit.getClient();

        if (client == null) {
            throw new IllegalArgumentException(
                    "Aucun client associé à cette demande de crédit."
            );
        }

        // 4. Créer l'offre
        OffreCredit offre = OffreCredit.builder()
                .demandeCredit(demandeCredit)
                .client(client)
                .montantPropose(request.getMontantPropose())
                .tauxInteret(request.getTauxInteret())
                .duree(request.getDuree())
                .mensualite(request.getMensualite())
                .dateOffre(LocalDate.now())
                .dateExpiration(request.getDateExpiration())
                .conditions(request.getConditions())
                .statut("EN_ATTENTE")
                .build();

        // 5. Générer le numéro
        offre.genererNumeroOffre();
        offre.setToken(UUID.randomUUID().toString());

        // 6. Générer le PDF final
        byte[] pdf = offrePdfService.genererPdfOffre(offre);
        offre.setPdfContent(pdf);

        // 7. Sauvegarder
        OffreCredit saved = offreCreditRepository.save(offre);

        // 8. Notifier le client (cloche mobile + push) qu'il a reçu une offre
        notificationService.creerPourClient(
                client.getId(),
                NotificationType.OFFRE_CREDIT_RECUE,
                "Vous avez reçu une offre de crédit n°" + saved.getNumeroOffre()
                        + " de " + saved.getMontantPropose()
                        + " Ar. Consultez-la et répondez-y avant le "
                        + saved.getDateExpiration() + ".",
                "offre-credit:" + saved.getId()
        );

        // 9. Envoyer automatiquement le PDF par email au client
        if (client.getEmail() != null && !client.getEmail().isBlank()) {

        String nomClient =
                (client.getNom() != null ? client.getNom() : "") + " " +
                (client.getPrenom() != null ? client.getPrenom() : "");

        System.out.println("10. Envoi email à : " + client.getEmail());

        try {

            emailService.envoyerOffrePdf(
                    client.getEmail(),
                    nomClient.trim(),
                    saved.getNumeroOffre(),
                    pdf,
                    saved.getToken()
            );

            System.out.println("11. EMAIL ENVOYE !");

        } catch (Exception e) {

            System.err.println("ERREUR ENVOI EMAIL : "
                    + e.getMessage());

            e.printStackTrace();

            // IMPORTANT :
            // On ne bloque pas la création de l'offre
        }

    } else {

        System.out.println("10. Aucun email client, email non envoyé.");
    }

    System.out.println("12. Retour de la réponse");

    return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OffreCreditResponse getById(Long id) {

        OffreCredit offre = offreCreditRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Offre de crédit introuvable : " + id
                        )
                );

        return toResponse(offre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OffreCreditResponse> getAll() {

        return offreCreditRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OffreCreditResponse> getByClientId(Long clientId) {

        return offreCreditRepository.findByClientId(clientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OffreCreditResponse> getByDemandeCreditId(
            Long demandeCreditId) {

        return offreCreditRepository
                .findByDemandeCreditId(demandeCreditId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public OffreCreditResponse updateStatut(
            Long id,
            String statut) {

        OffreCredit offre = offreCreditRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Offre de crédit introuvable : " + id
                        )
                );

        String nouveauStatut = statut.toUpperCase();

        if (!nouveauStatut.equals("EN_ATTENTE")
                && !nouveauStatut.equals("ACCEPTEE")
                && !nouveauStatut.equals("REFUSEE")
                && !nouveauStatut.equals("EXPIREE")) {

            throw new IllegalArgumentException(
                    "Statut invalide : " + statut
            );
        }

        offre.setStatut(nouveauStatut);

        OffreCredit saved = offreCreditRepository.save(offre);

        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {

        if (!offreCreditRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Offre de crédit introuvable : " + id
            );
        }

        offreCreditRepository.deleteById(id);
    }

    /**
     * Conversion Entity -> Response
     */
    private OffreCreditResponse toResponse(OffreCredit offre) {
        
        return OffreCreditResponse.builder()
                .id(offre.getId())
                .numeroOffre(offre.getNumeroOffre())
                .demandeCreditId(offre.getDemandeCredit().getId())
                .demandeProfession(offre.getDemandeCredit().getProfession())
                .demandeTypeContrat(offre.getDemandeCredit().getTypeContrat())
                .demandeMotif(offre.getDemandeCredit().getMotif())
                .demandeDateDecision(offre.getDemandeCredit().getDateDecision())
                .clientId(offre.getClient().getId())
                .clientNom(offre.getClient().getNom())
                .clientPrenom(offre.getClient().getPrenom())
                .montantPropose(offre.getMontantPropose())
                .tauxInteret(offre.getTauxInteret())
                .duree(offre.getDuree())
                .mensualite(offre.getMensualite())
                .dateOffre(offre.getDateOffre())
                // .dateDebut(dateDebut)
                .dateExpiration(offre.getDateExpiration())
                .conditions(offre.getConditions())
                .statut(offre.getStatut())
                .build();
    }

        @Override
        public CreditResponse accepterOffre(Long offreId) {

        // 1. Chercher l'offre
        OffreCredit offre = offreCreditRepository
                .findById(offreId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Offre de crédit introuvable : " + offreId
                        )
                );

        // 2. Vérifier que l'offre est encore en attente
        if (!"EN_ATTENTE".equalsIgnoreCase(offre.getStatut())) {

                throw new IllegalArgumentException(
                        "Cette offre ne peut plus être acceptée. " +
                        "Statut actuel : " + offre.getStatut()
                );
        }

        // 3. Vérifier la date d'expiration
        if (offre.getDateExpiration() != null
                && LocalDate.now().isAfter(offre.getDateExpiration())) {

                offre.setStatut("EXPIREE");
                offreCreditRepository.save(offre);

                throw new IllegalArgumentException(
                        "Cette offre est expirée."
                );
        }

        // 4. Marquer l'offre comme acceptée AVANT de créer le crédit,
        //    car createFromOffre() exige que l'offre soit déjà au statut ACCEPTEE.
        offre.setStatut("ACCEPTEE");
        offreCreditRepository.save(offre);

        System.out.println("=== OFFRE MARQUEE ACCEPTEE ===");

        // 5. Créer le crédit à partir de l'offre désormais acceptée
        System.out.println("=== CREATION DU CREDIT ===");

        CreditResponse creditResponse;
        try {
            creditResponse = creditService.createFromOffre(offreId);
        } catch (RuntimeException e) {
            // La création du crédit a échoué : on annule le passage à ACCEPTEE
            // pour ne pas laisser l'offre dans un état incohérent (acceptée sans crédit).
            offre.setStatut("EN_ATTENTE");
            offreCreditRepository.save(offre);
            throw e;
        }

        System.out.println("=== CREDIT CREE ===");

        // 6. Envoyer l'email de confirmation
        Client client = offre.getClient();

        notificationService.creerPourRole(
                NotificationType.OFFRE_ACCEPTEE,
                "Le client " + (client != null && client.getPrenom() != null ? client.getPrenom() : "")
                        + " " + (client != null && client.getNom() != null ? client.getNom() : "")
                        + " a accepté l'offre n°" + offre.getNumeroOffre() + ".",
                "/credits/offres/" + offreId
        );

        if (client != null
                && client.getEmail() != null
                && !client.getEmail().isBlank()) {

                String nomClient =
                        (client.getNom() != null ? client.getNom() : "") +
                        " " +
                        (client.getPrenom() != null ? client.getPrenom() : "");

                try {

                System.out.println(
                        "=== ENVOI EMAIL CONFIRMATION A "
                        + client.getEmail() + " ==="
                );

                emailService.envoyerConfirmationOffreAcceptee(
                        client.getEmail(),
                        nomClient.trim(),
                        offre.getNumeroOffre(),
                        offre.getMontantPropose().toString(),
                        LocalDate.now().toString()
                );

                System.out.println("=== EMAIL DE CONFIRMATION ENVOYE ===");

                } catch (Exception e) {

                // L'email ne doit pas empêcher
                // l'acceptation du crédit
                System.err.println(
                        "ERREUR ENVOI EMAIL CONFIRMATION : "
                        + e.getMessage()
                );

                e.printStackTrace();
                }
        }

        // 7. Retourner le crédit créé
        return creditResponse;
        }

        @Override
public CreditResponse accepterOffreParClient(Long offreId, Long clientId) {

    OffreCredit offre = offreCreditRepository
            .findById(offreId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Offre de crédit introuvable : " + offreId
                    )
            );

    if (clientId != null && !offre.getClient().getId().equals(clientId)) {
        throw new IllegalArgumentException(
                "Cette offre ne vous appartient pas."
        );
    }

    return accepterOffre(offreId);
}

        @Override
public OffreCreditResponse refuserOffre(Long offreId) {

    // 1. Chercher l'offre
    OffreCredit offre = offreCreditRepository
            .findById(offreId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Offre de crédit introuvable : " + offreId
                    )
            );

    // 2. Vérifier que l'offre est encore en attente
    if (!"EN_ATTENTE".equalsIgnoreCase(offre.getStatut())) {
        throw new IllegalArgumentException(
                "Cette offre ne peut plus être refusée. Statut actuel : " + offre.getStatut()
        );
    }

    // 3. Refuser
    offre.setStatut("REFUSEE");
    OffreCredit saved = offreCreditRepository.save(offre);

    Client client = offre.getClient();

    // 4. Prévenir la banque : sans cela le gestionnaire ne voit le refus
    //    qu'en ouvrant la page offres.
    notificationService.creerPourRole(
            NotificationType.OFFRE_REFUSEE,
            "Le client " + nomComplet(client)
                    + " a refusé l'offre n°" + offre.getNumeroOffre()
                    + " (" + offre.getMontantPropose() + " Ar sur "
                    + offre.getDuree() + " mois).",
            "/credits/offres/" + offreId
    );

    // 5. Confirmer par email
    if (client != null && client.getEmail() != null && !client.getEmail().isBlank()) {

        String nomClient = nomComplet(client);

        try {
            emailService.envoyerConfirmationOffreRefusee(
                    client.getEmail(),
                    nomClient,
                    offre.getNumeroOffre()
            );
        } catch (Exception e) {
            // L'email ne doit pas faire échouer le refus déjà enregistré.
            System.err.println("ERREUR ENVOI EMAIL REFUS : " + e.getMessage());
        }
    }

    return toResponse(saved);
    }

    private String nomComplet(Client client) {
        if (client == null) {
            return "";
        }
        return ((client.getNom() != null ? client.getNom() : "") + " "
                + (client.getPrenom() != null ? client.getPrenom() : "")).trim();
    }

private OffreCredit getOffreParTokenValide(String token) {

    OffreCredit offre = offreCreditRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Offre introuvable."));

    if (!"EN_ATTENTE".equalsIgnoreCase(offre.getStatut())) {
        throw new IllegalArgumentException(
                "Cette offre a déjà reçu une réponse ou n'est plus valide."
        );
    }

    if (offre.getDateExpiration() != null && LocalDate.now().isAfter(offre.getDateExpiration())) {
        offre.setStatut("EXPIREE");
        offreCreditRepository.save(offre);
        throw new IllegalArgumentException("Cette offre a expiré.");
    }

    return offre;
}

@Override
@Transactional(readOnly = true)
public OffreCreditResponse consulterParToken(String token) {
    return toResponse(getOffreParTokenValide(token));
}

@Override
public CreditResponse accepterParToken(String token) {
    OffreCredit offre = getOffreParTokenValide(token);
    return accepterOffre(offre.getId()); // réutilise la logique déjà en place
}

@Override
public OffreCreditResponse refuserParToken(String token) {
    OffreCredit offre = getOffreParTokenValide(token);
    return refuserOffre(offre.getId()); // réutilise refuserOffre ci-dessus
}

}