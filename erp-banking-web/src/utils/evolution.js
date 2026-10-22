// ==========================================================================
//   ÉVOLUTIONS / COURBES DU TABLEAU DE BORD
//   Fonctions pures : découpage temporel, courbes de solde, volumes,
//   crédits accordés et performance financière.
// ==========================================================================

// Périodes proposées par le sélecteur (D, 1W, 1M, 6M, 1Y)
export const PERIODES = [
  { code: 'D', label: 'Jour', pas: 'heure', points: 24 },
  { code: '1W', label: 'Semaine', pas: 'jour', points: 7 },
  { code: '1M', label: 'Mois', pas: 'jour', points: 30 },
  { code: '6M', label: '6 mois', pas: 'semaine', points: 26 },
  { code: '1Y', label: 'Année', pas: 'mois', points: 12 },
];

export const METRIQUES = [
  { code: 'solde', label: 'Solde' },
  { code: 'transactions', label: 'Transactions' },
  { code: 'credits', label: 'Crédits' },
  { code: 'performance', label: 'Performance' },
];

// --- Outils de dates -------------------------------------------------------

const aligner = (date, pas) => {
  const d = new Date(date);
  if (pas === 'heure') {
    d.setMinutes(0, 0, 0);
  } else if (pas === 'jour' || pas === 'semaine') {
    d.setHours(0, 0, 0, 0);
    if (pas === 'semaine') {
      // Semaine ISO : on recule jusqu'au lundi
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    }
  } else {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
  return d;
};

const avancer = (date, pas, pasNombre) => {
  const d = new Date(date);
  if (pas === 'heure') d.setHours(d.getHours() + pasNombre);
  else if (pas === 'jour') d.setDate(d.getDate() + pasNombre);
  else if (pas === 'semaine') d.setDate(d.getDate() + 7 * pasNombre);
  else d.setMonth(d.getMonth() + pasNombre);
  return d;
};

const libelleBucket = (date, pas) => {
  if (pas === 'heure') {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  if (pas === 'mois') {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

// Découpe la période en intervalles contigus (du plus ancien au plus récent)
export function construireBuckets(codePeriode, maintenant = new Date()) {
  const periode = PERIODES.find((p) => p.code === codePeriode) || PERIODES[2];
  const premier = aligner(maintenant, periode.pas);

  const buckets = [];
  for (let i = periode.points - 1; i >= 0; i--) {
    const debut = avancer(premier, periode.pas, -i);
    const fin = avancer(debut, periode.pas, 1);
    buckets.push({ debut, fin, label: libelleBucket(debut, periode.pas) });
  }
  return buckets;
}

const transactionsReussies = (transactions) =>
  (transactions ?? []).filter((t) => t?.statut === 'SUCCES');

// --- FluxMovement ----------------------------------------------------------
// Sémantique backend (TransactionServiceImpl) :
//   DEPOT   -> le compte "source" est CRÉDITÉ
//   RETRAIT -> le compte "source" est DÉBITÉ
//   VIREMENT-> source débitée, destination créditée

export function fluxTransaction(transaction) {
  const montant = Number(transaction?.montant) || 0;
  const source = transaction?.numeroCompteSource;
  const destination = transaction?.numeroCompteDestination;

  switch (transaction?.type) {
    case 'DEPOT':
      return source ? { entree: montant, sortie: 0, net: montant } : { entree: 0, sortie: 0, net: 0 };
    case 'RETRAIT':
      return source ? { entree: 0, sortie: montant, net: -montant } : { entree: 0, sortie: 0, net: 0 };
    case 'VIREMENT':
      return {
        entree: destination ? montant : 0,
        sortie: source ? montant : 0,
        net: (destination ? montant : 0) - (source ? montant : 0),
      };
    default:
      return { entree: 0, sortie: 0, net: 0 };
  }
}

// Détermine si un compte appartient à un filtre donné
// filtre peut être : null/"" (tous) | numéro de compte (existant) | type de compte
const compteCorrespond = (compte, filtre) => {
  if (!filtre) return true;
  if (!compte) return false;
  if (compte.numeroCompte === filtre || compte.typeCompte === filtre) return true;
  return false;
};

// Flux appliqué au filtre (tous / type de compte / numéro de compte)
const fluxPourCompte = (transaction, filtre, comptesMap) => {
  const montant = Number(transaction?.montant) || 0;
  const { entree, sortie } = fluxTransaction(transaction);

  if (!filtre) {
    return entree - sortie;
  }

  if (transaction?.type === 'VIREMENT') {
    const sourceOk = comptesMap?.get(transaction?.numeroCompteSource)?.matches || transaction?.numeroCompteSource === filtre;
    const destOk = comptesMap?.get(transaction?.numeroCompteDestination)?.matches || transaction?.numeroCompteDestination === filtre;
    const credit = destOk ? montant : 0;
    const debit = sourceOk ? montant : 0;
    return credit - debit;
  }

  // DEPOT / RETRAIT : seul le compte "source" est concerné
  const sourceOk = comptesMap?.get(transaction?.numeroCompteSource)?.matches || transaction?.numeroCompteSource === filtre;
  return sourceOk ? entree - sortie : 0;
};

// Soldes des comptes concernés
const soldeActuel = (comptes, filtre) => {
  const cibles = (comptes ?? []).filter((cp) => compteCorrespond(cp, filtre));
  return cibles.reduce((sum, cp) => sum + (Number(cp?.solde) || 0), 0);
};

// --- Courbe du solde --------------------------------------------------------
// Le solde actuel est connu : on le « rembobine » en retranchant les
// mouvements postérieurs à chaque point de la courbe.
export function serieSolde(buckets, transactions, comptes, numeroCompte = null) {
  const filtre = numeroCompte || null;
  const comptesMap = new Map(
    (comptes ?? []).map((cp) => [cp.numeroCompte, { matches: compteCorrespond(cp, filtre), typeCompte: cp.typeCompte }])
  );

  const liste = transactionsReussies(transactions)
    .map((t) => ({ date: new Date(t.dateTransaction).getTime(), flux: fluxPourCompte(t, filtre, comptesMap) }))
    .filter((t) => !Number.isNaN(t.date))
    .sort((a, b) => a.date - b.date);

  let cumulTotal = 0;
  const prefixes = liste.map((t) => {
    cumulTotal += t.flux;
    return { date: t.date, cumul: cumulTotal };
  });

  const final = soldeActuel(comptes, filtre);

  return buckets.map((bucket) => {
    const t0 = bucket.debut.getTime();
    let cumulAvant = 0;
    for (const p of prefixes) {
      if (p.date <= t0) cumulAvant = p.cumul;
      else break;
    }
    return {
      label: bucket.label,
      valeur: Math.round(final - (cumulTotal - cumulAvant)),
    };
  });
}

// --- Volume des transactions ------------------------------------------------
export function serieTransactions(buckets, transactions) {
  const liste = transactionsReussies(transactions);

  return buckets.map((bucket) => {
    let entree = 0;
    let sortie = 0;
    for (const t of liste) {
      const date = new Date(t.dateTransaction).getTime();
      if (Number.isNaN(date) || date < bucket.debut.getTime() || date >= bucket.fin.getTime()) continue;
      const flux = fluxTransaction(t);
      entree += flux.entree;
      sortie += flux.sortie;
    }
    return {
      label: bucket.label,
      entrees: Math.round(entree),
      sorties: Math.round(sortie),
      net: Math.round(entree - sortie),
    };
  });
}

// --- Crédits accordés ------------------------------------------------------
export function serieCredits(buckets, credits) {
  const liste = (credits ?? [])
    .map((cr) => ({ date: new Date(cr.dateDebut || cr.dateDemande).getTime(), montant: Number(cr.montant) || 0 }))
    .filter((c) => !Number.isNaN(c.date));

  let cumul = 0;
  return buckets.map((bucket) => {
    let montant = 0;
    let nombre = 0;
    for (const c of liste) {
      if (c.date < bucket.debut.getTime() || c.date >= bucket.fin.getTime()) continue;
      montant += c.montant;
      nombre += 1;
    }
    cumul += montant;
    return {
      label: bucket.label,
      valeur: Math.round(montant),
      cumul: Math.round(cumul),
      nombre,
    };
  });
}

// --- Performance financière ------------------------------------------------
// Flux net du mois : entrées - sorties + crédits accordés
export function seriePerformance(buckets, transactions, credits) {
  const volumes = serieTransactions(buckets, transactions);
  const fluxCredits = serieCredits(buckets, credits);

  return buckets.map((bucket, i) => {
    const net = (volumes[i]?.net || 0) + (fluxCredits[i]?.valeur || 0);
    return {
      label: bucket.label,
      valeur: Math.round(net),
      volume: volumes[i]?.net || 0,
      credit: fluxCredits[i]?.valeur || 0,
    };
  });
}
