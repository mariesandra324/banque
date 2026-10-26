package com.erpbanking.credit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.credit.dto.CreditCandidate;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.dto.PieceJointeResponse;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.OffreCredit;
import com.erpbanking.credit.entity.PieceJointe;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.repository.DemandeCreditRepository;
import com.erpbanking.credit.repository.OffreCreditRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreditOptimizationService {

    private static final BigDecimal AMOUNT_UNIT = BigDecimal.valueOf(1_000);
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final DemandeCreditRepository demandeCreditRepository;
    private final OffreCreditRepository offreCreditRepository;

    @Transactional
    public List<DemandeCreditResponse> optimizePendingApplications(int budget) {
        if (budget < 0 || budget > 1_000_000) {
            throw new IllegalArgumentException(
                    "Le budget doit être compris entre 0 et 1 000 000 unités de 1 000 Ar."
            );
        }

        List<DemandeCredit> pendingApplications =
                demandeCreditRepository.findByStatut(StatutDemandeCredit.EN_ATTENTE);
        if (pendingApplications.isEmpty()) {
            return List.of();
        }

        List<CreditCandidate> candidates = pendingApplications.stream()
                .map(this::toCandidate)
                .toList();
        List<CreditCandidate> selectedCandidates = optimizePortfolio(candidates, budget);
        if (selectedCandidates.isEmpty()) {
            return List.of();
        }

        var applicationsById = pendingApplications.stream()
                .collect(Collectors.toMap(DemandeCredit::getId, Function.identity()));
        List<DemandeCredit> acceptedApplications = selectedCandidates.stream()
                .map(candidate -> applicationsById.get(candidate.demandeCreditId()))
                .toList();

        for (DemandeCredit application : acceptedApplications) {
            if (offreCreditRepository.existsByDemandeCreditId(application.getId())) {
                throw new IllegalStateException(
                        "Une offre existe déjà pour la demande " + application.getId() + "."
                );
            }
        }

        LocalDate decisionDate = LocalDate.now();
        LocalDateTime decisionDateTime = LocalDateTime.now();
        for (DemandeCredit application : acceptedApplications) {
            application.setStatut(StatutDemandeCredit.ACCEPTER);
            application.setDateDecision(decisionDateTime);
            application.setMotifRejet(null);
        }
        demandeCreditRepository.saveAll(acceptedApplications);

        List<OffreCredit> offers = acceptedApplications.stream()
                .map(application -> createOffer(application, decisionDate))
                .toList();
        offreCreditRepository.saveAll(offers);

        return acceptedApplications.stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CreditCandidate> optimizePortfolio(
            List<CreditCandidate> candidates,
            int budget) {
        if (budget < 0 || budget > 1_000_000) {
            throw new IllegalArgumentException(
                    "Le budget doit être compris entre 0 et 1 000 000."
            );
        }

        State[] bestByBudget = new State[budget + 1];
        for (int candidateIndex = 0; candidateIndex < candidates.size(); candidateIndex++) {
            CreditCandidate candidate = candidates.get(candidateIndex);
            if (candidate.amountIndex() > budget) {
                continue;
            }

            int weight = Math.toIntExact(candidate.amountIndex());
            for (int capacity = budget; capacity >= weight; capacity--) {
                State previous = bestByBudget[capacity - weight];
                BigDecimal previousGain = previous == null ? ZERO : previous.gain();
                BigDecimal gain = previousGain.add(candidate.expectedGain());
                State current = bestByBudget[capacity];
                BigDecimal currentGain = current == null ? ZERO : current.gain();

                if (gain.compareTo(currentGain) > 0) {
                    bestByBudget[capacity] = new State(gain, candidateIndex, previous);
                }
            }
        }

        List<CreditCandidate> selected = new ArrayList<>();
        State state = bestByBudget[budget];
        while (state != null) {
            selected.add(candidates.get(state.candidateIndex()));
            state = state.previous();
        }
        Collections.reverse(selected);
        return selected;
    }

    private CreditCandidate toCandidate(DemandeCredit application) {
        BigDecimal amount = application.getMontantDemande();
        long amountIndex = amount.divide(AMOUNT_UNIT, 0, RoundingMode.CEILING)
                .longValueExact();
        if (amountIndex <= 0) {
            throw new IllegalArgumentException(
                    "Le montant de la demande " + application.getId() + " doit être positif."
            );
        }

        BigDecimal expectedGain = amount
                .multiply(application.getTauxInteret())
                .multiply(BigDecimal.valueOf(calculateTrustScore(application)));
        return new CreditCandidate(application.getId(), amountIndex, expectedGain);
    }

    private int calculateTrustScore(DemandeCredit application) {
        BigDecimal income = valueOrZero(application.getRevenuMensuel());
        BigDecimal charges = valueOrZero(application.getChargesMensuelles());
        int score = 0;

        if (application.getProfession() != null && !application.getProfession().isBlank()) {
            score += 15;
        }
        if (application.getTypeContrat() != null && !application.getTypeContrat().isBlank()) {
            score += 15;
        }
        if (income.compareTo(ZERO) > 0) {
            BigDecimal capacity = income.subtract(charges);
            if (capacity.compareTo(ZERO) > 0) {
                score += Math.min(
                        40,
                        capacity.divide(income, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .intValue()
                );
            }
        }
        if (income.compareTo(ZERO) > 0) {
            BigDecimal ratio = application.getMontantDemande()
                    .divide(income, 4, RoundingMode.HALF_UP);
            if (ratio.compareTo(BigDecimal.valueOf(2)) <= 0) {
                score += 20;
            } else if (ratio.compareTo(BigDecimal.valueOf(4)) <= 0) {
                score += 10;
            }
        }
        if (application.getDuree() <= 24) {
            score += 10;
        } else if (application.getDuree() <= 60) {
            score += 5;
        }
        return Math.min(100, Math.max(0, score));
    }

    private OffreCredit createOffer(DemandeCredit application, LocalDate date) {
        OffreCredit offer = OffreCredit.builder()
                .demandeCredit(application)
                .client(application.getClient())
                .montantPropose(application.getMontantDemande())
                .tauxInteret(application.getTauxInteret())
                .duree(application.getDuree())
                .mensualite(calculateMonthlyPayment(application))
                .dateOffre(date)
                .dateExpiration(date.plusMonths(3))
                .conditions("Offre générée automatiquement après optimisation du portefeuille.")
                .statut("EN_ATTENTE")
                .build();
        offer.genererNumeroOffre();
        offer.setToken(UUID.randomUUID().toString());
        return offer;
    }

    private BigDecimal calculateMonthlyPayment(DemandeCredit application) {
        BigDecimal amount = application.getMontantDemande();
        BigDecimal monthlyRate = application.getTauxInteret()
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);
        int duration = application.getDuree();

        if (monthlyRate.compareTo(ZERO) == 0) {
            return amount.divide(BigDecimal.valueOf(duration), 2, RoundingMode.HALF_UP);
        }

        BigDecimal factor = BigDecimal.ONE.add(monthlyRate).pow(duration);
        return amount.multiply(monthlyRate).multiply(factor)
                .divide(factor.subtract(BigDecimal.ONE), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private DemandeCreditResponse toResponse(DemandeCredit application) {
        List<PieceJointeResponse> attachments = application.getPiecesJointes().stream()
                .map(this::toResponse)
                .toList();

        return DemandeCreditResponse.builder()
                .id(application.getId())
                .montantDemande(application.getMontantDemande())
                .duree(application.getDuree())
                .tauxInteret(application.getTauxInteret())
                .motif(application.getMotif())
                .dateDemande(application.getDateDemande())
                .statut(application.getStatut())
                .dateDecision(application.getDateDecision())
                .motifRejet(application.getMotifRejet())
                .profession(application.getProfession())
                .typeContrat(application.getTypeContrat())
                .revenuMensuel(application.getRevenuMensuel())
                .chargesMensuelles(application.getChargesMensuelles())
                .clientId(application.getClient().getId())
                .clientNom(application.getClient().getNom())
                .clientPrenom(application.getClient().getPrenom())
                .compteId(application.getCompteId())
                .piecesJointes(attachments)
                .build();
    }

    private PieceJointeResponse toResponse(PieceJointe attachment) {
        return PieceJointeResponse.builder()
                .id(attachment.getId())
                .nomFichier(attachment.getNomFichier())
                .typeFichier(attachment.getTypeFichier())
                .cheminFichier(attachment.getCheminFichier())
                .build();
    }

    private record State(BigDecimal gain, int candidateIndex, State previous) {
    }
}
