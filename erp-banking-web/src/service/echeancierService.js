import api from '../api/axios';

const RESOURCE = '/credits';

export const STATUTS_ECHEANCE = ['EN_ATTENTE', 'PAYEE', 'EN_RETARD'];

// "TOUS" est un pseudo-statut utilisé uniquement par les filtres de l'interface :
// il n'est jamais envoyé à l'API, qui renvoie alors toutes les échéances.
export const STATUTS_ECHEANCE_FILTRABLES = ['TOUS', ...STATUTS_ECHEANCE];

export const getEcheancierGlobal = async (statut = 'TOUS') => {
  const params = statut && statut !== 'TOUS' ? { statut } : {};
  const response = await api.get(`${RESOURCE}/echeancier`, { params });
  return response.data;
};

export const filtrerEcheances = (echeances, recherche) => {
  const q = recherche.trim().toLowerCase();
  if (!q) return echeances;

  return echeances.filter((e) =>
    `${e.numeroCredit} ${e.clientNom} ${e.clientPrenom} ${e.statut} ${e.numeroEcheance} ${e.dateEcheance}`
      .toLowerCase()
      .includes(q),
  );
};

export const calculerTotauxEcheances = (echeances) =>
  echeances.reduce(
    (acc, e) => {
      if (e.statut === 'PAYEE') acc.payee += Number(e.montant) || 0;
      else acc.resteDu += Number(e.montant) || 0;
      acc.total += Number(e.montant) || 0;
      return acc;
    },
    { total: 0, payee: 0, resteDu: 0 },
  );

export const colorerStatutEcheance = (statut) => {
  if (statut === 'PAYEE') return { backgroundColor: '#dcfce7', color: '#15803d' };
  if (statut === 'EN_RETARD') return { backgroundColor: '#fee2e2', color: '#b91c1c' };
  return { backgroundColor: '#fef3c7', color: '#b45309' };
};

export const echeancesVersCsv = (echeances) => {
  const entetes = ['Client', 'Credit', 'N echeance', 'Date echeance', 'Montant', 'Capital', 'Interet', 'Capital restant', 'Statut'];

  const echapper = (valeur) => `"${String(valeur ?? '').replace(/"/g, '""')}"`;

  const lignesCsv = echeances.map((e) =>
    [
      [e.clientPrenom, e.clientNom].filter(Boolean).join(' ').trim(),
      e.numeroCredit,
      e.numeroEcheance,
      e.dateEcheance,
      Number(e.montant || 0).toFixed(2).replace('.', ','),
      Number(e.capital || 0).toFixed(2).replace('.', ','),
      Number(e.interet || 0).toFixed(2).replace('.', ','),
      Number(e.capitalRestant || 0).toFixed(2).replace('.', ','),
      e.statut,
    ]
      .map(echapper)
      .join(';'),
  );

  return [entetes.map(echapper).join(';'), ...lignesCsv].join('\r\n');
};

export const telechargerCsvEcheances = (echeances, nomFichier) => {
  const contenu = '\uFEFF' + echeancesVersCsv(echeances);
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
