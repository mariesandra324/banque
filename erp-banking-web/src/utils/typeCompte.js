// Types de comptes reconnus par l'API (CompteServiceImpl.PREFIXES_PAR_TYPE)
// et par le <select> du formulaire (CompteForm.TYPES_COMPTE).
export const TYPES_COMPTE_CANONIQUES = ['Courant', 'Epargne'];

// typeCompte est un String libre en base : pas d'enum, pas de CHECK constraint.
// Les clés du backend sont en revanche sensibles à la casse (Map.get strict).
// Des saisies "courant", "EPARGNE" ou "Épargne" doivent donc être regroupées
// sous le libellé canonique, sinon la répartition affiche des doublons.
const sansAccents = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const cle = (valeur) =>
  sansAccents(String(valeur ?? '').trim().toLowerCase()).replace(/\s+/g, ' ');

const CANONIQUE_PAR_CLE = new Map(
  TYPES_COMPTE_CANONIQUES.map((t) => [cle(t), t]),
);

// Retourne le libellé canonique du type de compte. Une valeur inconnue est
// conservée telle quelle (trimée) plutôt que perdue, pour ne pas masquer
// un type ajouté côté API sans mise à jour ici.
export function normaliserTypeCompte(valeur) {
  const brut = String(valeur ?? '').trim();
  if (!brut) return 'Non renseigné';
  return CANONIQUE_PAR_CLE.get(cle(brut)) ?? brut;
}

export function repartitionTypeComptes(comptes) {
  const parType = {};
  for (const cp of comptes ?? []) {
    const type = normaliserTypeCompte(cp?.typeCompte);
    parType[type] = (parType[type] || 0) + 1;
  }
  return Object.entries(parType)
    .map(([type, valeur]) => ({ type, valeur }))
    .sort((a, b) => b.valeur - a.valeur);
}

export default repartitionTypeComptes;
