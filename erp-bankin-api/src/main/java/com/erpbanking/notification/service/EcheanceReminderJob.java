package com.erpbanking.notification.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.client.entity.Client;
import com.erpbanking.credit.entity.Echeance;
import com.erpbanking.credit.entity.StatutEcheance;
import com.erpbanking.credit.repository.EcheanceRepository;
import com.erpbanking.notification.entity.NotificationType;

import lombok.RequiredArgsConstructor;

/**
 * Rappelle aux clients leurs échéances de crédit proches (7 jours).
 * S'exécute chaque matin à 06h00 et ne notifie chaque échéance qu'une fois
 * (grâce au lien unique "echeance:<id>").
 */
@Component
@RequiredArgsConstructor
public class EcheanceReminderJob {

    private static final int HORIZON_JOURS = 7;

    private final EcheanceRepository echeanceRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void rappelerEcheancesProches() {

        LocalDate debut = LocalDate.now();
        LocalDate fin = debut.plusDays(HORIZON_JOURS);

        List<Echeance> echeances = echeanceRepository
                .findByDateEcheanceBetweenAndStatutNot(debut, fin, StatutEcheance.PAYEE);

        for (Echeance echeance : echeances) {

            Client client = echeance.getCredit().getClient();
            if (client == null) {
                continue;
            }

            String lien = "echeance:" + echeance.getId();
            if (notificationService.existeDeja(
                    client.getId(), NotificationType.ECHEANCE_PROCHAINE, lien)) {
                continue;
            }

            notificationService.creerPourClient(
                    client.getId(),
                    NotificationType.ECHEANCE_PROCHAINE,
                    "Votre échéance n°" + echeance.getNumeroEcheance()
                            + " du " + echeance.getDateEcheance()
                            + " (" + echeance.getMontant() + " Ar) approche.",
                    lien
            );
        }
    }
}