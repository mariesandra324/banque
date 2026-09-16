package com.erpbanking.credit.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.credit.dto.RemboursementResponse;
import com.erpbanking.credit.entity.Credit;
import com.erpbanking.credit.entity.Echeance;
import com.erpbanking.credit.entity.Remboursement;
import com.erpbanking.credit.entity.StatutCredit;
import com.erpbanking.credit.entity.StatutEcheance;
import com.erpbanking.credit.repository.CreditRepository;
import com.erpbanking.credit.repository.EcheanceRepository;
import com.erpbanking.credit.repository.RemboursementRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RemboursementService {

    private final CreditRepository creditRepository;
    private final EcheanceRepository echeanceRepository;
    private final RemboursementRepository remboursementRepository;

    /**
     * Effectuer le remboursement complet d'une échéance.
     */
    @Transactional
    public RemboursementResponse effectuerRemboursement(
            Long creditId,
            Long echeanceId) {

        // 1. Récupérer le crédit
        Credit credit = creditRepository.findById(creditId)
                .orElseThrow(() ->
                        new RuntimeException("Crédit introuvable"));

        // 2. Récupérer l'échéance
        Echeance echeance = echeanceRepository.findById(echeanceId)
                .orElseThrow(() ->
                        new RuntimeException("Échéance introuvable"));

        // 3. Vérifier que l'échéance appartient bien au crédit
        if (!echeance.getCredit().getId().equals(credit.getId())) {
            throw new RuntimeException(
                    "Cette échéance n'appartient pas à ce crédit"
            );
        }

        // 4. Vérifier que l'échéance n'est pas déjà payée
        if (echeance.getStatut() == StatutEcheance.PAYEE) {
            throw new RuntimeException(
                    "Cette échéance a déjà été payée"
            );
        }

        // 5. Vérifier que le crédit est encore actif
        if (credit.getStatut() == StatutCredit.SOLDE) {
            throw new RuntimeException(
                    "Ce crédit est déjà soldé"
            );
        }

        // 6. Créer le remboursement
        Remboursement remboursement = Remboursement.builder()
                .numeroRemboursement(genererNumeroRemboursement())
                .montant(echeance.getMontant())
                .dateRemboursement(LocalDateTime.now())
                .credit(credit)
                .echeance(echeance)
                .build();

        // 7. Marquer l'échéance comme payée
        echeance.setStatut(StatutEcheance.PAYEE);

        echeanceRepository.save(echeance);

        // 8. Diminuer le capital restant du crédit
        BigDecimal nouveauCapitalRestant =
                credit.getCapitalRestant()
                        .subtract(echeance.getCapital());

        // Éviter un montant négatif à cause des arrondis
        if (nouveauCapitalRestant.compareTo(BigDecimal.ZERO) < 0) {
            nouveauCapitalRestant = BigDecimal.ZERO;
        }

        credit.setCapitalRestant(nouveauCapitalRestant);

        // 9. Si le capital restant est à zéro,
        // le crédit est soldé
        if (nouveauCapitalRestant.compareTo(BigDecimal.ZERO) == 0) {
            credit.setStatut(StatutCredit.SOLDE);
        }

        creditRepository.save(credit);

        // 10. Enregistrer le remboursement
        Remboursement saved =
                remboursementRepository.save(remboursement);

        return RemboursementResponse.builder()
                .id(saved.getId())
                .numeroRemboursement(saved.getNumeroRemboursement())
                .montant(saved.getMontant())
                .dateRemboursement(saved.getDateRemboursement())
                .creditId(saved.getCredit().getId())
                .echeanceId(saved.getEcheance().getId())
                .build();
    }

    /**
     * Récupérer tous les remboursements d'un crédit.
     */
    public List<RemboursementResponse> getRemboursementsByCredit(Long creditId) {

        return remboursementRepository
                .findByCreditIdOrderByDateRemboursementDesc(creditId)
                .stream()
                .map(r -> RemboursementResponse.builder()
                        .id(r.getId())
                        .numeroRemboursement(r.getNumeroRemboursement())
                        .montant(r.getMontant())
                        .dateRemboursement(r.getDateRemboursement())
                        .creditId(r.getCredit().getId())
                        .echeanceId(r.getEcheance().getId())
                        .build())
                .toList();
    }

    /**
     * Générer un numéro unique de remboursement.
     */
    private String genererNumeroRemboursement() {

        return "REMB-" +
                LocalDateTime.now().getYear() +
                "-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }
}