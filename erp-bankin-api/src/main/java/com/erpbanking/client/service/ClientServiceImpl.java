package com.erpbanking.client.service;
import java.util.Objects;

import com.erpbanking.client.dto.ClientDossierResponse;
import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;
import com.erpbanking.client.entity.Client;
import com.erpbanking.client.mapper.ClientMapper;
import com.erpbanking.compte.entity.Carte;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.client.repository.ClientRepository;
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
import com.erpbanking.transaction.dto.TransactionResponse;
import com.erpbanking.transaction.entity.Transaction;
import com.erpbanking.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {


    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final CompteRepository compteRepository;
    private final CarteRepository carteRepository;
    private final TransactionRepository transactionRepository;
    private final DemandeCreditRepository demandeCreditRepository;
    private final OffreCreditRepository offreCreditRepository;
    private final CreditRepository creditRepository;

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

        return clientMapper.toResponse(saved);
    }


    @Override
    public List<ClientResponse> findAll() {
        return clientRepository.findAll()
                .stream()
                .map(clientMapper::toResponse)
                .toList();
    }


    @Override
    public ClientResponse findById(Long id) {

        Client client = (Client) clientRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );

        return clientMapper.toResponse(client);
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

        return clientMapper.toResponse(updated);
    }


    @Override
    public void delete(Long id) {

        clientRepository.deleteById(id);
    }

    @Override
    public List<ClientResponse> searchClients(String query) {
        return clientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCinContainingIgnoreCase(
            query, query, query, query, query
        ).stream()
         .map(clientMapper::toResponse)
         .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDossierResponse getDossier(Long clientId) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() ->
                        new RuntimeException("Client introuvable")
                );

        ClientResponse clientResponse =
                clientMapper.toResponse(client);

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