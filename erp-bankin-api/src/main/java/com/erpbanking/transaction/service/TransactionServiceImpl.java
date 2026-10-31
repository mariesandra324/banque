package com.erpbanking.transaction.service;

import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.compte.service.EmailService;
import com.erpbanking.caisse.entity.SessionCaisse;
import com.erpbanking.caisse.entity.StatutSessionCaisse;
import com.erpbanking.caisse.repository.SessionCaisseRepository;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.notification.service.NotificationService;
import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.dto.TransactionResponse;
import com.erpbanking.transaction.entity.Transaction;
import com.erpbanking.transaction.entity.StatutTransaction;
import com.erpbanking.transaction.entity.TypeTransaction;
import com.erpbanking.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CompteRepository compteRepository;
    private final SessionCaisseRepository sessionCaisseRepository;
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
        return effectuerTransaction(request, guichet, null);
    }

    @Override
    @Transactional
    public TransactionResponse effectuerTransaction(TransactionRequest request, Guichet guichet, Long agentId) {
        if (request == null) {
            throw new IllegalArgumentException("La requête de transaction est obligatoire.");
        }
        if (request.getType() == null) {
            throw new IllegalArgumentException("Le type de transaction est obligatoire.");
        }
        if (request.getMontant() == null || request.getMontant().compareTo(new BigDecimal("1.00")) < 0) {
            throw new IllegalArgumentException("Le montant minimum est de 1.00.");
        }
        String numeroCompteSource = request.getNumeroCompteSource();
        if (numeroCompteSource == null || numeroCompteSource.isBlank()) {
            throw new IllegalArgumentException("Le RIB/Numéro du compte source est obligatoire.");
        }

        String numeroCompteDestination = request.getNumeroCompteDestination();
        if (request.getType() == TypeTransaction.VIREMENT) {
            if (numeroCompteDestination == null || numeroCompteDestination.isBlank()) {
                throw new IllegalArgumentException("Le compte destinataire est obligatoire pour un virement.");
            }
            if (numeroCompteSource.equals(numeroCompteDestination)) {
                throw new IllegalArgumentException("Impossible d'effectuer un virement vers le même compte.");
            }
        }

        // Lock accounts in a stable order so concurrent transfers cannot overdraw
        // an account or deadlock by acquiring the same pair in opposite orders.
        Compte compteSource;
        Compte compteDestination = null;
        if (request.getType() == TypeTransaction.VIREMENT) {
            String firstNumero = numeroCompteSource.compareTo(numeroCompteDestination) < 0
                    ? numeroCompteSource : numeroCompteDestination;
            String secondNumero = Objects.equals(firstNumero, numeroCompteSource)
                    ? numeroCompteDestination : numeroCompteSource;
            Compte firstCompte = compteRepository.findByNumeroCompteForUpdate(firstNumero)
                    .orElseThrow(() -> compteNotFound(firstNumero, numeroCompteSource, numeroCompteDestination));
            Compte secondCompte = compteRepository.findByNumeroCompteForUpdate(secondNumero)
                    .orElseThrow(() -> compteNotFound(secondNumero, numeroCompteSource, numeroCompteDestination));
            compteSource = firstNumero.equals(numeroCompteSource) ? firstCompte : secondCompte;
            compteDestination = firstNumero.equals(numeroCompteDestination) ? firstCompte : secondCompte;
        } else {
            compteSource = compteRepository.findByNumeroCompteForUpdate(numeroCompteSource)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Compte source non trouvé : " + numeroCompteSource));
        }

        verifierCompteActif(compteSource, "source");
        if (compteDestination != null) {
            verifierCompteActif(compteDestination, "destination");
        }

        SessionCaisse sessionCaisse = null;
        if (guichet != null && (request.getType() == TypeTransaction.DEPOT
                || request.getType() == TypeTransaction.RETRAIT)) {
            if (agentId == null) {
                throw new IllegalArgumentException("Impossible d'identifier l'agent de la session de caisse.");
            }
            sessionCaisse = sessionCaisseRepository
                    .findByAgentIdAndStatutForUpdate(agentId, StatutSessionCaisse.OUVERT)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Aucune session de caisse ouverte pour ce guichet."));
            if (sessionCaisse.getGuichet() == null
                    || !Objects.equals(sessionCaisse.getGuichet().getId(), guichet.getId())) {
                throw new IllegalArgumentException(
                        "La session de caisse ouverte n'appartient pas à ce guichet.");
            }
        }

        // Validate and calculate every balance change before persisting anything.
        switch (request.getType()) {
            case DEPOT:
                verifierSoldeInitial(compteSource);
                if (sessionCaisse != null) {
                    sessionCaisse.setSoldeTheorique(soldeCaisse(sessionCaisse).add(request.getMontant()));
                }
                compteSource.setSolde(compteSource.getSolde().add(request.getMontant()));
                break;

            case RETRAIT:
                if (compteSource.getSolde() == null || compteSource.getSolde().compareTo(request.getMontant()) < 0) {
                    throw new RuntimeException("Solde insuffisant pour effectuer ce retrait.");
                }
                if (sessionCaisse != null) {
                    BigDecimal cashDisponible = soldeCaisse(sessionCaisse);
                    if (cashDisponible.compareTo(request.getMontant()) < 0) {
                        throw new RuntimeException("Cash physique insuffisant dans la caisse du guichet.");
                    }
                    sessionCaisse.setSoldeTheorique(cashDisponible.subtract(request.getMontant()));
                }
                compteSource.setSolde(compteSource.getSolde().subtract(request.getMontant()));
                break;

            case VIREMENT:
                verifierSoldeInitial(compteDestination);
                if (compteSource.getSolde() == null || compteSource.getSolde().compareTo(request.getMontant()) < 0) {
                    throw new RuntimeException("Solde insuffisant pour effectuer ce virement.");
                }

                compteSource.setSolde(compteSource.getSolde().subtract(request.getMontant()));
                compteDestination.setSolde(compteDestination.getSolde().add(request.getMontant()));
                break;

            default:
                throw new IllegalArgumentException("Type de transaction non valide.");
        }

        // These writes and the transaction record commit or roll back together.
        compteRepository.save(compteSource);
        if (compteDestination != null) {
            compteRepository.save(compteDestination);
        }
        if (sessionCaisse != null) {
            sessionCaisseRepository.save(sessionCaisse);
        }

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

    private BigDecimal soldeCaisse(SessionCaisse sessionCaisse) {
        return sessionCaisse.getSoldeTheorique() == null
                ? BigDecimal.ZERO
                : sessionCaisse.getSoldeTheorique();
    }

    private IllegalArgumentException compteNotFound(
            String numeroCompte,
            String numeroCompteSource,
            String numeroCompteDestination
    ) {
        String role = numeroCompte.equals(numeroCompteSource) ? "source" : "destination";
        return new IllegalArgumentException("Compte " + role + " non trouvé : " + numeroCompte);
    }

    private void verifierCompteActif(Compte compte, String role) {
        String statut = compte.getStatut();
        if (statut == null || !("ACTIVE".equalsIgnoreCase(statut) || "ACTIF".equalsIgnoreCase(statut))) {
            throw new IllegalArgumentException("Le compte " + role + " doit être actif.");
        }
    }

    private void verifierSoldeInitial(Compte compte) {
        if (compte.getSolde() == null) {
            throw new IllegalArgumentException("Le solde du compte doit être renseigné.");
        }
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
        return obtenirParReference(reference);
    }
}