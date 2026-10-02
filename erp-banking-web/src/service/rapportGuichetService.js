import api from '../api/axios';

export const GRANULARITES = [
  { value: 'JOUR', label: 'Par jour' },
  { value: 'MOIS', label: 'Par mois' },
  { value: 'ANNEE', label: 'Par année' },
];

// Catégories de rapport. REMBOURSEMENT est une vue sur les RETRAIT
// d'échéance, pas un type de transaction en base.
export const CATEGORIES_RAPPORT = [
  { value: '', label: 'Tous les types' },
  { value: 'DEPOT', label: 'Dépôt' },
  { value: 'RETRAIT', label: 'Retrait' },
  { value: 'VIREMENT', label: 'Virement' },
  { value: 'REMBOURSEMENT', label: 'Remboursement' },
];

export const TOUS_LES_TYPES = '';

export const MOIS_LIBELLES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const anneeCourante = new Date().getFullYear();

export const anneesDisponibles = () => {
  const annees = [];
  for (let a = anneeCourante + 1; a >= anneeCourante - 6; a -= 1) annees.push(a);
  return annees;
};

export const joursDuMois = (annee, mois) => {
  if (!annee || !mois) return Array.from({ length: 31 }, (_, i) => i + 1);
  return Array.from({ length: new Date(annee, mois, 0).getDate() }, (_, i) => i + 1);
};

export const TOUS_LES_GUICHETS = '';

export const getRapportGuichet = async ({ granularite, annee, mois, jour, guichet, categorie }) => {
  const params = { granularite };
  if (annee) params.annee = annee;
  if (mois) params.mois = mois;
  if (jour) params.jour = jour;
  if (guichet) params.guichet = guichet;
  if (categorie) params.categorie = categorie;

  const response = await api.get('/comptabilite/rapport-guichet', { params });
  return response.data;
};

export const getGuichetsRapport = async () => {
  const response = await api.get('/comptabilite/rapport-guichet/guichets');
  return response.data;
};

export const calculerTotauxRapport = (lignes) =>
  (lignes || []).reduce(
    (acc, l) => ({
      operations: acc.operations + (Number(l.nombreOperations) || 0),
      depots: acc.depots + (Number(l.totalDepots) || 0),
      retraits: acc.retraits + (Number(l.totalRetraits) || 0),
      virements: acc.virements + (Number(l.totalVirements) || 0),
      remboursements: acc.remboursements + (Number(l.totalRemboursements) || 0),
    }),
    { operations: 0, depots: 0, retraits: 0, virements: 0, remboursements: 0 },
  );

const COLONNES_CSV = [
  { cle: 'periode', entete: 'Periode' },
  { cle: 'codeGuichet', entete: 'Guichet' },
  { cle: 'nombreOperations', entete: 'Transactions' },
  { cle: 'totalDepots', entete: 'Depots', montant: true },
  { cle: 'totalRetraits', entete: 'Retraits', montant: true },
  { cle: 'totalVirements', entete: 'Virements', montant: true },
  { cle: 'totalRemboursements', entete: 'Remboursements', montant: true },
];

export const rapportVersCsv = (lignes) => {
  const echapper = (valeur) => `"${String(valeur ?? '').replace(/"/g, '""')}"`;

  const formater = ({ cle, montant }, ligne) => {
    if (!montant) return ligne[cle];
    return Number(ligne[cle] || 0).toFixed(2).replace('.', ',');
  };

  const corps = (lignes || []).map((l) => COLONNES_CSV.map((c) => echapper(formater(c, l))).join(';'));

  return [COLONNES_CSV.map((c) => echapper(c.entete)).join(';'), ...corps].join('\r\n');
};

export const telechargerCsvRapport = (lignes, nomFichier) => {
  const contenu = '\uFEFF' + rapportVersCsv(lignes);
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');

  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
};
