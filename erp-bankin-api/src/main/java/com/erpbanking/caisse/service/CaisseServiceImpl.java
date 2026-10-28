package com.erpbanking.caisse.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.erpbanking.caisse.dto.ClotureCaisseResponse;
import com.erpbanking.caisse.dto.ComptageCaisseResponse;
import com.erpbanking.caisse.dto.ComptageRequest;
import com.erpbanking.caisse.dto.DemandeTransfertCoffreResponse;
import com.erpbanking.caisse.dto.DemandeTransfertRequest;
import com.erpbanking.caisse.dto.FermerSessionRequest;
import com.erpbanking.caisse.dto.MonGuichetResponse;
import com.erpbanking.caisse.dto.GuichetCashResponse;
import com.erpbanking.caisse.dto.OuvrirSessionRequest;
import com.erpbanking.caisse.dto.PositionCashResponse;
import com.erpbanking.caisse.dto.RejeterClotureRequest;
import com.erpbanking.caisse.dto.SessionCaisseResponse;
import com.erpbanking.caisse.dto.TraitementDemandeRequest;
import com.erpbanking.caisse.dto.TransactionCaisseResponse;
import com.erpbanking.audit.entity.AuditAction;
import com.erpbanking.audit.entity.AuditModule;
import com.erpbanking.audit.service.AuditService;
import com.erpbanking.caisse.entity.ComptageCaisse;
import com.erpbanking.caisse.entity.DemandeTransfertCoffre;
import com.erpbanking.caisse.entity.SessionCaisse;
import com.erpbanking.caisse.entity.StatutDemandeTransfert;
import com.erpbanking.caisse.entity.StatutSessionCaisse;
import com.erpbanking.caisse.entity.StatutValidationCloture;
import com.erpbanking.caisse.repository.ComptageCaisseRepository;
import com.erpbanking.caisse.repository.DemandeTransfertCoffreRepository;
import com.erpbanking.caisse.repository.SessionCaisseRepository;
import com.erpbanking.guichet.entity.Guichet;
import com.erpbanking.guichet.repository.GuichetRepository;
import com.erpbanking.transaction.entity.Transaction;
import com.erpbanking.transaction.entity.TypeTransaction;
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
    private final AuditService auditService;

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

    private String nomComplet(Utilisateur utilisateur) {
        if (utilisateur == null) {
            return "agent inconnu";
        }
        String prenom = utilisateur.getPrenom() == null ? "" : utilisateur.getPrenom().trim();
        String nom = utilisateur.getNom() == null ? "" : utilisateur.getNom().trim();
        String complet = (prenom + " " + nom).trim();
        return complet.isEmpty() ? utilisateur.getEmail() : complet;
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
    @Transactional(readOnly = true)
    public PositionCashResponse positionCash() {
        List<GuichetCashResponse> guichets = utilisateurRepository.findByRole_Nom("AGENT")
                .stream()
                .filter(agent -> agent.getGuichet() != null)
                .map(agent -> {
                    Guichet guichet = agent.getGuichet();
                    BigDecimal soldeTransactions = transactionRepository
                            .calculerSoldeGuichet(guichet.getId());
                    BigDecimal transfertsAcceptes = demandeTransfertCoffreRepository
                            .totalTransfertsParGuichetEtStatut(guichet.getId(), StatutDemandeTransfert.ACCEPTE);
                    BigDecimal soldeTheorique = safe(soldeTransactions).subtract(safe(transfertsAcceptes));
                    boolean ouvert = sessionCaisseRepository
                            .findByGuichetIdAndStatut(guichet.getId(), StatutSessionCaisse.OUVERT)
                            .isPresent();

                    String prenom = agent.getPrenom() == null ? "" : agent.getPrenom();
                    String nom = agent.getNom() == null ? "" : agent.getNom();
                    String agentNom = (prenom + " " + nom).trim();
                    if (agentNom.isEmpty()) {
                        agentNom = agent.getEmail();
                    }

                    return GuichetCashResponse.builder()
                            .utilisateurId(agent.getId())
                            .agentNom(agentNom)
                            .guichetId(guichet.getId())
                            .codeGuichet(guichet.getCodeGuichet())
                            .soldeTheorique(soldeTheorique)
                            .statut(ouvert ? "OUVERT" : "FERME")
                            .build();
                })
                .sorted(Comparator
                        .comparing(GuichetCashResponse::getCodeGuichet,
                                Comparator.nullsLast(String::compareTo))
                        .thenComparing(GuichetCashResponse::getAgentNom,
                                Comparator.nullsLast(String::compareTo)))
                .toList();

        BigDecimal positionTotale = guichets.stream()
                .collect(Collectors.toMap(
                        GuichetCashResponse::getGuichetId,
                        ligne -> safe(ligne.getSoldeTheorique()),
                        (premier, second) -> premier))
                .values()
                .stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PositionCashResponse.builder()
                .positionTotale(positionTotale)
                .guichets(guichets)
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
        SessionCaisse enregistree = sessionCaisseRepository.save(session);

        auditService.journaliser(
                AuditAction.OUVERTURE_SESSION,
                AuditModule.CAISSE,
                "Session caisse #" + enregistree.getId(),
                "Ouverture de la session du guichet " + guichet.getCodeGuichet()
                        + " avec un fonds de caisse de " + safe(enregistree.getSoldeOuverture()).toPlainString()
                        + " Ar.");

        return SessionCaisseResponse.from(enregistree);
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
        SessionCaisse enregistree = sessionCaisseRepository.save(session);

        auditService.journaliser(
                AuditAction.FERMETURE_SESSION,
                AuditModule.CAISSE,
                "Session caisse #" + enregistree.getId(),
                "Fermeture de la session du guichet " + enregistree.getGuichet().getCodeGuichet()
                        + ". Solde compté : " + safe(enregistree.getSoldeFermeture()).toPlainString()
                        + " Ar.");

        return SessionCaisseResponse.from(enregistree);
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
        DemandeTransfertCoffre enregistree = demandeTransfertCoffreRepository.save(demande);

        auditService.journaliser(
                AuditAction.TRANSFERT,
                AuditModule.CAISSE,
                "Demande transfert #" + enregistree.getId(),
                "Demande de transfert vers le coffre de "
                        + safe(enregistree.getMontant()).toPlainString() + " Ar (guichet "
                        + guichet.getCodeGuichet() + "). Motif : "
                        + (enregistree.getMotif() == null || enregistree.getMotif().isBlank()
                                ? "non précisé"
                                : enregistree.getMotif())
                        + ".");

        return DemandeTransfertCoffreResponse.from(enregistree);
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
    @Transactional(readOnly = true)
    public List<DemandeTransfertCoffreResponse> demandesTransfert() {
        return demandeTransfertCoffreRepository
                .findAllByOrderByDateDemandeDesc()
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
        boolean accepter = request.isAccepter();
        if (accepter) {
            demande.setStatut(StatutDemandeTransfert.ACCEPTE);
        } else {
            demande.setStatut(StatutDemandeTransfert.REFUSE);
            demande.setMotifRefus(request.getMotifRefus());
        }
        DemandeTransfertCoffre enregistree = demandeTransfertCoffreRepository.save(demande);

        String base = "Demande de transfert vers le coffre de "
                + safe(enregistree.getMontant()).toPlainString() + " Ar (guichet "
                + enregistree.getGuichet().getCodeGuichet() + ") de "
                + nomComplet(enregistree.getAgentDemandeur()) + " ";
        String description = accepter
                ? base + "acceptée par " + nomComplet(user) + "."
                : base + "refusée par " + nomComplet(user) + ". Motif : "
                        + (enregistree.getMotifRefus() == null || enregistree.getMotifRefus().isBlank()
                                ? "non précisé"
                                : enregistree.getMotifRefus())
                        + ".";

        auditService.journaliser(
                accepter ? AuditAction.ACCEPTATION : AuditAction.REFUS,
                AuditModule.CAISSE,
                "Demande transfert #" + enregistree.getId(),
                description);

        return DemandeTransfertCoffreResponse.from(enregistree);
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

    @Override
    @Transactional(readOnly = true)
    public List<ClotureCaisseResponse> clotures() {
        return sessionCaisseRepository
                .findByStatutOrderByDateFermetureDesc(StatutSessionCaisse.FERME)
                .stream()
                .map(this::toCloture)
                .toList();
    }

    @Override
    @Transactional
    public ClotureCaisseResponse validerCloture(Long sessionId) {
        Utilisateur user = getCurrentUser();
        SessionCaisse session = sessionCaisseRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session de caisse introuvable"));

        if (session.getStatut() != StatutSessionCaisse.FERME) {
            throw new RuntimeException("La session doit etre fermee avant d'etre validee");
        }
        if (session.getStatutValidation() == StatutValidationCloture.VALIDEE) {
            throw new RuntimeException("Cette cloture est deja validee");
        }
        if (session.getStatutValidation() == StatutValidationCloture.REJETEE) {
            throw new RuntimeException("Cette cloture a deja ete rejetee");
        }

        session.setStatutValidation(StatutValidationCloture.VALIDEE);
        session.setMotifRejet(null);
        session.setDateValidation(LocalDateTime.now());
        session.setValidePar(user);
        SessionCaisse enregistree = sessionCaisseRepository.save(session);

        auditService.journaliser(
                AuditAction.VALIDATION_CLOTURE,
                AuditModule.CAISSE,
                "Session caisse #" + enregistree.getId(),
                "Cloture du guichet " + enregistree.getGuichet().getCodeGuichet()
                        + " validee par " + nomComplet(user) + ".");

        return toCloture(enregistree);
    }

    @Override
    @Transactional
    public ClotureCaisseResponse rejeterCloture(Long sessionId, RejeterClotureRequest request) {
        Utilisateur user = getCurrentUser();
        SessionCaisse session = sessionCaisseRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session de caisse introuvable"));

        if (session.getStatut() != StatutSessionCaisse.FERME) {
            throw new RuntimeException("La session doit etre fermee avant d'etre rejetee");
        }
        if (session.getStatutValidation() == StatutValidationCloture.VALIDEE) {
            throw new RuntimeException("Cette cloture est deja validee");
        }

        String motif = request != null ? request.getMotifRejet() : null;
        if (motif == null || motif.isBlank()) {
            throw new RuntimeException("La justification du rejet est obligatoire");
        }

        session.setStatutValidation(StatutValidationCloture.REJETEE);
        session.setMotifRejet(motif.trim());
        session.setDateValidation(LocalDateTime.now());
        session.setValidePar(user);
        SessionCaisse enregistree = sessionCaisseRepository.save(session);

        auditService.journaliser(
                AuditAction.REJET_CLOTURE,
                AuditModule.CAISSE,
                "Session caisse #" + enregistree.getId(),
                "Cloture du guichet " + enregistree.getGuichet().getCodeGuichet()
                        + " rejetee par " + nomComplet(user) + ". Justification : "
                        + motif.trim() + ".");

        return toCloture(enregistree);
    }

    private ClotureCaisseResponse toCloture(SessionCaisse session) {
        Long guichetId = session.getGuichet() != null ? session.getGuichet().getId() : null;
        LocalDateTime debut = session.getDateOuverture();
        LocalDateTime fin = session.getDateFermeture() != null
                ? session.getDateFermeture()
                : LocalDateTime.now();

        BigDecimal entrees = guichetId == null || debut == null
                ? BigDecimal.ZERO
                : safe(transactionRepository.totalParGuichetEtTypePeriode(
                        guichetId, TypeTransaction.DEPOT, debut, fin));
        BigDecimal sorties = guichetId == null || debut == null
                ? BigDecimal.ZERO
                : safe(transactionRepository.totalParGuichetEtTypePeriode(
                        guichetId, TypeTransaction.RETRAIT, debut, fin));
        BigDecimal transferts = guichetId == null || debut == null
                ? BigDecimal.ZERO
                : safe(demandeTransfertCoffreRepository.totalTransfertsParGuichetEtStatutPeriode(
                        guichetId, StatutDemandeTransfert.ACCEPTE, debut, fin));

        BigDecimal soldeOuverture = safe(session.getSoldeOuverture());
        BigDecimal soldeTheorique = soldeOuverture
                .add(entrees)
                .subtract(sorties)
                .subtract(transferts);
        BigDecimal soldeFermeture = session.getSoldeFermeture();
        BigDecimal ecart = soldeFermeture == null
                ? null
                : soldeFermeture.subtract(soldeTheorique);

        String agentNom = session.getAgent() == null
                ? null
                : ((session.getAgent().getPrenom() == null ? "" : session.getAgent().getPrenom())
                        + " "
                        + (session.getAgent().getNom() == null ? "" : session.getAgent().getNom())).trim();

        return ClotureCaisseResponse.builder()
                .sessionId(session.getId())
                .guichetId(guichetId)
                .codeGuichet(session.getGuichet() != null ? session.getGuichet().getCodeGuichet() : null)
                .agentId(session.getAgent() != null ? session.getAgent().getId() : null)
                .agentNom(agentNom)
                .statut(session.getStatut() != null ? session.getStatut().name() : null)
                .dateOuverture(session.getDateOuverture())
                .dateFermeture(session.getDateFermeture())
                .soldeOuverture(soldeOuverture)
                .totalEntrees(entrees)
                .totalSorties(sorties)
                .totalTransferts(transferts)
                .soldeTheorique(soldeTheorique)
                .soldeFermeture(soldeFermeture)
                .ecart(ecart)
                .statutValidation(session.getStatutValidation() != null
                        ? session.getStatutValidation().name()
                        : StatutValidationCloture.EN_ATTENTE.name())
                .dateValidation(session.getDateValidation())
                .valideParNom(session.getValidePar() != null ? nomComplet(session.getValidePar()) : null)
                .motifRejet(session.getMotifRejet())
                .observation(session.getObservation())
                .build();
    }

    private BigDecimal multiplier(Integer quantite, String valeur) {
        return new BigDecimal(safeInt(quantite)).multiply(new BigDecimal(valeur));
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }
}
