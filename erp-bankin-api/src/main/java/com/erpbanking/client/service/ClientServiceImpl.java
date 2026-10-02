package com.erpbanking.client.service;
import java.util.Objects;

import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.client.dto.ClientDossierResponse;
import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;
import com.erpbanking.client.entity.Client;
import com.erpbanking.client.entity.ClientMobile;
import com.erpbanking.client.entity.StatutMobile;
import com.erpbanking.client.mapper.ClientMapper;
import com.erpbanking.compte.entity.Carte;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.client.repository.ClientMobileRepository;
import com.erpbanking.common.exception.DuplicateResourceException;
import com.erpbanking.compte.dto.CarteResponse;
import com.erpbanking.compte.repository.CarteRepository;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.dto.OffreCreditResponse;
import com.erpbanking.credit.entity.Credit;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.OffreCredit;
import com.erpbanking.credit.repository.CreditRepository;
import com.erpbanking.credit.repository.DemandeCreditRepository;
import com.erpbanking.credit.repository.OffreCreditRepository;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.notification.service.NotificationService;
import com.erpbanking.transaction.dto.TransactionResponse;
import com.erpbanking.transaction.entity.Transaction;
import com.erpbanking.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {


    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final ClientMobileRepository clientMobileRepository;
    private final CompteRepository compteRepository;
    private final CarteRepository carteRepository;
    private final TransactionRepository transactionRepository;
    private final DemandeCreditRepository demandeCreditRepository;
    private final OffreCreditRepository offreCreditRepository;
    private final CreditRepository creditRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final AuditService auditService;

    private CompteResponse mapCompteToResponse(Compte compte) {
    return CompteResponse.builder()
            .id(compte.getId())
            .numeroCompte(compte.getNumeroCompte())
            .typeCompte(compte.getTypeCompte())
            .solde(compte.getSolde())
            .statut(compte.getStatut())
            .dateCreation(compte.getDateCreation())
            .clientId(compte.getClient() != null ? compte.getClient().getId() : null)
            .codeBanque(compte.getCodeBanque())
            .codeGuichet(compte.getCodeGuichet())
            .cleRib(compte.getCleRib())
            .iban(compte.getIban())
            .build();
}
private CarteResponse mapCarteToResponse(Carte carte) {
    return CarteResponse.builder()
            .id(carte.getId())
            .numeroCarte(carte.getNumeroCarte())
            .dateExpiration(carte.getDateExpiration())
            .typeCarte(carte.getTypeCarte())
            .statut(carte.getStatut())
            .compteId(carte.getCompte() != null? carte.getCompte().getId(): null)
            .build();
}
private TransactionResponse mapTransactionToResponse(Transaction transaction) {
    return TransactionResponse.builder()
            .id(transaction.getId())
            .reference(transaction.getReference())
            .type(transaction.getType())
            .montant(transaction.getMontant())
            .dateTransaction(transaction.getDateTransaction())
            .description(transaction.getDescription())
            .statut(transaction.getStatut())
            .numeroCompteSource(transaction.getCompteSource() != null? transaction.getCompteSource().getNumeroCompte(): null)
            .numeroCompteDestination(transaction.getCompteDestination() != null? transaction.getCompteDestination().getNumeroCompte(): null)
            .build();
}
private DemandeCreditResponse mapDemandeCreditToResponse(DemandeCredit demande) {
    return DemandeCreditResponse.builder()
            .id(demande.getId())
            .montantDemande(demande.getMontantDemande())
            .duree(demande.getDuree())
            .tauxInteret(demande.getTauxInteret())
            .motif(demande.getMotif())
            .dateDemande(demande.getDateDemande())
            .statut(demande.getStatut())
            .dateDecision(demande.getDateDecision())
            .motifRejet(demande.getMotifRejet())
            .profession(demande.getProfession())
            .typeContrat(demande.getTypeContrat())
            .revenuMensuel(demande.getRevenuMensuel())
            .chargesMensuelles(demande.getChargesMensuelles())
            .clientId(demande.getClient() != null? demande.getClient().getId() : null)
            .clientNom(demande.getClient() != null? demande.getClient().getNom(): null)
            .clientPrenom(demande.getClient() != null? demande.getClient().getPrenom(): null)
            .build();
}
private OffreCreditResponse mapOffreCreditToResponse(OffreCredit offre) {
    return OffreCreditResponse.builder()
            .id(offre.getId())
            .numeroOffre(offre.getNumeroOffre())
            .demandeCreditId(offre.getDemandeCredit() != null? offre.getDemandeCredit().getId(): null)
            .demandeProfession(offre.getDemandeCredit() != null? offre.getDemandeCredit().getProfession(): null)
            .demandeTypeContrat(offre.getDemandeCredit() != null? offre.getDemandeCredit().getTypeContrat(): null)
            .demandeMotif(offre.getDemandeCredit() != null? offre.getDemandeCredit().getMotif(): null)
            .demandeDateDecision(offre.getDemandeCredit() != null? offre.getDemandeCredit().getDateDecision(): null)
            .clientId(offre.getClient() != null? offre.getClient().getId() : null)
            .clientNom(offre.getClient() != null? offre.getClient().getNom(): null)
            .clientPrenom(offre.getClient() != null? offre.getClient().getPrenom(): null)
            .montantPropose(offre.getMontantPropose())
            .tauxInteret(offre.getTauxInteret())
            .duree(offre.getDuree())
            .mensualite(offre.getMensualite())
            .dateOffre(offre.getDateOffre())
            .dateExpiration(offre.getDateExpiration())
            .conditions(offre.getConditions())
            .statut(offre.getStatut())
            .build();
}
private CreditResponse mapCreditToResponse(Credit credit) {
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
            .demandeCreditId(credit.getDemandeCredit() != null? credit.getDemandeCredit().getId() : null)
            .clientId(credit.getClient() != null? credit.getClient().getId(): null)
            .clientNom(credit.getClient() != null? credit.getClient().getNom(): null )
            .clientPrenom(credit.getClient() != null? credit.getClient().getPrenom(): null)
            .build();
}
    @Override
    public ClientResponse create(ClientRequest request) {
        if (clientRepository.existsByCin(request.getCin())) {
            throw new RuntimeException("CIN déjà utilisé");
        }

        Client client = clientMapper.toEntity(request);
        Client saved = clientRepository.save(client);

        if (Boolean.TRUE.equals(request.getCreerAccesMobile())) {
            creerAccesMobileInitial(saved, request);
        }

        String nomComplet = (saved.getPrenom() != null ? saved.getPrenom() : "")
                + " " + (saved.getNom() != null ? saved.getNom() : "");
        String lien = "/clients/" + saved.getId();

        notificationService.creerPourRole(
                NotificationType.CLIENT_CREE,
                nomComplet.trim() + " (CIN " + saved.getCin() + ") vient d'être enregistré.",
                lien
        );

        notificationService.creerPourRole(
                NotificationType.CLIENT_A_TRAITER,
                nomComplet.trim() + " a été enregistré et doit être vérifié.",
                lien
        );

        auditService.journaliser(
                AuditAction.CREATION,
                AuditModule.CLIENTS,
                "Client #" + saved.getId(),
                "Création du client " + nomComplet.trim() + " (CIN " + saved.getCin() + ")."
        );

        return mapAvecMobile(clientMapper.toResponse(saved));
    }

    private void creerAccesMobileInitial(Client client, ClientRequest request) {

        String identifiant = (request.getIdentifiantMobile() != null
                && !request.getIdentifiantMobile().isBlank())
                    ? request.getIdentifiantMobile().trim()
                    : (client.getEmail() != null
                        ? client.getEmail()
                        : client.getTelephone());

        if (clientMobileRepository.existsByIdentifiant(identifiant)) {
            throw new DuplicateResourceException(
                "Cet identifiant mobile est déjà utilisé"
            );
        }

        // Par défaut le code personnel vaut 000000 ; le client le
        // modifiera selon ses choix depuis l'application mobile.
        String codePersonnel = (request.getCodePersonnel() != null
                && !request.getCodePersonnel().isBlank())
                    ? request.getCodePersonnel().trim()
                    : "000000";

        String hash = passwordEncoder.encode(codePersonnel);

        ClientMobile clientMobile = ClientMobile.builder()
                .client(client)
                .identifiant(identifiant)
                .motDePasseHash(hash)
                .statut(StatutMobile.EN_ATTENTE)
                .dateInscription(java.time.LocalDateTime.now())
                .build();

        clientMobileRepository.save(clientMobile);

        client.setCodePersonnelHash(hash);
        clientRepository.save(client);
    }   


    @Override
    public List<ClientResponse> findAll() {
        return clientRepository.findAll()
                .stream()
                .map(clientMapper::toResponse)
                .map(this::mapAvecMobile)
                .toList();
    }


    @Override
    public ClientResponse findById(Long id) {

        Client client = (Client) clientRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );

        return mapAvecMobile(clientMapper.toResponse(client));
    }


    @Override
    public ClientResponse update(Long id, ClientRequest request) {

        Client client = (Client) clientRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );
        
        if (!request.getCin().equals(client.getCin()) && clientRepository.existsByCin(request.getCin())) {
            throw new RuntimeException("CIN déjà utilisé");
        }
        if (!request.getEmail().equals(client.getEmail()) && clientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Cet email est déjà utilisé par un autre client.");
        }
 
        if (!request.getTelephone().equals(client.getTelephone()) && clientRepository.existsByTelephone(request.getTelephone())) {
            throw new DuplicateResourceException("Ce numéro de téléphone est déjà utilisé par un autre client.");
        }

        client.setNom(request.getNom());
        client.setPrenom(request.getPrenom());
        client.setCin(request.getCin());
        client.setEmail(request.getEmail());
        client.setTelephone(request.getTelephone());
        client.setAdresse(request.getAdresse());
        client.setDateNaissance(request.getDateNaissance());


        Client updated = clientRepository.save(client);

        auditService.journaliser(
                AuditAction.MODIFICATION,
                AuditModule.CLIENTS,
                "Client #" + updated.getId(),
                "Modification de la fiche client " + updated.getPrenom() + " " + updated.getNom() + "."
        );

        return clientMapper.toResponse(updated);
    }


    @Override
    public void delete(Long id) {

        Client client = clientRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );

        String identite = client.getPrenom() + " " + client.getNom();

        clientRepository.deleteById(id);

        auditService.journaliser(
                AuditAction.SUPPRESSION,
                AuditModule.CLIENTS,
                "Client #" + id,
                "Suppression du client " + identite + "."
        );
    }

    @Override
    public List<ClientResponse> searchClients(String query) {
        return clientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCinContainingIgnoreCase(
            query, query, query, query, query
        ).stream()
         .map(clientMapper::toResponse)
         .map(this::mapAvecMobile)
         .toList();
    }

    private ClientResponse mapAvecMobile(ClientResponse response) {

        clientMobileRepository.findByClientId(response.getId())
                .ifPresent(mobile -> {
                    response.setMobileStatut(mobile.getStatut());
                    response.setMobileIdentifiant(mobile.getIdentifiant());
                    response.setMobileDateInscription(mobile.getDateInscription());
                });

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDossierResponse getDossier(Long clientId) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() ->
                        new RuntimeException("Client introuvable")
                );

        ClientResponse clientResponse =
                mapAvecMobile(clientMapper.toResponse(client));

        List<CompteResponse> comptes =
                compteRepository.findByClientId(clientId)
                        .stream()
                        .map(this::mapCompteToResponse)
                        .toList();

        List<CarteResponse> cartes =
                carteRepository.findByClientId(clientId)
                        .stream()
                        .map(this::mapCarteToResponse)
                        .toList();

        List<TransactionResponse> transactions =
                transactionRepository.findByClientId(clientId)
                        .stream()
                        .map(this::mapTransactionToResponse)
                        .toList();

        List<DemandeCreditResponse> demandesCredit =
                demandeCreditRepository.findByClientId(clientId)
                        .stream()
                        .map(this::mapDemandeCreditToResponse)
                        .toList();

        List<OffreCreditResponse> offresCredit =
                offreCreditRepository.findByClientId(clientId)
                        .stream()
                        .map(this::mapOffreCreditToResponse)
                        .toList();

        List<CreditResponse> credits =
                creditRepository.findByClientId(clientId)
                        .stream()
                        .map(this::mapCreditToResponse)
                        .toList();

        BigDecimal soldeTotal = comptes
                .stream()
                .map(CompteResponse::getSolde)
                .filter(Objects::nonNull)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return ClientDossierResponse.builder()
                .client(clientResponse)
                .comptes(comptes)
                .cartes(cartes)
                .transactions(transactions)
                .demandesCredit(demandesCredit)
                .offresCredit(offresCredit)
                .credits(credits)
                .soldeTotal(soldeTotal)
                .build();
    }
}