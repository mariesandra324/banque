package com.erpbanking.client.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

import com.erpbanking.compte.dto.CarteResponse;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.credit.dto.CreditResponse;
import com.erpbanking.credit.dto.DemandeCreditResponse;
import com.erpbanking.credit.dto.OffreCreditResponse;
import com.erpbanking.transaction.dto.TransactionResponse;

@Data
@Builder
public class ClientDossierResponse {

    private ClientResponse client;

    private List<CompteResponse> comptes;

    private List<CarteResponse> cartes;

    private List<TransactionResponse> transactions;

    private List<DemandeCreditResponse> demandesCredit;

    private List<OffreCreditResponse> offresCredit;

    private List<CreditResponse> credits;

    private BigDecimal soldeTotal;
}