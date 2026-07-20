package com.erpbanking.client.service;

import com.erpbanking.client.dto.ClientRequest;
import com.erpbanking.client.dto.ClientResponse;

import ch.qos.logback.core.net.server.Client;

import java.util.List;

public interface ClientService {

    ClientResponse create(ClientRequest request);

    List<ClientResponse> findAll();

    ClientResponse findById(Long id);

    ClientResponse update(Long id, ClientRequest request);

    void delete(Long id);

    List<Client> searchClients(String query);
    
}