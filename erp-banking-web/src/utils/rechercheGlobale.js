import { clientService } from '../service/clientService';
import { getComptes } from '../service/compteService';
import { getAllTransactions } from '../service/transactionService';
import { getDemandesCredit, getCredits } from '../service/creditService';

export async function rechercheGlobale(texte, limiteParCategorie = null) {
  const texteLower = (texte ?? '').trim().toLowerCase();

  const [clients, comptesRes, transactions, demandes, credits] = await Promise.all([
    clientService.searchClients(texte).catch(() => []),
    getComptes().catch(() => ({ data: [] })),
    getAllTransactions().catch(() => []),
    getDemandesCredit().catch(() => []),
    getCredits().catch(() => []),
  ]);

  const tronquer = (liste) => {
    const arr = Array.isArray(liste) ? liste : [];
    return limiteParCategorie ? arr.slice(0, limiteParCategorie) : arr;
  };

  const comptesFiltres = tronquer(
    (Array.isArray(comptesRes?.data) ? comptesRes.data : []).filter(
      (c) =>
        c.numeroCompte?.toLowerCase().includes(texteLower) ||
        c.typeCompte?.toLowerCase().includes(texteLower) ||
        c.iban?.toLowerCase().includes(texteLower)
    )
  );

  const transactionsFiltrees = tronquer(
    (Array.isArray(transactions) ? transactions : []).filter(
      (t) =>
        t.reference?.toLowerCase().includes(texteLower) ||
        String(t.type ?? '').toLowerCase().includes(texteLower) ||
        t.numeroCompteSource?.toLowerCase().includes(texteLower) ||
        t.numeroCompteDestination?.toLowerCase().includes(texteLower) ||
        String(t.montant ?? '').includes(texteLower)
    )
  );

  const demandesFiltrees = (Array.isArray(demandes) ? demandes : []).filter(
    (d) =>
      d.clientNom?.toLowerCase().includes(texteLower) ||
      d.clientPrenom?.toLowerCase().includes(texteLower) ||
      d.motif?.toLowerCase().includes(texteLower) ||
      String(d.statut ?? '').toLowerCase().includes(texteLower)
  );

  const creditsFiltres = (Array.isArray(credits) ? credits : []).filter(
    (c) =>
      c.numeroCredit?.toLowerCase?.().includes(texteLower) ||
      c.clientNom?.toLowerCase().includes(texteLower) ||
      c.clientPrenom?.toLowerCase().includes(texteLower) ||
      String(c.statut ?? '').toLowerCase().includes(texteLower)
  );

  const creditsCombines = tronquer([
    ...demandesFiltrees.map((d) => ({ ...d, _type: 'demande' })),
    ...creditsFiltres.map((c) => ({ ...c, _type: 'credit' })),
  ]);

  return {
    clients: tronquer(Array.isArray(clients) ? clients : []),
    comptes: comptesFiltres,
    transactions: transactionsFiltrees,
    credits: creditsCombines,
  };
}

export default rechercheGlobale;