package com.erpbanking.guichet.service;

import java.util.List;

import com.erpbanking.guichet.entity.Guichet;

public interface GuichetService {

    List<Guichet> findGuichetsDisponibles();
}