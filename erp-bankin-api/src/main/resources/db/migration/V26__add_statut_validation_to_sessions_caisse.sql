-- Statut de validation d'une clôture de caisse : en attente, validée ou rejetée.
--
-- V25 ajoutait un simple booléen "valide". Le métier distingue maintenant un
-- rejet avec justification, d'où ce statut explicite et le motif de rejet.
-- La colonne "valide" reste en base pour ne pas casser une migration déjà
-- appliquée ; elle n'est plus utilisée par l'application.

ALTER TABLE sessions_caisse
    ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE';

ALTER TABLE sessions_caisse
    ADD COLUMN IF NOT EXISTS motif_rejet VARCHAR(500);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sessions_caisse'
          AND column_name = 'valide'
    ) THEN
        EXECUTE 'UPDATE sessions_caisse SET statut_validation = ''VALIDEE'' WHERE valide = TRUE';
    END IF;
END $$;
