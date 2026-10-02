package com.erpbanking.credit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.client.entity.Client;
import com.erpbanking.credit.dto.EcheanceResponse;
import com.erpbanking.credit.dto.EcheancierGlobalResponse;
import com.erpbanking.credit.entity.Credit;
import com.erpbanking.credit.entity.Echeance;
import com.erpbanking.credit.entity.StatutEcheance;
import com.erpbanking.credit.repository.EcheanceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EcheancierService {

    private final EcheanceRepository echeanceRepository;

    private static final int SCALE = 2;

    /**
     * Génère automatiquement toutes les échéances
     * d'un crédit.
     */
    @Transactional
    public void genererEcheancier(Credit credit) {

        // Évite de créer deux fois le même échéancier
        if (echeanceRepository.existsByCreditId(credit.getId())) {
            return;
        }

        BigDecimal montantCredit = credit.getMontant()
                .setScale(SCALE, RoundingMode.HALF_UP);

        BigDecimal tauxAnnuel = credit.getTauxInteret()
                .setScale(10, RoundingMode.HALF_UP);

        int duree = credit.getDuree();

        BigDecimal mensualite = credit.getMensualite()
                .setScale(SCALE, RoundingMode.HALF_UP);

        BigDecimal tauxMensuel = tauxAnnuel
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);

        BigDecimal capitalRestant = montantCredit;

        LocalDate datePremiereEcheance =
                credit.getDateDebut().plusMonths(1).toLocalDate();

        for (int i = 1; i <= duree; i++) {

            // Intérêt du mois
            BigDecimal interet = capitalRestant
                    .multiply(tauxMensuel)
                    .setScale(SCALE, RoundingMode.HALF_UP);

            // Partie de la mensualité qui rembourse le capital
            BigDecimal capital = mensualite
                    .subtract(interet)
                    .setScale(SCALE, RoundingMode.HALF_UP);

            // Pour la dernière échéance,
            // on ajuste le capital afin d'éviter un solde négatif.
            if (i == duree) {
                capital = capitalRestant;
                mensualite = capital
                        .add(interet)
                        .setScale(SCALE, RoundingMode.HALF_UP);
            }

            capitalRestant = capitalRestant
                    .subtract(capital)
                    .setScale(SCALE, RoundingMode.HALF_UP);

            if (capitalRestant.compareTo(BigDecimal.ZERO) < 0) {
                capitalRestant = BigDecimal.ZERO;
            }

            LocalDate dateEcheance =
                    datePremiereEcheance.plusMonths(i - 1);

            Echeance echeance = Echeance.builder()
                    .numeroEcheance(i)
                    .dateEcheance(dateEcheance)
                    .montant(mensualite)
                    .capital(capital)
                    .interet(interet)
                    .capitalRestant(capitalRestant)
                    .statut(StatutEcheance.EN_ATTENTE)
                    .credit(credit)
                    .build();

            echeanceRepository.save(echeance);
        }
    }

    /**
     * Récupérer l'échéancier d'un crédit.
     */
    public List<EcheanceResponse> getEcheancier(Long creditId) {
        return echeanceRepository
                .findByCreditIdOrderByNumeroEcheanceAsc(creditId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private EcheanceResponse toResponse(Echeance echeance) {
        return EcheanceResponse.builder()
                .id(echeance.getId())
                .numeroEcheance(echeance.getNumeroEcheance())
                .dateEcheance(echeance.getDateEcheance())
                .montant(echeance.getMontant())
                .capital(echeance.getCapital())
                .interet(echeance.getInteret())
                .capitalRestant(echeance.getCapitalRestant())
                .statut(echeance.getStatut())
                .build();
    }

    /**
     * Échéancier global de tous les crédits, utilisé par la page
     * Comptabilité. Un statut nul ou "TOUS" renvoie toutes les échéances.
     */
    @Transactional(readOnly = true)
    public List<EcheancierGlobalResponse> getEcheancierGlobal(StatutEcheance statut) {

        List<Echeance> echeances = (statut == null)
                ? echeanceRepository.findAllAvecCreditClient()
                : echeanceRepository.findTousAvecCreditClientParStatut(statut);

        return echeances.stream()
                .map(this::toGlobalResponse)
                .toList();
    }

    private EcheancierGlobalResponse toGlobalResponse(Echeance echeance) {
        Credit credit = echeance.getCredit();
        Client client = credit != null ? credit.getClient() : null;

        return EcheancierGlobalResponse.builder()
                .id(echeance.getId())
                .numeroEcheance(echeance.getNumeroEcheance())
                .dateEcheance(echeance.getDateEcheance())
                .montant(echeance.getMontant())
                .capital(echeance.getCapital())
                .interet(echeance.getInteret())
                .capitalRestant(echeance.getCapitalRestant())
                .statut(echeance.getStatut())
                .creditId(credit != null ? credit.getId() : null)
                .numeroCredit(credit != null ? credit.getNumeroCredit() : null)
                .clientId(client != null ? client.getId() : null)
                .clientNom(client != null ? client.getNom() : null)
                .clientPrenom(client != null ? client.getPrenom() : null)
                .build();
    }
}
