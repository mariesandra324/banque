package com.erpbanking.compte.service;

import com.erpbanking.client.entity.Client;
import com.erpbanking.client.repository.ClientRepository;

import com.erpbanking.compte.dto.CompteRequest;
import com.erpbanking.compte.dto.CompteResponse;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.mapper.CompteMapper;
import com.erpbanking.compte.repository.CompteRepository;

import com.erpbanking.utilisateur.entity.Utilisateur;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class CompteServiceImpl implements CompteService {


    private final CompteRepository compteRepository;

    private final CompteMapper compteMapper;

    private final ClientRepository clientRepository;

    private final RibService ribService;

    // Préfixe à 2 chiffres selon le type de compte (norme RIB : 11 chiffres au total pour numeroCompte).
    // Les clés doivent matcher exactement les valeurs du <select> côté frontend (Comptes.jsx).
    private static final Map<String, String> PREFIXES_PAR_TYPE = Map.of(
            "Courant", "01",
            "Epargne", "02",
            "A terme", "03",
            "Devises", "04"
    );

    private static final int LONGUEUR_SUFFIXE = 9;

    @Override
    public CompteResponse create(CompteRequest request) {


        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );
        long existing = compteRepository.countByClientId(client.getId());
        if (existing >= 3) {
            throw new RuntimeException("Le client a atteint le nombre maximal de comptes (3)");
        }

        String numeroCompte = generateNumeroCompte(request.getTypeCompte());

        Compte compte = compteMapper.toEntity(request, numeroCompte);

        // Le code guichet vient de l'utilisateur connecté (Agent, ou Admin agissant comme agent),
        // pas d'une valeur fixe : chaque agent est rattaché à son propre guichet.
        String codeGuichet = obtenirCodeGuichetUtilisateurConnecte();

        // Bloc RIB : banque fictive du projet, guichet de l'utilisateur, clé calculée, IBAN dérivé
        compte.setCodeBanque(RibService.CODE_BANQUE);
        compte.setCodeGuichet(codeGuichet);
        String cleRib = ribService.calculerCleRib(RibService.CODE_BANQUE, codeGuichet, numeroCompte);
        compte.setCleRib(cleRib);
        compte.setIban(ribService.genererIban(RibService.CODE_BANQUE, codeGuichet, numeroCompte, cleRib));

        compte.setClient(client);

        Compte saved = compteRepository.save(compte);


        return compteMapper.toResponse(saved);
    }

    /**
     * Récupère le codeGuichet de l'utilisateur actuellement authentifié (Agent ou Admin).
     * Lève une erreur explicite si l'utilisateur connecté n'a pas de guichet renseigné
     * (ex: un Admin qui n'a pas coché "Assigner un guichet" côté formulaire utilisateur).
     */
    private String obtenirCodeGuichetUtilisateurConnecte() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Utilisateur utilisateur)) {
            throw new RuntimeException("Impossible de déterminer l'utilisateur connecté.");
        }

        if (utilisateur.getGuichet() == null) {
            throw new RuntimeException(
                    "Aucun guichet n'est associé à votre compte utilisateur. "
                  + "Contactez un administrateur pour vous assigner un guichet avant de créer un compte."
            );
        }

        return utilisateur.getGuichet().getCodeGuichet();
    }

    @Override
    public String previewNumeroCompte(Long clientId, String typeCompte) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        long existing = compteRepository.countByClientId(client.getId());
        if (existing >= 3) {
            throw new RuntimeException("Le client a atteint le nombre maximal de comptes (3)");
        }

        return generateNumeroCompte(typeCompte);
    }



    @Override
    public List<CompteResponse> findAll() {

        return compteRepository.findAll()
                .stream()
                .map(compteMapper::toResponse)
                .toList();
    }



    @Override
    public CompteResponse findById(Long id) {

        Compte compte = compteRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Compte introuvable")
                );

        return compteMapper.toResponse(compte);
    }



    @Override
    public void delete(Long id) {

        compteRepository.deleteById(id);
    }



    @Override
    public CompteResponse update(Long id, CompteRequest request) {

        Compte compte = compteRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Compte introuvable")
                );


        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() ->
                    new RuntimeException("Client introuvable")
                );


        // Ne pas modifier le numéro de compte / RIB / IBAN / guichet existants lors de la mise à jour
        compte.setTypeCompte(request.getTypeCompte());
        compte.setSolde(request.getSolde() != null ? request.getSolde() : compte.getSolde());
        compte.setStatut(request.getStatut() != null && !request.getStatut().isBlank() ? request.getStatut() : compte.getStatut());
        compte.setClient(client);

        Compte updated = compteRepository.save(compte);


        return compteMapper.toResponse(updated);
    }

    // automatisation : préfixe (2 chiffres selon le type) + 9 chiffres uniques = 11 chiffres au total
    private String generateNumeroCompte(String typeCompte) {

        String prefixe = PREFIXES_PAR_TYPE.get(typeCompte);
        if (prefixe == null) {
            throw new RuntimeException("Type de compte inconnu pour la génération du numéro : " + typeCompte);
        }

        String numero;
        do {
            int suffixe = ThreadLocalRandom.current().nextInt(0, (int) Math.pow(10, LONGUEUR_SUFFIXE));
            numero = prefixe + String.format("%0" + LONGUEUR_SUFFIXE + "d", suffixe);
        } while (compteRepository.findByNumeroCompte(numero).isPresent());

        return numero;
    }
}