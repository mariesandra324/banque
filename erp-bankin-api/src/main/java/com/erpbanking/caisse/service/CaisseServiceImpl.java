package com.erpbanking.caisse.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.caisse.dto.ComptageCaisseResponse;
import com.erpbanking.caisse.dto.ComptageRequest;
import com.erpbanking.caisse.dto.DemandeTransfertCoffreResponse;
import com.erpbanking.caisse.dto.DemandeTransfertRequest;
import com.erpbanking.caisse.dto.FermerSessionRequest;
import com.erpbanking.caisse.dto.MonGuichetResponse;
import com.erpbanking.caisse.dto.OuvrirSessionRequest;
import com.erpbanking.caisse.dto.SessionCaisseResponse;
import com.erpbanking.caisse.dto.TraitementDemandeRequest;
import com.erpbanking.caisse.dto.TransactionCaisseResponse;
import com.erpbanking.caisse.entity.ComptageCaisse;
import com.erpbanking.caisse.entity.DemandeTransfertCoffre;
import com.erpbanking.caisse.entity.SessionCaisse;
import com.erpbanking.caisse.entity.StatutDemandeTransfert;
import com.erpbanking.caisse.entity.StatutSessionCaisse;
import com.erpbanking.caisse.repository.ComptageCaisseRepository;
import com.erpbanking.caisse.repository.DemandeTransfertCoffreRepository;
import com.erpbanking.caisse.repository.SessionCaisseRepository;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.repository.GuichetRepository;
import com.erpbanking.transaction.entity.Transaction;
import com.erpbanking.transaction.repository.TransactionRepository;
import com.erpbanking.utilisateur.entity.Utilisateur;
import com.erpbanking.utilisateur.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaisseServiceImpl implements CaisseService {

    private final SessionCaisseRepository sessionCaisseRepository;
    private final DemandeTransfertCoffreRepository demandeTransfertCoffreRepository;
    private final ComptageCaisseRepository comptageCaisseRepository;
    private final GuichetRepository guichetRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final TransactionRepository transactionRepository;

    private Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
    }

    /**
     * Un agent opere toujours sur son propre guichet. Le guichet transmis par
     * le client n'est utilise que pour les profils qui n'ont pas de guichet
     * affecte (administrateur).
     */
    private Guichet resolveGuichet(Utilisateur user, Long guichetId) {
        if (user.getGuichet() != null) {
            return user.getGuichet();
        }
        if (guichetId == null) {
            throw new RuntimeException("Aucun guichet affecte a cet agent");
        }
        return guichetRepository.findById(guichetId)
                .orElseThrow(() -> new RuntimeException("Guichet introuvable"));
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    @Override
    @Transactional(readOnly = true)
    public MonGuichetResponse monGuichet() {
        Utilisateur user = getCurrentUser();
        if (user.getGuichet() == null) {
            throw new RuntimeException("Aucun guichet affecte a cet agent");
        }
        Guichet guichet = user.getGuichet();

        SessionCaisse sessionOuverte = sessionCaisseRepository
                .findByAgentIdAndStatut(user.getId(), StatutSessionCaisse.OUVERT)
                .orElse(null);

        BigDecimal soldeTransactions = transactionRepository.calculerSoldeGuichet(guichet.getId());
        BigDecimal transfertsAcceptes = demandeTransfertCoffreRepository
                .totalTransfertsParGuichetEtStatut(guichet.getId(), StatutDemandeTransfert.ACCEPTE);
        BigDecimal soldeDisponible = soldeTransactions.subtract(transfertsAcceptes);
        List<TransactionCaisseResponse> dernieres = transactionRepository
                .findTop5ByGuichetIdOrderByDateTransactionDesc(guichet.getId())
                .stream()
                .map(TransactionCaisseResponse::from)
                .toList();

        return MonGuichetResponse.builder()
                .guichetId(guichet.getId())
                .codeGuichet(guichet.getCodeGuichet())
                .guichetActif(guichet.getActif())
                .sessionOuverte(SessionCaisseResponse.from(sessionOuverte))
                .soldeDisponible(soldeDisponible)
                .dernieresTransactions(dernieres)
                .build();
    }

    @Override
    @Transactional
    public SessionCaisseResponse ouvrirSession(OuvrirSessionRequest request) {
        Utilisateur user = getCurrentUser();
        var existante = sessionCaisseRepository.findByAgentIdAndStatut(user.getId(), StatutSessionCaisse.OUVERT);
        if (existante.isPresent()) {
            throw new RuntimeException("Une session est deja ouverte pour cet agent");
        }
        Guichet guichet = resolveGuichet(user, request.getGuichetId());

        SessionCaisse session = SessionCaisse.builder()
                .guichet(guichet)
                .agent(user)
                .statut(StatutSessionCaisse.OUVERT)
                .soldeOuverture(safe(request.getSoldeOuverture()))
                .soldeTheorique(safe(request.getSoldeOuverture()))
                .dateOuverture(LocalDateTime.now())
                .build();
        return SessionCaisseResponse.from(sessionCaisseRepository.save(session));
    }

    @Override
    @Transactional
    public SessionCaisseResponse fermerSession(FermerSessionRequest request) {
        Utilisateur user = getCurrentUser();
        SessionCaisse session = sessionCaisseRepository
                .findByAgentIdAndStatut(user.getId(), StatutSessionCaisse.OUVERT)
                .orElseThrow(() -> new RuntimeException("Aucune session ouverte"));
        session.setStatut(StatutSessionCaisse.FERME);
        session.setSoldeFermeture(safe(request.getSoldeFermeture()));
        session.setDateFermeture(LocalDateTime.now());
        if (request.getObservation() != null) {
            session.setObservation(request.getObservation());
        }
        return SessionCaisseResponse.from(sessionCaisseRepository.save(session));
    }

    @Override
    @Transactional
    public DemandeTransfertCoffreResponse creerDemandeTransfert(DemandeTransfertRequest request) {
        Utilisateur user = getCurrentUser();
        Guichet guichet = resolveGuichet(user, request.getGuichetId());

        DemandeTransfertCoffre demande = DemandeTransfertCoffre.builder()
                .guichet(guichet)
                .agentDemandeur(user)
                .montant(safe(request.getMontant()))
                .motif(request.getMotif())
                .statut(StatutDemandeTransfert.EN_ATTENTE)
                .dateDemande(LocalDateTime.now())
                .build();
        return DemandeTransfertCoffreResponse.from(demandeTransfertCoffreRepository.save(demande));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeTransfertCoffreResponse> mesDemandesTransfert() {
        Utilisateur user = getCurrentUser();
        return demandeTransfertCoffreRepository
                .findByAgentDemandeurIdOrderByDateDemandeDesc(user.getId())
                .stream()
                .map(DemandeTransfertCoffreResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeTransfertCoffreResponse> demandesTransfertEnAttente() {
        return demandeTransfertCoffreRepository
                .findByStatutOrderByDateDemandeDesc(StatutDemandeTransfert.EN_ATTENTE)
                .stream()
                .map(DemandeTransfertCoffreResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public DemandeTransfertCoffreResponse traiterDemandeTransfert(Long id, TraitementDemandeRequest request) {
        Utilisateur user = getCurrentUser();
        DemandeTransfertCoffre demande = demandeTransfertCoffreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));
        demande.setGestionnaire(user);
        demande.setDateTraitement(LocalDateTime.now());
        if (request.isAccepter()) {
            demande.setStatut(StatutDemandeTransfert.ACCEPTE);
        } else {
            demande.setStatut(StatutDemandeTransfert.REFUSE);
            demande.setMotifRefus(request.getMotifRefus());
        }
        return DemandeTransfertCoffreResponse.from(demandeTransfertCoffreRepository.save(demande));
    }

    @Override
    @Transactional
    public ComptageCaisseResponse enregistrerComptage(ComptageRequest request) {
        Utilisateur user = getCurrentUser();
        Guichet guichet = resolveGuichet(user, request.getGuichetId());

        BigDecimal montantPhysique = BigDecimal.ZERO;
        montantPhysique = montantPhysique.add(multiplier(request.getBillets10000(), "10000"));
        montantPhysique = montantPhysique.add(multiplier(request.getBillets5000(), "5000"));
        montantPhysique = montantPhysique.add(multiplier(request.getBillets2000(), "2000"));
        montantPhysique = montantPhysique.add(multiplier(request.getBillets1000(), "1000"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces500(), "500"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces200(), "200"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces100(), "100"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces50(), "50"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces20(), "20"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces10(), "10"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces5(), "5"));
        montantPhysique = montantPhysique.add(multiplier(request.getPieces1(), "1"));

        BigDecimal montantTheorique = safe(request.getMontantTheorique());
        BigDecimal ecart = montantPhysique.subtract(montantTheorique);

        SessionCaisse session;
        if (request.getSessionCaisseId() != null) {
            session = sessionCaisseRepository.findById(request.getSessionCaisseId()).orElse(null);
        } else {
            session = sessionCaisseRepository
                    .findByAgentIdAndStatut(user.getId(), StatutSessionCaisse.OUVERT)
                    .orElse(null);
        }

        ComptageCaisse comptage = ComptageCaisse.builder()
                .sessionCaisse(session)
                .guichet(guichet)
                .agent(user)
                .montantTheorique(montantTheorique)
                .montantPhysique(montantPhysique)
                .ecart(ecart)
                .billets10000(safeInt(request.getBillets10000()))
                .billets5000(safeInt(request.getBillets5000()))
                .billets2000(safeInt(request.getBillets2000()))
                .billets1000(safeInt(request.getBillets1000()))
                .pieces500(safeInt(request.getPieces500()))
                .pieces200(safeInt(request.getPieces200()))
                .pieces100(safeInt(request.getPieces100()))
                .pieces50(safeInt(request.getPieces50()))
                .pieces20(safeInt(request.getPieces20()))
                .pieces10(safeInt(request.getPieces10()))
                .pieces5(safeInt(request.getPieces5()))
                .pieces1(safeInt(request.getPieces1()))
                .dateComptage(LocalDateTime.now())
                .observation(request.getObservation())
                .build();
        return ComptageCaisseResponse.from(comptageCaisseRepository.save(comptage));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComptageCaisseResponse> mesComptages() {
        Utilisateur user = getCurrentUser();
        return comptageCaisseRepository
                .findByAgentIdOrderByDateComptageDesc(user.getId())
                .stream()
                .map(ComptageCaisseResponse::from)
                .toList();
    }

    private BigDecimal multiplier(Integer quantite, String valeur) {
        return new BigDecimal(safeInt(quantite)).multiply(new BigDecimal(valeur));
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }
}
