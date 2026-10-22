-- Ajoute le suivi des interets mensuels versés sur les comptes.
--
-- comptes.dernier_interet_applique_le stocke la date du dernier versement
-- d'interets. Elle est NULL tant qu'aucun interet n'a ete verse, ce qui
-- permet au planificateur (CompteServiceImpl.appliquerInteretsMensuels)
-- de retomber sur comptes.date_creation pour le premier versement.
--
-- La colonne est NULLABLE : les comptes deja existants n'ont jamais recu
-- d'interets et doivent etre initialises a NULL.

ALTER TABLE comptes ADD COLUMN IF NOT EXISTS dernier_interet_applique_le DATE;
