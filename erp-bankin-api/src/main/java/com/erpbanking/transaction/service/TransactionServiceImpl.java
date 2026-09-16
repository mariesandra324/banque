package com.erpbanking.transaction.service;

import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.compte.service.EmailService;
import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.dto.TransactionResponse;
import com.erpbanking.transaction.entity.Transaction;
import com.erpbanking.transaction.entity.StatutTransaction;
import com.erpbanking.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CompteRepository compteRepository;
    private final EmailService emailService;

    private void envoyerNotificationTransactionSource(Transaction transaction) {

    Compte compteSource = transaction.getCompteSource();

    if (compteSource == null || compteSource.getClient() == null) {
        return;
    }

    if (compteSource.getClient().getEmail() == null ||
        compteSource.getClient().getEmail().isBlank()) {
        return;
    }

    String nomClient =
            compteSource.getClient().getPrenom()
                    + " "
                    + compteSource.getClient().getNom();

    emailService.envoyerNotificationTransaction(
            compteSource.getClient().getEmail(),
            nomClient,
            transaction.getType().name(),
            transaction.getMontant().toString(),
            compteSource.getNumeroCompte(),
            transaction.getReference(),
            transaction.getDateTransaction().toString(),
            transaction.getDescription()
    );
}
private void envoyerNotificationTransactionDestination(
        Transaction transaction
) {

    Compte compteDestination =
            transaction.getCompteDestination();

    if (compteDestination == null ||
        compteDestination.getClient() == null) {
        return;
    }

    if (compteDestination.getClient().getEmail() == null ||
        compteDestination.getClient().getEmail().isBlank()) {
        return;
    }

    String nomClient =
            compteDestination.getClient().getPrenom()
                    + " "
                    + compteDestination.getClient().getNom();

    emailService.envoyerNotificationTransaction(
            compteDestination.getClient().getEmail(),
            nomClient,
            "VIREMENT REÇU",
            transaction.getMontant().toString(),
            compteDestination.getNumeroCompte(),
            transaction.getReference(),
            transaction.getDateTransaction().toString(),
            transaction.getDescription()
    );
}
    @Override
    @Transactional 
    public TransactionResponse effectuerTransaction(TransactionRequest request) {

        // 1. Récupération du compte source
        Compte compteSource = compteRepository.findByNumeroCompte(request.getNumeroCompteSource())
                .orElseThrow(() -> new RuntimeException("Compte source non trouvé : " + request.getNumeroCompteSource()));

        // 2. Traitement selon le type de transaction
        Compte compteDestination = null;

        switch (request.getType()) {
            case DEPOT:
                compteSource.setSolde(compteSource.getSolde().add(request.getMontant()));
                break;

            case RETRAIT:
                if (compteSource.getSolde().compareTo(request.getMontant()) < 0) {
                    throw new RuntimeException("Solde insuffisant pour effectuer ce retrait.");
                }
                compteSource.setSolde(compteSource.getSolde().subtract(request.getMontant()));
                break;

            case VIREMENT:
                if (request.getNumeroCompteDestination() == null || request.getNumeroCompteDestination().isBlank()) {
                    throw new RuntimeException("Le compte destinataire est obligatoire pour un virement.");
                }
                if (request.getNumeroCompteSource().equals(request.getNumeroCompteDestination())) {
                    throw new RuntimeException("Impossible d'effectuer un virement vers le même compte.");
                }

                compteDestination = compteRepository.findByNumeroCompte(request.getNumeroCompteDestination())
                        .orElseThrow(() -> new RuntimeException("Compte destination non trouvé : " + request.getNumeroCompteDestination()));

                if (compteSource.getSolde().compareTo(request.getMontant()) < 0) {
                    throw new RuntimeException("Solde insuffisant pour effectuer ce virement.");
                }

                // Débit / Crédit
                compteSource.setSolde(compteSource.getSolde().subtract(request.getMontant()));
                compteDestination.setSolde(compteDestination.getSolde().add(request.getMontant()));

                compteRepository.save(compteDestination);
                break;

            default:
                throw new IllegalArgumentException("Type de transaction non valide.");
        }

        // Sauvegarder la mise à jour du compte source
        compteRepository.save(compteSource);

        // 3. Création et enregistrement de la transaction
        Transaction transaction = Transaction.builder()
                .reference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .type(request.getType())
                .montant(request.getMontant())
                .dateTransaction(LocalDateTime.now())
                .description(request.getDescription())
                .statut(StatutTransaction.SUCCES)
                .compteSource(compteSource)
                .compteDestination(compteDestination)
                .build();

        Transaction savedTx = transactionRepository.save(transaction);
        envoyerNotificationTransactionSource(savedTx);
        envoyerNotificationTransactionDestination(savedTx);
        return mapToResponse(savedTx);
    }

    @Override
    public List<TransactionResponse> obtenirHistoriqueCompte(String numeroCompte) {
        return transactionRepository.findByNumeroCompte(numeroCompte)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TransactionResponse> obtenirHistoriqueClient(Long clientId) {
        return transactionRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TransactionResponse> obtenirToutesTransactions() {
        return transactionRepository.findAllWithAccountsOrderByDateTransactionDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TransactionResponse obtenirParReference(String reference) {
        Transaction tx = transactionRepository.findByReference(reference);
        if (tx == null) {
            throw new RuntimeException("Transaction non trouvée avec la référence : " + reference);
        }
        return mapToResponse(tx);
    }

    private TransactionResponse mapToResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .reference(tx.getReference())
                .type(tx.getType())
                .montant(tx.getMontant())
                .dateTransaction(tx.getDateTransaction())
                .description(tx.getDescription())
                .statut(tx.getStatut())
                .numeroCompteSource(tx.getCompteSource() != null ? tx.getCompteSource().getNumeroCompte() : null)
                .numeroCompteDestination(tx.getCompteDestination() != null ? tx.getCompteDestination().getNumeroCompte() : null)
                .build();
    }

    @Override
    public TransactionResponse obtenirReference(String reference) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenirReference'");
    }
}