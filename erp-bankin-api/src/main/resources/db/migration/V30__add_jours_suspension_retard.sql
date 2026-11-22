ALTER TABLE parametres_interets
ADD COLUMN IF NOT EXISTS jours_suspension_retard INTEGER;

UPDATE parametres_interets
SET jours_suspension_retard = 20
WHERE jours_suspension_retard IS NULL;

ALTER TABLE parametres_interets
ALTER COLUMN jours_suspension_retard SET NOT NULL;

ALTER TABLE parametres_interets
ADD CONSTRAINT parametres_interets_jours_suspension_check
CHECK (jours_suspension_retard BETWEEN 1 AND 365);
