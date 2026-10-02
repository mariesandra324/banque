-- Synchronise la contrainte CHECK de credits.statut avec l'enum Java StatutCredit.
--
-- Meme probleme que corrige V1 : "ddl-auto=validate" ne modifie JAMAIS une
-- contrainte existante. La table credits a ete creee avant l'ajout de la valeur
-- SOLDE a l'enum StatutCredit, donc la contrainte existante ne l'acceptait pas.
--
-- Consequence : RemboursementService.effectuerRemboursement() echoue avec
-- "violation de verification credits_statut_check" (SQLState 23514) des que le
-- capital restant atteint 0, c'est-a-dire au remboursement de la DERNIERE
-- echeance. Le @Transactional annule tout : l'echeance reste EN_ATTENTE, le
-- compte n'est pas debite, aucune notification n'est envoyee, et le client peut
-- blocker indefiniment sur cette echeance.
--
-- A rejouer apres chaque ajout de valeur dans StatutCredit.

ALTER TABLE credits DROP CONSTRAINT IF EXISTS credits_statut_check;

ALTER TABLE credits ADD CONSTRAINT credits_statut_check
    CHECK (statut::text = ANY (ARRAY['ACTIF'::character varying, 'EN_COURS'::character varying, 'TERMINE'::character varying, 'ANNULE'::character varying, 'SOLDE'::character varying]::text[]));
