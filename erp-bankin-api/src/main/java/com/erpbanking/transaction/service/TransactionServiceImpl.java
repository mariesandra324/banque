package com.erpbanking.transaction.service;

import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.compte.service.EmailService;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.notification.service.NotificationService;
import com.erpbanking.notification.service.NotificationService;
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
    private final NotificationService notificationService;
    private final AuditService auditService;

    private NotificationType typeClientSource(Transaction transaction) {
        return switch (transaction.getType()) {
            case DEPOT -> NotificationType.DEPOT_EFFECTUE;
            case RETRAIT -> NotificationType.RETRAIT_EFFECTUE;
            case VIREMENT -> NotificationType.VIREMENT_EFFECTUE;
        };
    }

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

    NotificationType type = typeClientSource(transaction);
    String message = switch (type) {
        case DEPOT_EFFECTUE ->
            "Dépôt de " + transaction.getMontant() + " Ar effectué sur votre compte " + compteSource.getNumeroCompte();
        case RETRAIT_EFFECTUE ->
            "Retrait de " + transaction.getMontant() + " Ar effectué sur votre compte " + compteSource.getNumeroCompte();
        default ->
            "Virement de " + transaction.getMontant() + " Ar effectué depuis votre compte " + compteSource.getNumeroCompte();
    };

    if (notificationService.emailActivePourClient(compteSource.getClient().getId(), type)) {
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

    notificationService.creerPourClient(
            compteSource.getClient().getId(),
            type,
            message,
            transaction.getReference()
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

    if (notificationService.emailActivePourClient(compteDestination.getClient().getId(), NotificationType.VIREMENT_RECU)) {
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

    notificationService.creerPourClient(
            compteDestination.getClient().getId(),
            NotificationType.VIREMENT_RECU,
            "Vous avez reçu un virement de " + transaction.getMontant() + " Ar sur votre compte " + compteDestination.getNumeroCompte(),
            transaction.getReference()
    );
}
    @Override
    @Transactional 
    public TransactionResponse effectuerTransaction(TransactionRequest request) {
        return effectuerTransaction(request, null);
    }

    @Override
    @Transactional
    public TransactionResponse effectuerTransaction(TransactionRequest request, Guichet guichet) {

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
                .guichet(guichet)
                .build();

        Transaction savedTx = transactionRepository.save(transaction);
        envoyerNotificationTransactionSource(savedTx);
        envoyerNotificationTransactionDestination(savedTx);

        String detail = "Transaction " + savedTx.getReference()
                + " (" + savedTx.getType() + ") d'un montant de "
                + savedTx.getMontant() + " Ar.";

        notificationService.creerPourRole(
                NotificationType.TRANSACTION_EFFECTUEE,
                detail,
                "/transactions"
        );

        notificationService.creerPourRole(
                NotificationType.TRANSACTION_A_COMPTABILISER,
                detail,
                "/transactions"
        );

        AuditAction auditAction = switch (savedTx.getType()) {
            case DEPOT -> AuditAction.DEPOT;
            case RETRAIT -> AuditAction.RETRAIT;
            case VIREMENT -> AuditAction.VIREMENT;
        };
        String auditDescription = detail;
        auditService.journaliser(
                auditAction,
                AuditModule.TRANSACTIONS,
                "Transaction #" + savedTx.getId(),
                auditDescription
        );

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
                .codeGuichet(tx.getGuichet() != null ? tx.getGuichet().getCodeGuichet() : null)
                .build();
    }

    @Override
    public TransactionResponse obtenirReference(String reference) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenirReference'");
    }
}