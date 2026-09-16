package com.erpbanking.client.service;

import com.erpbanking.client.dto.ClientDossierResponse;
import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;

import java.util.List;

public interface ClientService {

    ClientResponse create(ClientRequest request);

    List<ClientResponse> findAll();

    ClientResponse findById(Long id);

    ClientResponse update(Long id, ClientRequest request);

    void delete(Long id);

    List<ClientResponse> searchClients(String query);

    ClientDossierResponse getDossier(Long clientId);
    
}