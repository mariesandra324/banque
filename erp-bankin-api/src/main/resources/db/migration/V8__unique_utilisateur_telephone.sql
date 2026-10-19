-- Rend unique le telephone des utilisateurs.
--
-- Contrainte deja presente sur clients.email, clients.telephone et
-- utilisateurs.email ; seul utilisateurs.telephone en manquait.
-- Postgres autorise plusieurs NULL dans une colonne unique, donc les
-- comptes sans telephone ne sont pas bloques.

-- Supprime les doublons conservant l'utilisateur le plus ancien (id le plus bas).
UPDATE utilisateurs u
SET telephone = NULL
FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY telephone ORDER BY id) AS rn
    FROM utilisateurs
    WHERE telephone IS NOT NULL
      AND telephone <> ''
) d
WHERE u.id = d.id
  AND d.rn > 1;

-- Normalise les chaines vides en NULL pour eviter des "" confondus.
UPDATE utilisateurs SET telephone = NULL WHERE telephone = '';

ALTER TABLE utilisateurs ADD CONSTRAINT uq_utilisateurs_telephone UNIQUE (telephone);
