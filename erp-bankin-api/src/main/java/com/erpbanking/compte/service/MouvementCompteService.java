package com.erpbanking.compte.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.entity.TypeTransaction;
import com.erpbanking.transaction.service.TransactionService;

import lombok.RequiredArgsConstructor;

/**
 * Mouvements de solde automatiques liés aux crédits :
 * <ul>
 *   <li>créditer le compte du client lors du déblocage d'un crédit ;</li>
 *   <li>débiter le compte du client lors du remboursement d'une échéance.</li>
 * </ul>
 * Le compte cible est celui précisé par la demande de crédit (compteId) ;
 * à défaut, le premier compte courant actif du client, sinon le premier
 * compte actif.
 */
@Service
@RequiredArgsConstructor
public class MouvementCompteService {

    private final CompteRepository compteRepository;
    private final TransactionService transactionService;

    @Transactional
    public void crediterClient(Long clientId, Long compteId, BigDecimal montant, String description) {
        Compte compte = compteCible(clientId, compteId);
        TransactionRequest request = new TransactionRequest();
        request.setType(TypeTransaction.DEPOT);
        request.setMontant(montant);
        request.setNumeroCompteSource(compte.getNumeroCompte());
        request.setDescription(description);
        transactionService.effectuerTransaction(request);
    }

    @Transactional
    public void debiterClient(Long clientId, Long compteId, BigDecimal montant, String description) {
        Compte compte = compteCible(clientId, compteId);
        TransactionRequest request = new TransactionRequest();
        request.setType(TypeTransaction.RETRAIT);
        request.setMontant(montant);
        request.setNumeroCompteSource(compte.getNumeroCompte());
        request.setDescription(description);
        transactionService.effectuerTransaction(request);
    }

    private Compte compteCible(Long clientId, Long compteId) {
        if (compteId != null) {
            Compte compte = compteRepository.findById(compteId)
                    .orElseThrow(() ->
                            new IllegalArgumentException("Compte introuvable : " + compteId));
            if (compte.getClient() == null
                    || !compte.getClient().getId().equals(clientId)) {
                throw new IllegalArgumentException(
                        "Ce compte n'appartient pas au client concerné.");
            }
            return compte;
        }

        List<Compte> comptes = compteRepository.findByClientId(clientId);
        if (comptes.isEmpty()) {
            throw new IllegalStateException(
                    "Aucun compte bancaire associé au client pour cette opération.");
        }

        return comptes.stream()
                .filter(c -> "Courant".equalsIgnoreCase(c.getTypeCompte())
                        && "ACTIF".equalsIgnoreCase(c.getStatut()))
                .findFirst()
                .orElseGet(() -> comptes.stream()
                        .filter(c -> "ACTIF".equalsIgnoreCase(c.getStatut()))
                        .findFirst()
                        .orElse(comptes.get(0)));
    }
}