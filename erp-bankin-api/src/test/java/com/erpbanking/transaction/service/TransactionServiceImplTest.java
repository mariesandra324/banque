package com.erpbanking.transaction.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.caisse.entity.SessionCaisse;
import com.erpbanking.caisse.entity.StatutSessionCaisse;
import com.erpbanking.caisse.repository.SessionCaisseRepository;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.compte.service.EmailService;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.notification.service.NotificationService;
import com.erpbanking.transaction.dto.TransactionRequest;
import com.erpbanking.transaction.entity.StatutTransaction;
import com.erpbanking.transaction.entity.TypeTransaction;
import com.erpbanking.transaction.repository.TransactionRepository;

class TransactionServiceImplTest {

    private TransactionRepository transactionRepository;
    private CompteRepository compteRepository;
    private SessionCaisseRepository sessionCaisseRepository;
    private TransactionServiceImpl service;

    @BeforeEach
    void setUp() {
        transactionRepository = mock(TransactionRepository.class);
        compteRepository = mock(CompteRepository.class);
        sessionCaisseRepository = mock(SessionCaisseRepository.class);
        service = new TransactionServiceImpl(
                transactionRepository,
                compteRepository,
                sessionCaisseRepository,
                mock(EmailService.class),
                mock(NotificationService.class),
                mock(AuditService.class));
        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void depotRequiresActiveSourceAndPersistsSuccessfulTransaction() {
        Compte source = compte("123", "ACTIVE", "10.00");
        when(compteRepository.findByNumeroCompteForUpdate("123")).thenReturn(Optional.of(source));

        var response = service.effectuerTransaction(request(TypeTransaction.DEPOT, "1.00", "123", null));

        assertThat(source.getSolde()).isEqualByComparingTo("11.00");
        assertThat(response.getStatut()).isEqualTo(StatutTransaction.SUCCES);
        verify(compteRepository).save(source);
        verify(transactionRepository).save(any());
    }

    @Test
    void counterDepositIncreasesAccountAndPhysicalCash() {
        Compte source = compte("123", "ACTIVE", "10.00");
        SessionCaisse session = session("100.00");
        Guichet guichet = guichet(1L);
        when(compteRepository.findByNumeroCompteForUpdate("123")).thenReturn(Optional.of(source));
        when(sessionCaisseRepository.findByAgentIdAndStatutForUpdate(7L, StatutSessionCaisse.OUVERT))
                .thenReturn(Optional.of(session));

        service.effectuerTransaction(request(TypeTransaction.DEPOT, "25.00", "123", null), guichet, 7L);

        assertThat(source.getSolde()).isEqualByComparingTo("35.00");
        assertThat(session.getSoldeTheorique()).isEqualByComparingTo("125.00");
        verify(sessionCaisseRepository).save(session);
    }

    @Test
    void counterWithdrawalRequiresEnoughPhysicalCashAndDoesNotPersistWhenInsufficient() {
        Compte source = compte("123", "ACTIVE", "100.00");
        SessionCaisse session = session("20.00");
        Guichet guichet = guichet(1L);
        when(compteRepository.findByNumeroCompteForUpdate("123")).thenReturn(Optional.of(source));
        when(sessionCaisseRepository.findByAgentIdAndStatutForUpdate(7L, StatutSessionCaisse.OUVERT))
                .thenReturn(Optional.of(session));

        assertThatThrownBy(() ->
                service.effectuerTransaction(request(TypeTransaction.RETRAIT, "25.00", "123", null), guichet, 7L))
                .hasMessageContaining("Cash physique insuffisant");

        assertThat(source.getSolde()).isEqualByComparingTo("100.00");
        assertThat(session.getSoldeTheorique()).isEqualByComparingTo("20.00");
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void counterWithdrawalDecreasesAccountAndPhysicalCash() {
        Compte source = compte("123", "ACTIVE", "100.00");
        SessionCaisse session = session("80.00");
        Guichet guichet = guichet(1L);
        when(compteRepository.findByNumeroCompteForUpdate("123")).thenReturn(Optional.of(source));
        when(sessionCaisseRepository.findByAgentIdAndStatutForUpdate(7L, StatutSessionCaisse.OUVERT))
                .thenReturn(Optional.of(session));

        service.effectuerTransaction(request(TypeTransaction.RETRAIT, "25.00", "123", null), guichet, 7L);

        assertThat(source.getSolde()).isEqualByComparingTo("75.00");
        assertThat(session.getSoldeTheorique()).isEqualByComparingTo("55.00");
        verify(sessionCaisseRepository).save(session);
    }

    @Test
    void counterCashOperationRequiresAnOpenSession() {
        Compte source = compte("123", "ACTIVE", "100.00");
        Guichet guichet = guichet(1L);
        when(compteRepository.findByNumeroCompteForUpdate("123")).thenReturn(Optional.of(source));
        when(sessionCaisseRepository.findByAgentIdAndStatutForUpdate(7L, StatutSessionCaisse.OUVERT))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                service.effectuerTransaction(request(TypeTransaction.DEPOT, "1.00", "123", null), guichet, 7L))
                .hasMessageContaining("Aucune session de caisse ouverte");

        assertThat(source.getSolde()).isEqualByComparingTo("100.00");
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void withdrawalCannotOverdrawAndDoesNotPersistFailedTransaction() {
        Compte source = compte("123", "ACTIF", "0.99");
        when(compteRepository.findByNumeroCompteForUpdate("123")).thenReturn(Optional.of(source));

        assertThatThrownBy(() ->
                service.effectuerTransaction(request(TypeTransaction.RETRAIT, "1.00", "123", null)))
                .hasMessageContaining("Solde insuffisant");

        assertThat(source.getSolde()).isEqualByComparingTo("0.99");
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void inactiveSourceIsRejectedWithoutSavingTransaction() {
        Compte source = compte("123", "INACTIF", "10.00");
        when(compteRepository.findByNumeroCompteForUpdate("123")).thenReturn(Optional.of(source));

        assertThatThrownBy(() ->
                service.effectuerTransaction(request(TypeTransaction.DEPOT, "1.00", "123", null)))
                .hasMessageContaining("compte source doit être actif");

        verifyNoInteractions(transactionRepository);
    }

    @Test
    void transferRequiresActiveDestinationAndNeverPersistsRejectedOperation() {
        Compte source = compte("100", "ACTIVE", "10.00");
        Compte destination = compte("200", "INACTIF", "5.00");
        when(compteRepository.findByNumeroCompteForUpdate("100")).thenReturn(Optional.of(source));
        when(compteRepository.findByNumeroCompteForUpdate("200")).thenReturn(Optional.of(destination));

        assertThatThrownBy(() ->
                service.effectuerTransaction(request(TypeTransaction.VIREMENT, "1.00", "100", "200")))
                .hasMessageContaining("compte destination doit être actif");

        assertThat(source.getSolde()).isEqualByComparingTo("10.00");
        assertThat(destination.getSolde()).isEqualByComparingTo("5.00");
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void transferCannotOverdrawSource() {
        Compte source = compte("100", "ACTIVE", "0.99");
        Compte destination = compte("200", "ACTIVE", "5.00");
        when(compteRepository.findByNumeroCompteForUpdate("100")).thenReturn(Optional.of(source));
        when(compteRepository.findByNumeroCompteForUpdate("200")).thenReturn(Optional.of(destination));

        assertThatThrownBy(() ->
                service.effectuerTransaction(request(TypeTransaction.VIREMENT, "1.00", "100", "200")))
                .hasMessageContaining("Solde insuffisant");

        assertThat(source.getSolde()).isEqualByComparingTo("0.99");
        assertThat(destination.getSolde()).isEqualByComparingTo("5.00");
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void transferUpdatesBothAccountsAndPersistsOneSuccessfulTransaction() {
        Compte source = compte("100", "ACTIVE", "10.00");
        Compte destination = compte("200", "ACTIF", "5.00");
        when(compteRepository.findByNumeroCompteForUpdate("100")).thenReturn(Optional.of(source));
        when(compteRepository.findByNumeroCompteForUpdate("200")).thenReturn(Optional.of(destination));

        var response = service.effectuerTransaction(
                request(TypeTransaction.VIREMENT, "3.00", "100", "200"));

        assertThat(source.getSolde()).isEqualByComparingTo("7.00");
        assertThat(destination.getSolde()).isEqualByComparingTo("8.00");
        assertThat(response.getStatut()).isEqualTo(StatutTransaction.SUCCES);
        verify(compteRepository).save(source);
        verify(compteRepository).save(destination);
        verify(transactionRepository).save(any());
    }

    @Test
    void transferRejectsSameSourceAndDestinationBeforeLookingUpAccounts() {
        assertThatThrownBy(() ->
                service.effectuerTransaction(request(TypeTransaction.VIREMENT, "1.00", "100", "100")))
                .hasMessageContaining("même compte");

        verifyNoInteractions(compteRepository, transactionRepository);
    }

    @Test
    void requestRequiresTypeAmountAndNonBlankSource() {
        try (var validatorFactory = Validation.buildDefaultValidatorFactory()) {
            TransactionRequest request = new TransactionRequest();

            assertThat(validatorFactory.getValidator().validate(request))
                    .extracting(violation -> violation.getPropertyPath().toString())
                    .contains("type", "montant", "numeroCompteSource");

            request.setType(TypeTransaction.DEPOT);
            request.setMontant(new BigDecimal("0.99"));
            request.setNumeroCompteSource("123");
            assertThat(validatorFactory.getValidator().validate(request))
                    .extracting(violation -> violation.getPropertyPath().toString())
                    .contains("montant");
        }
    }

    private Compte compte(String numero, String statut, String solde) {
        return Compte.builder()
                .numeroCompte(numero)
                .statut(statut)
                .solde(new BigDecimal(solde))
                .build();
    }

    private SessionCaisse session(String soldeTheorique) {
        Guichet guichet = guichet(1L);
        return SessionCaisse.builder()
                .guichet(guichet)
                .soldeTheorique(new BigDecimal(soldeTheorique))
                .build();
    }

    private Guichet guichet(Long id) {
        return Guichet.builder().id(id).build();
    }

    private TransactionRequest request(
            TypeTransaction type,
            String montant,
            String source,
            String destination
    ) {
        TransactionRequest request = new TransactionRequest();
        request.setType(type);
        request.setMontant(new BigDecimal(montant));
        request.setNumeroCompteSource(source);
        request.setNumeroCompteDestination(destination);
        return request;
    }
}
