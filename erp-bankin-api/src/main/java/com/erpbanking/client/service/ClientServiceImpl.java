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


        client.setNom(request.getNom());
        client.setPrenom(request.getPrenom());
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


    // @Override
    // public List<ch.qos.logback.core.net.server.Client> searchClients(String query) {
    //     // TODO Auto-generated method stub
    //     throw new UnsupportedOperationException("Unimplemented method 'searchClients'");
    // }

    @Override
    public List searchClients(String query) {
        // Appelle la méthode de recherche automatique du repository sans référence au CIN
        return clientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCaseOrEmailContainingIgnoreCase(
            query, query, query, query
        );
    }
}