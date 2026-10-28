-- Validation des clôtures de caisse par un gestionnaire ou un administrateur.
--
-- Une session fermée reste "en attente de validation" tant qu'un responsable
-- ne l'a pas contrôlée. On conserve l'auteur et la date de validation pour
-- l'historique, en plus de la trace d'audit.

ALTER TABLE sessions_caisse
    ADD COLUMN IF NOT EXISTS valide BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE sessions_caisse
    ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP;

ALTER TABLE sessions_caisse
    ADD COLUMN IF NOT EXISTS valide_par_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_caisse_valide_par'
    ) THEN
        ALTER TABLE sessions_caisse
            ADD CONSTRAINT fk_sessions_caisse_valide_par
            FOREIGN KEY (valide_par_id) REFERENCES utilisateurs(id);
    END IF;
END $$;
