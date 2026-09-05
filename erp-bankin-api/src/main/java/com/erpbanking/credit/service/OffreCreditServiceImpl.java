package com.erpbanking.credit.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.client.entity.Client;
import com.erpbanking.compte.service.EmailService;
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

    @Override
    public OffreCreditResponse create(OffreCreditRequest request) {

        // 1. Vérifier la demande
        DemandeCredit demandeCredit = demandeCreditRepository
                .findById(request.getDemandeCreditId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Demande de crédit introuvable : "
                                        + request.getDemandeCreditId()
                        )
                );

        // 2. Vérifier qu'une offre n'existe pas déjà
        if (offreCreditRepository.existsByDemandeCreditId(
                request.getDemandeCreditId())) {

            throw new IllegalArgumentException(
                    "Une offre existe déjà pour cette demande de crédit."
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

        // 8. Envoyer automatiquement le PDF par email au client
        if (client.getEmail() != null && !client.getEmail().isBlank()) {

        String nomClient =
                (client.getNom() != null ? client.getNom() : "") + " " +
                (client.getPrenom() != null ? client.getPrenom() : "");

        System.out.println("9. Envoi email à : " + client.getEmail());

        try {

            emailService.envoyerOffrePdf(
                    client.getEmail(),
                    nomClient.trim(),
                    saved.getNumeroOffre(),
                    pdf
            );

            System.out.println("10. EMAIL ENVOYE !");

        } catch (Exception e) {

            System.err.println("ERREUR ENVOI EMAIL : "
                    + e.getMessage());

            e.printStackTrace();

            // IMPORTANT :
            // On ne bloque pas la création de l'offre
        }

    } else {

        System.out.println("9. Aucun email client, email non envoyé.");
    }

    System.out.println("11. Retour de la réponse");

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

        // 4. Accepter l'offre
        System.out.println("=== CREATION DU CREDIT ===");

        CreditResponse creditResponse =
                creditService.createFromOffre(offreId);

        System.out.println("=== CREDIT CREE ===");

        // 5. Maintenant que le crédit est créé,
        //    marquer l'offre comme acceptée
        offre.setStatut("ACCEPTEE");

        offreCreditRepository.save(offre);

        System.out.println("=== OFFRE ACCEPTEE ===");

        // 6. Envoyer l'email de confirmation
        Client client = offre.getClient();

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
                        offre.getTauxInteret().toString()
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

    // 4. Confirmer par email
    Client client = offre.getClient();

    if (client != null && client.getEmail() != null && !client.getEmail().isBlank()) {

        String nomClient =
                (client.getNom() != null ? client.getNom() : "") + " " +
                (client.getPrenom() != null ? client.getPrenom() : "");

        emailService.envoyerConfirmationOffreRefusee(
                client.getEmail(),
                nomClient.trim(),
                offre.getNumeroOffre()
        );
    }

    return toResponse(saved);
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

