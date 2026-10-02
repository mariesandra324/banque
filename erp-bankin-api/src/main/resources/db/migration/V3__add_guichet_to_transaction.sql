-- Rattache chaque transaction au guichet qui l'a traitee.
--
-- Utilisateur porte deja un guichet (utilisateurs.guichet_id) mais Transaction
-- ne le stockait pas : impossible de produire un rapport de guichet.
--
-- La colonne est NULLABLE : les transactions deja enregistrees ne peuvent pas
-- etre retro-attribuees, et les mouvements automatiques de credit
-- (MouvementCompteService) ne passent par aucun guichet. Ces lignes sont
-- regroupees sous le libelle "NON RATTACHE" par le rapport de guichet.
--
-- A rejouer si la table guichets evolue (renommage, suppression).

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS guichet_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_transactions_guichet'
    ) THEN
        ALTER TABLE transactions
            ADD CONSTRAINT fk_transactions_guichet
            FOREIGN KEY (guichet_id) REFERENCES guichets (id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_transactions_guichet ON transactions (guichet_id);

CREATE INDEX IF NOT EXISTS idx_transactions_guichet_date
    ON transactions (guichet_id, date_transaction);
