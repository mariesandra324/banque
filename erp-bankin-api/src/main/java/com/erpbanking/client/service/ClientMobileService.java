package com.erpbanking.client.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.auth.dto.MobileInscriptionRequest;
import com.erpbanking.auth.dto.MobileInscriptionResponse;
import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.client.dto.ClientMobileCreateRequest;
import com.erpbanking.client.dto.ClientMobileResponse;
import com.erpbanking.client.entity.ClientMobile;
import com.erpbanking.client.entity.StatutMobile;
import com.erpbanking.client.repository.ClientMobileRepository;
import com.erpbanking.common.ResourceNotFoundException;
import com.erpbanking.common.exception.DuplicateResourceException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientMobileService {

    private final ClientMobileRepository clientMobileRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public ClientMobileResponse creerAccesMobile(
            Long clientId,
            ClientMobileCreateRequest request) {

        // 1. Vérifier que le client existe
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Client introuvable avec l'id : " + clientId
                    )
                );

        // 2. Vérifier si le client possède déjà un accès mobile
        if (clientMobileRepository.existsByClientId(clientId)) {
            throw new DuplicateResourceException(
                "Ce client possède déjà un accès mobile"
            );
        }

        // 3. Vérifier que l'identifiant n'est pas déjà utilisé
        if (clientMobileRepository.existsByIdentifiant(
                request.getIdentifiant())) {

            throw new DuplicateResourceException(
                "Cet identifiant mobile est déjà utilisé"
            );
        }

        // 4. Création du ClientMobile
        ClientMobile clientMobile = new ClientMobile();

        clientMobile.setClient(client);

        clientMobile.setIdentifiant(
            request.getIdentifiant()
        );

        // 5. Hash du mot de passe (le code personnel sert de mot de passe à la connexion)
        String hash = passwordEncoder.encode(
            request.getMotDePasse()
        );
        clientMobile.setMotDePasseHash(hash);
        client.setCodePersonnelHash(hash);
        clientRepository.save(client);

        // 6. Statut initial
        clientMobile.setStatut(
            StatutMobile.EN_ATTENTE
        );

        // 7. Date d'inscription
        clientMobile.setDateInscription(
            LocalDateTime.now()
        );

        // 8. Sauvegarde
        ClientMobile saved =
            clientMobileRepository.save(clientMobile);

        auditService.journaliser(
            AuditAction.CREATION,
            AuditModule.CLIENTS,
            "Accès mobile #" + saved.getId(),
            "Création d'un accès mobile pour le client "
                + client.getPrenom() + " " + client.getNom() + "."
        );

        // 9. Retourner uniquement les informations nécessaires
        return convertirEnResponse(saved);
    }

    /**
     * Inscription depuis l'application mobile : le client existe déjà en base,
     * il demande l'accès mobile en déclarant son revenu et en choisissant son
     * mot de passe (code personnel). La demande reste en attente de validation
     * par un administrateur.
     */
    public MobileInscriptionResponse inscrire(MobileInscriptionRequest request) {

        String cin = request.getCin().trim();
        Client client = clientRepository.findByCin(cin)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Aucun client trouvé avec ce CIN."
                    )
                );

        if (!nomCompletCorrespond(client, request.getNomComplet())) {
            throw new RuntimeException(
                "Le nom complet ne correspond pas à ce client."
            );
        }

        String hash = passwordEncoder.encode(request.getMotDePasse());
        client.setCodePersonnelHash(hash);
        clientRepository.save(client);

        ClientMobile clientMobile = clientMobileRepository
                .findByClientId(client.getId())
                .orElse(null);

        if (clientMobile != null
                && clientMobile.getStatut() == StatutMobile.BLOQUEE) {
            throw new RuntimeException(
                "Votre accès mobile est bloqué. Contactez votre banque."
            );
        }

        if (clientMobile == null) {

            String identifiant = client.getEmail() != null
                    ? client.getEmail()
                    : client.getTelephone();

            clientMobile = new ClientMobile();
            clientMobile.setClient(client);
            clientMobile.setIdentifiant(identifiant);
            clientMobile.setMotDePasseHash(hash);
        } else {

            clientMobile.setMotDePasseHash(hash);
            clientMobile.setDateValidation(null);
        }

        clientMobile.setStatut(StatutMobile.EN_ATTENTE);
        clientMobile.setDateInscription(LocalDateTime.now());

        clientMobileRepository.save(clientMobile);

        return MobileInscriptionResponse.builder()
                .message(
                    "Demande d'inscription envoyée. Votre accès sera validé "
                    + "par l'administration."
                )
                .statut(StatutMobile.EN_ATTENTE)
                .build();
    }

    private boolean nomCompletCorrespond(Client client, String nomComplet) {

        if (nomComplet == null) {
            return false;
        }

        String attendu = nomComplet.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");

        String prenomNom = (client.getPrenom() + " " + client.getNom())
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");

        String nomPrenom = (client.getNom() + " " + client.getPrenom())
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");

        return attendu.equals(prenomNom) || attendu.equals(nomPrenom);
    }

    public List<ClientMobileResponse> listerTous() {

        return clientMobileRepository.findAll()
                .stream()
                .map(this::convertirEnResponse)
                .toList();
    }

    public ClientMobileResponse mettreAJourStatut(
            Long id,
            StatutMobile nouveauStatut) {

        ClientMobile clientMobile = clientMobileRepository
                .findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Accès mobile introuvable avec l'id : " + id
                    )
                );

        if (nouveauStatut == null) {
            throw new IllegalArgumentException(
                "Le statut est obligatoire."
            );
        }

        clientMobile.setStatut(nouveauStatut);

        if (nouveauStatut == StatutMobile.ACTIVE) {
            clientMobile.setDateValidation(LocalDateTime.now());
        }

        ClientMobile saved =
            clientMobileRepository.save(clientMobile);

        auditService.journaliser(
            nouveauStatut == StatutMobile.ACTIVE
                ? AuditAction.VALIDATION
                : AuditAction.REFUS,
            AuditModule.CLIENTS,
            "Accès mobile #" + saved.getId(),
            "Changement du statut de l'accès mobile de "
                + saved.getClient().getPrenom() + " " + saved.getClient().getNom()
                + " vers " + nouveauStatut + "."
        );

        return convertirEnResponse(saved);
    }

    private ClientMobileResponse convertirEnResponse(
            ClientMobile clientMobile) {

        return ClientMobileResponse.builder()
                .id(clientMobile.getId())
                .clientId(clientMobile.getClient().getId())
                .clientNom(clientMobile.getClient().getNom())
                .clientPrenom(clientMobile.getClient().getPrenom())
                .clientCin(clientMobile.getClient().getCin())
                .clientEmail(clientMobile.getClient().getEmail())
                .identifiant(clientMobile.getIdentifiant())
                .statut(clientMobile.getStatut())
                .revenu(clientMobile.getRevenu())
                .dateInscription(
                    clientMobile.getDateInscription()
                )
                .dateValidation(
                    clientMobile.getDateValidation()
                )
                .derniereConnexion(
                    clientMobile.getDerniereConnexion()
                )
                .build();
    }
}