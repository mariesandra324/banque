CREATE TABLE IF NOT EXISTS parametres_interets (
  id BIGINT PRIMARY KEY,
  montant_courant NUMERIC(14, 2) NOT NULL DEFAULT 5000,
  montant_epargne NUMERIC(14, 2) NOT NULL DEFAULT 5000
);

INSERT INTO parametres_interets (id, montant_courant, montant_epargne)
VALUES (1, 5000, 5000)
ON CONFLICT (id) DO NOTHING;
