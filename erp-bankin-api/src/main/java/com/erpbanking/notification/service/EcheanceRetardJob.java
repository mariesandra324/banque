package com.erpbanking.notification.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.client.entity.Client;
import com.erpbanking.credit.entity.Credit;
import com.erpbanking.credit.entity.Echeance;
import com.erpbanking.credit.entity.StatutCredit;
import com.erpbanking.credit.entity.StatutEcheance;
import com.erpbanking.credit.repository.CreditRepository;
import com.erpbanking.credit.repository.EcheanceRepository;
import com.erpbanking.notification.entity.NotificationType;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.compte.service.ParametresInteretsService;

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

    private static final int JOURS_AVANT_SUSPENSION_PAR_DEFAUT = 20;

    private final EcheanceRepository echeanceRepository;
    private final CreditRepository creditRepository;
    private final NotificationService notificationService;
    private final CompteRepository compteRepository;
    private final AuditService auditService;
    private final ParametresInteretsService parametresInteretsService;

    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void detecterEcheancesEnRetard() {

        List<Echeance> echeances = echeanceRepository.findEchuesParStatut(
                LocalDate.now(), StatutEcheance.EN_ATTENTE);

        for (Echeance echeance : echeances) {

            Credit credit = echeance.getCredit();
            if (credit == null || estCloture(credit.getStatut())) {
                continue;
            }

            // 1. Bascule de l'échéance au statut "en retard"
            echeance.setStatut(StatutEcheance.EN_RETARD);
            echeanceRepository.save(echeance);

            // 2. Le crédit passe aussi "en retard" (sauf s'il l'est déjà) :
            //    un crédit peut cumuler plusieurs échéances impayées.
            if (credit.getStatut() != StatutCredit.EN_RETARD) {
                credit.setStatut(StatutCredit.EN_RETARD);
                creditRepository.save(credit);
            }

            int joursSuspension = parametresInteretsService.get().getJoursSuspensionRetard();
            if (joursSuspension <= 0) {
                joursSuspension = JOURS_AVANT_SUSPENSION_PAR_DEFAUT;
            }
            if (ChronoUnit.DAYS.between(echeance.getDateEcheance(), LocalDate.now())
                    >= joursSuspension) {
                suspendreCompteLieAuCredit(credit);
            }

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

    private void suspendreCompteLieAuCredit(Credit credit) {
        if (credit.getClient() == null) {
            return;
        }

        Compte compte = null;
        Long compteId = credit.getDemandeCredit() != null
                ? credit.getDemandeCredit().getCompteId()
                : null;

        if (compteId != null) {
            compte = compteRepository.findById(compteId).orElse(null);
            if (compte != null
                    && (compte.getClient() == null
                    || !compte.getClient().getId().equals(credit.getClient().getId()))) {
                compte = null;
            }
        }

        if (compte == null) {
            compte = compteRepository.findByClientId(credit.getClient().getId()).stream()
                    .filter(c -> "Courant".equalsIgnoreCase(c.getTypeCompte()))
                    .filter(c -> "ACTIF".equalsIgnoreCase(c.getStatut()))
                    .findFirst()
                    .orElseGet(() -> compteRepository.findByClientId(credit.getClient().getId()).stream()
                            .filter(c -> "ACTIF".equalsIgnoreCase(c.getStatut()))
                            .findFirst()
                            .orElse(null));
        }

        if (compte == null
                || "SUSPENDU".equalsIgnoreCase(compte.getStatut())
                || "BLOQUE".equalsIgnoreCase(compte.getStatut())) {
            return;
        }

        compte.setStatut("SUSPENDU");
        compteRepository.save(compte);

        int joursSuspension = parametresInteretsService.get().getJoursSuspensionRetard();
        String message = "Le compte " + compte.getNumeroCompte()
                + " a été suspendu automatiquement après " + joursSuspension + " jours "
                + "de retard sur le crédit " + credit.getNumeroCredit() + ".";

        auditService.journaliser(
                AuditAction.DESACTIVATION,
                AuditModule.COMPTES,
                "Compte #" + compte.getId(),
                "Suspension automatique du compte " + compte.getNumeroCompte()
                        + " après " + joursSuspension + " jours de retard sur le crédit "
                        + credit.getNumeroCredit() + "."
        );

        notificationService.creerPourClient(
                credit.getClient().getId(),
                NotificationType.ECHEANCE_EN_RETARD,
                message,
                "compte:" + compte.getId()
        );

        notificationService.creerPourRole(
                NotificationType.CREDIT_EN_RETARD,
                message,
                "/comptes"
        );
    }


    /** Un crédit clôturé (soldé, terminé ou annulé) ne peut plus être en retard. */
    private boolean estCloture(StatutCredit statut) {
        return statut == StatutCredit.SOLDE
                || statut == StatutCredit.TERMINE
                || statut == StatutCredit.ANNULE;
    }
}
