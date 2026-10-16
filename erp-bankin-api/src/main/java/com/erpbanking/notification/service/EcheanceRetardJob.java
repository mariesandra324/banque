package com.erpbanking.notification.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.client.entity.Client;
import com.erpbanking.credit.entity.Credit;
import com.erpbanking.credit.entity.Echeance;
import com.erpbanking.credit.entity.StatutCredit;
import com.erpbanking.credit.entity.StatutEcheance;
import com.erpbanking.credit.repository.EcheanceRepository;
import com.erpbanking.notification.entity.NotificationType;

import lombok.RequiredArgsConstructor;

/**
 * Détecte les échéances de crédit échues non payées et déclenche l'alerte
 * de retard de paiement.
 *
 * <p>S'exécute chaque matin à 07h00 (une heure après
 * {@link EcheanceReminderJob}). Une échéance encore {@code EN_ATTENTE} dont la
 * date est dépassée passe au statut {@code EN_RETARD} : le client est relancé
 * et le service crédit (rôle GESTIONNAIRE) est alerté.</p>
 *
 * <p>Le filtre sur {@code statut = EN_ATTENTE} garantit qu'une échéance n'est
 * traitée qu'une seule fois : une fois passée en {@code EN_RETARD}, elle n'est
 * plus sélectionnée les jours suivants (pas de relance quotidienne en
 * boucle).</p>
 */
@Component
@RequiredArgsConstructor
public class EcheanceRetardJob {

    private final EcheanceRepository echeanceRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void detecterEcheancesEnRetard() {

        List<Echeance> echeances = echeanceRepository.findEchuesParStatut(
                LocalDate.now(), StatutEcheance.EN_ATTENTE);

        for (Echeance echeance : echeances) {

            Credit credit = echeance.getCredit();
            if (credit == null || credit.getStatut() != StatutCredit.ACTIF) {
                continue;
            }

            // 1. Bascule de l'échéance au statut "en retard"
            echeance.setStatut(StatutEcheance.EN_RETARD);
            echeanceRepository.save(echeance);

            Client client = credit.getClient();
            if (client == null) {
                continue;
            }

            // 2. Relance du client (le lien unique évite tout doublon)
            String lien = "echeance:" + echeance.getId();
            if (!notificationService.existeDeja(
                    client.getId(), NotificationType.ECHEANCE_EN_RETARD, lien)) {

                notificationService.creerPourClient(
                        client.getId(),
                        NotificationType.ECHEANCE_EN_RETARD,
                        "Votre échéance n°" + echeance.getNumeroEcheance()
                                + " du " + echeance.getDateEcheance()
                                + " (" + echeance.getMontant() + " Ar) est en retard. "
                                + "Merci de régulariser votre situation.",
                        lien
                );
            }

            // 3. Alerte du service crédit (gestionnaires)
            notificationService.creerPourRole(
                    NotificationType.CREDIT_EN_RETARD,
                    "Échéance n°" + echeance.getNumeroEcheance()
                            + " du crédit " + credit.getNumeroCredit()
                            + " (client " + client.getPrenom() + " " + client.getNom()
                            + ") impayée depuis le " + echeance.getDateEcheance() + ".",
                    "/credits"
            );
        }
    }
}
