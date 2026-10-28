package com.erpbanking.caisse.service;

import java.util.List;

import com.erpbanking.caisse.dto.ClotureCaisseResponse;
import com.erpbanking.caisse.dto.ComptageCaisseResponse;
import com.erpbanking.caisse.dto.ComptageRequest;
import com.erpbanking.caisse.dto.DemandeTransfertCoffreResponse;
import com.erpbanking.caisse.dto.DemandeTransfertRequest;
import com.erpbanking.caisse.dto.FermerSessionRequest;
import com.erpbanking.caisse.dto.MonGuichetResponse;
import com.erpbanking.caisse.dto.OuvrirSessionRequest;
import com.erpbanking.caisse.dto.PositionCashResponse;
import com.erpbanking.caisse.dto.RejeterClotureRequest;
import com.erpbanking.caisse.dto.SessionCaisseResponse;
import com.erpbanking.caisse.dto.TraitementDemandeRequest;

public interface CaisseService {
    MonGuichetResponse monGuichet();
    PositionCashResponse positionCash();
    SessionCaisseResponse ouvrirSession(OuvrirSessionRequest request);
    SessionCaisseResponse fermerSession(FermerSessionRequest request);
    DemandeTransfertCoffreResponse creerDemandeTransfert(DemandeTransfertRequest request);
    List<DemandeTransfertCoffreResponse> mesDemandesTransfert();
    List<DemandeTransfertCoffreResponse> demandesTransfertEnAttente();
    List<DemandeTransfertCoffreResponse> demandesTransfert();
    DemandeTransfertCoffreResponse traiterDemandeTransfert(Long id, TraitementDemandeRequest request);
    ComptageCaisseResponse enregistrerComptage(ComptageRequest request);
    List<ComptageCaisseResponse> mesComptages();
    List<ClotureCaisseResponse> clotures();
    ClotureCaisseResponse validerCloture(Long sessionId);
    ClotureCaisseResponse rejeterCloture(Long sessionId, RejeterClotureRequest request);
}
