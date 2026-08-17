package com.erpbanking.client.service;

import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;
import com.erpbanking.client.entity.Client;
import com.erpbanking.client.mapper.ClientMapper;
import com.erpbanking.client.repository.ClientRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {


    private final ClientRepository clientRepository;
    
    private final ClientMapper clientMapper;


    @Override
    public ClientResponse create(ClientRequest request) {
        if (clientRepository.existsByCin(request.getCin())) {
            throw new RuntimeException("CIN déjà utilisé");
        }

        Client client = clientMapper.toEntity(request);

        Client saved = clientRepository.save(client);

        return clientMapper.toResponse(saved);
    }


    @Override
    public List<ClientResponse> findAll() {

        return clientRepository.findAll()
                .stream()
                .map(clientMapper::toResponse)
                .toList();
    }


    @Override
    public ClientResponse findById(Long id) {

        Client client = (Client) clientRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );

        return clientMapper.toResponse(client);
    }


    @Override
    public ClientResponse update(Long id, ClientRequest request) {

        Client client = (Client) clientRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );

        if (!request.getCin().equals(client.getCin()) && clientRepository.existsByCin(request.getCin())) {
            throw new RuntimeException("CIN déjà utilisé");
        }

        client.setNom(request.getNom());
        client.setPrenom(request.getPrenom());
        client.setCin(request.getCin());
        client.setEmail(request.getEmail());
        client.setTelephone(request.getTelephone());
        client.setAdresse(request.getAdresse());
        client.setDateNaissance(request.getDateNaissance());


        Client updated = clientRepository.save(client);

        return clientMapper.toResponse(updated);
    }


    @Override
    public void delete(Long id) {

        clientRepository.deleteById(id);
    }

    @Override
    public List<ClientResponse> searchClients(String query) {
        return clientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCinContainingIgnoreCase(
            query, query, query, query, query
        ).stream()
         .map(clientMapper::toResponse)
         .toList();
    }
}