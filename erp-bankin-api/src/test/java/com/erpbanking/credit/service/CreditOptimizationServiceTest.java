package com.erpbanking.credit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.erpbanking.client.entity.Client;
import com.erpbanking.credit.dto.CreditCandidate;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.OffreCredit;
import com.erpbanking.credit.entity.StatutDemandeCredit;
import com.erpbanking.credit.repository.DemandeCreditRepository;
import com.erpbanking.credit.repository.OffreCreditRepository;

class CreditOptimizationServiceTest {

    private final CreditOptimizationService service =
            new CreditOptimizationService(null, null);

    @Test
    void optimizePortfolioSelectsTheHighestGainWithinBudget() {
        List<CreditCandidate> candidates = List.of(
                new CreditCandidate(1L, 2, BigDecimal.valueOf(10)),
                new CreditCandidate(2L, 3, BigDecimal.valueOf(13)),
                new CreditCandidate(3L, 5, BigDecimal.valueOf(20))
        );

        List<CreditCandidate> selected = service.optimizePortfolio(candidates, 5);

        assertThat(selected)
                .extracting(CreditCandidate::demandeCreditId)
                .containsExactly(1L, 2L);
    }

    @Test
    void optimizePortfolioReturnsNoCandidatesForZeroBudget() {
        List<CreditCandidate> candidates = List.of(
                new CreditCandidate(1L, 1, BigDecimal.valueOf(10))
        );

        assertThat(service.optimizePortfolio(candidates, 0)).isEmpty();
    }

    @Test
    void optimizePendingApplicationsAcceptsAndPersistsSelectedApplicationsAndOffers() {
        DemandeCreditRepository demandeRepository = mock(DemandeCreditRepository.class);
        OffreCreditRepository offreRepository = mock(OffreCreditRepository.class);
        CreditOptimizationService optimizationService =
                new CreditOptimizationService(demandeRepository, offreRepository);
        DemandeCredit application = DemandeCredit.builder()
                .id(1L)
                .montantDemande(BigDecimal.valueOf(2_000))
                .tauxInteret(BigDecimal.TEN)
                .duree(12)
                .motif("Projet")
                .dateDemande(LocalDateTime.now())
                .statut(StatutDemandeCredit.EN_ATTENTE)
                .client(Client.builder().id(7L).build())
                .profession("Employé")
                .typeContrat("CDI")
                .revenuMensuel(BigDecimal.valueOf(5_000))
                .chargesMensuelles(BigDecimal.valueOf(1_000))
                .build();
        when(demandeRepository.findByStatut(StatutDemandeCredit.EN_ATTENTE))
                .thenReturn(List.of(application));

        var accepted = optimizationService.optimizePendingApplications(2);

        assertThat(accepted)
                .singleElement()
                .satisfies(response -> {
                    assertThat(response.getId()).isEqualTo(1L);
                    assertThat(response.getStatut()).isEqualTo(StatutDemandeCredit.ACCEPTER);
                });
        verify(demandeRepository).saveAll(List.of(application));
        verify(offreRepository).saveAll(argThat(offers -> {
            OffreCredit offer = offers.iterator().next();
            return offers.spliterator().getExactSizeIfKnown() == 1
                    && offer.getDemandeCredit() == application
                    && offer.getMontantPropose().compareTo(application.getMontantDemande()) == 0
                    && "EN_ATTENTE".equals(offer.getStatut())
                    && offer.getNumeroOffre() != null
                    && offer.getToken() != null;
        }));
    }
}
