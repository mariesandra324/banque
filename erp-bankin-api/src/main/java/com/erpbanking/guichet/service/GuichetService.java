package com.erpbanking.guichet.service;

import java.util.List;

import com.erpbanking.guichet.dto.GuichetRequest;
import com.erpbanking.guichet.entity.Guichet;

public interface GuichetService {

    List<Guichet> findAll();

    List<Guichet> findGuichetsDisponibles();

    Guichet create(GuichetRequest request);

    Guichet update(Long id, GuichetRequest request);

    void delete(Long id);
}
