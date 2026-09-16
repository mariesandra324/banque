package com.erpbanking.mobile.dto;

import java.math.BigDecimal;
import java.util.List;

import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.transaction.dto.TransactionResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MobileDashboardResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private List<CompteResponse> comptes;
    private BigDecimal soldeTotal;
    private List<TransactionResponse> dernieresOperations;
}