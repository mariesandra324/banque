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


        Compte compte = compteMapper.toEntity(request);

        compte.setClient(client);


        Compte saved = compteRepository.save(compte);


        return compteMapper.toResponse(saved);
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


        compte.setNumeroCompte(request.getNumeroCompte());
        compte.setTypeCompte(request.getTypeCompte());
        compte.setSolde(request.getSolde());
        compte.setStatut(request.getStatut());
        compte.setClient(client);


        Compte updated = compteRepository.save(compte);


        return compteMapper.toResponse(updated);
    }
}