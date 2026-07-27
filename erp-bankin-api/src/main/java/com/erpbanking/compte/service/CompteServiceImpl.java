package com.erpbanking.compte.service;

import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;

import com.erpbanking.compte.dto.CompteRequest;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.mapper.CompteMapper;
import com.erpbanking.compte.repository.CompteRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class CompteServiceImpl implements CompteService {


    private final CompteRepository compteRepository;

    private final CompteMapper compteMapper;

    private final ClientRepository clientRepository;

    @Override
    public CompteResponse create(CompteRequest request) {


        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );
        long existing = compteRepository.countByClientId(client.getId());
        if (existing >= 3) {
            throw new RuntimeException("Le client a atteint le nombre maximal de comptes (3)");
        }

        String numeroCompte = generateNumeroCompte();
        Compte compte = compteMapper.toEntity(request, numeroCompte);

        compte.setClient(client);

        Compte saved = compteRepository.save(compte);


        return compteMapper.toResponse(saved);
    }

    @Override
    public String previewNumeroCompte(Long clientId, String typeCompte) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        long existing = compteRepository.countByClientId(client.getId());
        if (existing >= 3) {
            throw new RuntimeException("Le client a atteint le nombre maximal de comptes (3)");
        }

        return generateNumeroCompte();
    }



    @Override
    public List<CompteResponse> findAll() {

        return compteRepository.findAll()
                .stream()
                .map(compteMapper::toResponse)
                .toList();
    }



    @Override
    public CompteResponse findById(Long id) {

        Compte compte = compteRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Compte introuvable")
                );

        return compteMapper.toResponse(compte);
    }



    @Override
    public void delete(Long id) {

        compteRepository.deleteById(id);
    }



    @Override
    public CompteResponse update(Long id, CompteRequest request) {

        Compte compte = compteRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Compte introuvable")
                );


        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );


        // Ne pas modifier le numéro de compte existant lors de la mise à jour
        compte.setTypeCompte(request.getTypeCompte());
        compte.setSolde(request.getSolde() != null ? request.getSolde() : compte.getSolde());
        compte.setStatut(request.getStatut() != null && !request.getStatut().isBlank() ? request.getStatut() : compte.getStatut());
        compte.setClient(client);

        Compte updated = compteRepository.save(compte);


        return compteMapper.toResponse(updated);
    }

    private String generateNumeroCompte() {
        String numero;
        do {
            numero = String.format("FR%08d", ThreadLocalRandom.current().nextInt(0, 100_000_000));
        } while (compteRepository.findByNumeroCompte(numero).isPresent());
        return numero;
    }
}