import { getAllTransactions } from './transactionService';

// Le backend n'expose pas encore d'écritures en partie double : le journal est
// donc reconstruit à partir des transactions, chaque transaction donnant une
// ligne au débit et une ligne au crédit.
export const COMPTE_TRESORERIE = {
  numero: '5.1.1',
  libelle: 'Caisse et tresorerie',
};

const COMPTE_CLIENT = (numero) => ({
  numero: numero || '—',
  libelle: numero ? `Compte client ${numero}` : 'Compte client inconnu',
});

export const colorerStatut = (statut) => {
  if (statut === 'SUCCES') return { backgroundColor: '#dcfce7', color: '#15803d' };
  if (statut === 'REJETE' || statut === 'ANNULE') return { backgroundColor: '#fee2e2', color: '#b91c1c' };
  return { backgroundColor: '#fef3c7', color: '#b45309' };
};

export const LIBELLES_TYPE = {
  DEPOT: 'Depot especes',
  RETRAIT: 'Retrait especes',
  VIREMENT: 'Virement',
};

const STATUTS_FILTRABLES = ['TOUS', 'SUCCES', 'EN_ATTENTE', 'REJETE', 'ANNULE'];

const toNombre = (valeur) => {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : 0;
};

export const getStatutsFiltrables = () => STATUTS_FILTRABLES;

export const transactionVersLignes = (tx) => {
  const montant = toNombre(tx.montant);
  const source = tx.numeroCompteSource;
  const destination = tx.numeroCompteDestination;
  const libelle = (tx.description && tx.description.trim()) || LIBELLES_TYPE[tx.type] || tx.type || 'Ecriture';

  const construireLigne = (suffixe, compte, debit, credit) => ({
    id: `${tx.id}-${suffixe}`,
    dateEcriture: tx.dateTransaction,
    reference: tx.reference,
    libelle,
    numeroCompte: compte.numero,
    libelleCompte: compte.libelle,
    debit,
    credit,
    montant,
    type: tx.type,
    statut: tx.statut,
    transactionId: tx.id,
    compteSource: source,
    compteDestination: destination,
  });

  if (tx.type === 'VIREMENT') {
    return [
      construireLigne('D', COMPTE_CLIENT(source), montant, 0),
      construireLigne('C', COMPTE_CLIENT(destination), 0, montant),
    ];
  }

  if (tx.type === 'DEPOT') {
    return [
      construireLigne('D', COMPTE_TRESORERIE, montant, 0),
      construireLigne('C', COMPTE_CLIENT(source), 0, montant),
    ];
  }

  return [
    construireLigne('D', COMPTE_CLIENT(source), montant, 0),
    construireLigne('C', COMPTE_TRESORERIE, 0, montant),
  ];
};

export const getJournal = async (statut = 'TOUS') => {
  const transactions = await getAllTransactions();
  const liste = Array.isArray(transactions) ? transactions : [];

  return liste
    .filter((tx) => statut === 'TOUS' || tx.statut === statut)
    .flatMap(transactionVersLignes)
    .sort((a, b) => {
      const diff = new Date(b.dateEcriture) - new Date(a.dateEcriture);
      if (diff !== 0) return diff;
      return String(a.reference).localeCompare(String(b.reference));
    });
};

export const filtrerLignes = (lignes, recherche) => {
  const q = recherche.trim().toLowerCase();
  if (!q) return lignes;

  return lignes.filter((l) =>
    `${l.reference} ${l.libelle} ${l.numeroCompte} ${l.libelleCompte} ${l.type} ${l.statut}`
      .toLowerCase()
      .includes(q),
  );
};

export const calculerTotaux = (lignes) =>
  lignes.reduce(
    (acc, l) => ({
      debit: acc.debit + toNombre(l.debit),
      credit: acc.credit + toNombre(l.credit),
    }),
    { debit: 0, credit: 0 },
  );

export const lignesVersCsv = (lignes) => {
  const entetes = ['Date', 'Reference', 'Libelle', 'Numero compte', 'Libelle compte', 'Debit', 'Credit', 'Montant', 'Type', 'Statut'];

  const echapper = (valeur) => `"${String(valeur ?? '').replace(/"/g, '""')}"`;

  const lignesCsv = lignes.map((l) =>
    [
      l.dateEcriture ? new Date(l.dateEcriture).toLocaleString('fr-FR') : '',
      l.reference,
      l.libelle,
      l.numeroCompte,
      l.libelleCompte,
      toNombre(l.debit).toFixed(2).replace('.', ','),
      toNombre(l.credit).toFixed(2).replace('.', ','),
      toNombre(l.montant).toFixed(2).replace('.', ','),
      l.type,
      l.statut,
    ]
      .map(echapper)
      .join(';'),
  );

  return [entetes.map(echapper).join(';'), ...lignesCsv].join('\r\n');
};

export const telechargerCsv = (lignes, nomFichier) => {
  const contenu = '\uFEFF' + lignesVersCsv(lignes);
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
