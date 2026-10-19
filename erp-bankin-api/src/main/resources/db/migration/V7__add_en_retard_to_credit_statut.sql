-- Ajoute le statut EN_RETARD a l'enum Java StatutCredit.
--
-- EcheanceRetardJob marque desormais un credit EN_RETARD des qu'une de ses
-- echeances est impayee. Meme probleme que corrige V2 : la contrainte CHECK
-- creee a partir de l'enum n'accepte pas les valeurs ajoutees apres coup, donc
-- l'update echouerait (violation de verification credits_statut_check).
--
-- A rejouer apres chaque ajout de valeur dans StatutCredit.

ALTER TABLE credits DROP CONSTRAINT IF EXISTS credits_statut_check;

ALTER TABLE credits ADD CONSTRAINT credits_statut_check
    CHECK (statut::text = ANY (ARRAY['ACTIF'::character varying, 'EN_COURS'::character varying, 'EN_RETARD'::character varying, 'TERMINE'::character varying, 'ANNULE'::character varying, 'SOLDE'::character varying]::text[]));
