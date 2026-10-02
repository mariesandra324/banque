package com.erpbanking.comptabilite.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.erpbanking.comptabilite.dto.RapportGuichetResponse;
import com.erpbanking.comptabilite.service.RapportGuichetService;

import lombok.RequiredArgsConstructor;

/*
 * RAPPORT DE GUICHET — MIS EN COMMENTAIRE
 *
 * Rapport de guichet suspendu : il ne se peuple pas de données fiables.
 *
 * Motif : sur la base actuelle, les 3 transactions existantes ont toutes
 * transactions.guichet_id = NULL et ressortent en "NON RATTACHE", alors que
 * les 5 utilisateurs sont bien rattaches a un guichet (00001 a 00005).
 * Aucune donnee historique ne permet de retro-attribuer ces mouvements a
 * l'agent qui les a saisis. Le rapport afficherait donc des totaux faux
 * tant que le suivi n'a pas produit de nouvelles transactions.
 *
 * Deux autres reserves non levees :
 *  - le virement est impute au guichet de l'agent qui l'a saisi, alors
 *    qu'il a une source et une destination : c'est une convention, pas une
 *    verite comptable ;
 *  - le remboursement est identifie par le prefixe de description
 *    'Remboursement%' (cf. CategoriesSql.CATEGORIE) et n'est rattache a
 *    aucun guichet, donc toujours affiche en "NON RATTACHE".
 *
 * Pour reactiver : decommenter les deux methodes ci-dessous. Le service,
 * le repository et la migration V3 sont conserves suches.
 */
@RestController
@RequestMapping("/api/comptabilite")
@RequiredArgsConstructor
public class ComptabiliteController {

    private final RapportGuichetService rapportGuichetService;

    // Rapport de guichet, filtrable par jour, mois ou année.
    // Réservé à l'administrateur et au comptable.
    /*
    @GetMapping("/rapport-guichet")
    @PreAuthorize("hasAnyRole('ADMIN','COMPTABLE')")
    public ResponseEntity<List<RapportGuichetResponse>> getRapportGuichet(
            @RequestParam(required = false, defaultValue = "ANNEE") String granularite,
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer jour,
            @RequestParam(required = false) String guichet,
            @RequestParam(required = false) String categorie) {

        return ResponseEntity.ok(
                rapportGuichetService.getRapport(
                        RapportGuichetService.Granularite.depuis(granularite),
                        annee,
                        mois,
                        jour,
                        guichet,
                        RapportGuichetService.Categorie.depuis(categorie)));
    }

    // Guichets selectionnables dans le filtre du rapport.
    @GetMapping("/rapport-guichet/guichets")
    @PreAuthorize("hasAnyRole('ADMIN','COMPTABLE')")
    public ResponseEntity<List<String>> getGuichetsRapport() {
        return ResponseEntity.ok(rapportGuichetService.getGuichetsDisponibles());
    }
    */
}
