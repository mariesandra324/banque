package com.erpbanking.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.erpbanking.client.repository.ClientRepository;
import com.erpbanking.compte.repository.CompteRepository;
import com.erpbanking.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final ClientRepository clientRepository;
    private final CompteRepository compteRepository;
    private final TransactionRepository transactionRepository;

    private String currentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return authentication.getName();
    }

    public boolean isClientOwner(Long clientId) {
        String email = currentUserEmail();
        return email != null && clientRepository.findById(clientId)
                .map(client -> email.equals(client.getEmail()))
                .orElse(false);
    }

    public boolean isCompteOwner(Long compteId) {
        String email = currentUserEmail();
        return email != null && compteRepository.findById(compteId)
                .map(compte -> compte.getClient() != null && email.equals(compte.getClient().getEmail()))
                .orElse(false);
    }

    public boolean isCompteOwnerByNumeroCompte(String numeroCompte) {
        String email = currentUserEmail();
        return email != null && compteRepository.findByNumeroCompte(numeroCompte)
                .map(compte -> compte.getClient() != null && email.equals(compte.getClient().getEmail()))
                .orElse(false);
    }

    public boolean isTransactionOwnerByReference(String reference) {
        String email = currentUserEmail();
        if (email == null) {
            return false;
        }

        var transaction = transactionRepository.findByReference(reference);
        if (transaction == null) {
            return false;
        }

        return (transaction.getCompteSource() != null
                && transaction.getCompteSource().getClient() != null
                && email.equals(transaction.getCompteSource().getClient().getEmail()))
                || (transaction.getCompteDestination() != null
                && transaction.getCompteDestination().getClient() != null
                && email.equals(transaction.getCompteDestination().getClient().getEmail()));
    }
}
