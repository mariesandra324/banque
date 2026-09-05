import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search} from 'lucide-react';
import '../../styles/offres-credit.css';

const PAR_PAGE = 10;

const styleStatut = (statut) => {
  const s = (statut || '').toUpperCase();

  if (s === 'ACCEPTEE') {
    return 'statut-acceptee';
  }

  if (s === 'REFUSEE' || s === 'EXPIREE') {
    return 'statut-refusee';
  }

  return 'statut-attente';
};

const formatMontant = (montant) =>
  new Intl.NumberFormat('fr-FR').format(montant || 0) + ' Ar';

const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  return isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString('fr-FR');
};

function OffreCreditTable({offres = []}) 
{
  const navigate = useNavigate();

  const [recherche, setRecherche] = useState('');
  const [statutFiltre, setStatutFiltre] = useState('');
  const [page, setPage] = useState(1);

  const statutsDisponibles = useMemo(() => {
    const liste = Array.isArray(offres) ? offres : [];

    return Array.from(new Set(liste
          .map((o) => o.statut)
          .filter(Boolean)
      )
    );
  }, [offres]);

  const offresFiltrees = useMemo(() => {
    const liste = Array.isArray(offres) ? offres : [];
    const q = recherche.trim().toLowerCase();

    let filtres = !q
      ? liste
      : liste.filter((o) => {
          const texte = `
            ${o.numeroOffre || ''}
            ${o.clientNom || ''}
            ${o.clientPrenom || ''}
            ${o.demandeCreditId || ''}
          `.toLowerCase();

          return texte.includes(q);
        });

    if (statutFiltre) 
      {
        filtres = filtres.filter((o) => o.statut === statutFiltre);
      }

    return [...filtres].sort(
      (a, b) => new Date(b.dateOffre) - new Date(a.dateOffre));
  }, [offres, recherche, statutFiltre]);

  const totalPages = Math.max(1,Math.ceil(offresFiltrees.length / PAR_PAGE));
  const pageActuelle = Math.min(page, totalPages);

  const offresPage = offresFiltrees.slice((pageActuelle - 1) * PAR_PAGE,pageActuelle * PAR_PAGE);

  return (
    <div className="offre-credit-container">

      {/* Recherche */}
      <div className="offre-credit-toolbar">

        <div className="offre-search">
          <Search size={16} className="offre-search-icon"/>
          <input
            type="text"
            placeholder="Rechercher une offre..."
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={statutFiltre}
          onChange={(e) => 
          {
            setStatutFiltre(e.target.value);setPage(1);
          }}
        >
          <option value="">Tous les statuts</option>

          {statutsDisponibles.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="offre-table-wrapper">
        <table className="offre-credit-table">
          <thead>
            <tr>
              <th>N° Offre</th>
              <th>Demande</th>
              <th>Client</th>
              <th>Montant proposé</th>
              <th>Taux</th>
              <th>Durée</th>
              <th>Mensualité</th>
              <th>Expiration</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {offresPage.length === 0 ? (
              <tr>
                <td colSpan="10" className="offre-empty">Aucune offre de crédit trouvée.</td>
              </tr>
            ) : (

              offresPage.map((o) => (
                <tr key={o.id}>
                  <td className="offre-numero">{o.numeroOffre || `#${o.id}`}</td>
                  <td>#{o.demandeCreditId}</td>
                  <td>{o.clientNom}{o.clientPrenom}</td>
                  <td>{formatMontant(o.montantPropose)}</td>
                  <td>{o.tauxInteret} %</td>
                  <td>{o.duree ?? '-'} mois</td>
                  <td>{formatMontant(o.mensualite)}</td>
                  <td> {formatDate(o.dateExpiration)}</td>
                  <td>
                    <span className={`offre-statut ${styleStatut(o.statut)}`}>
                      {o.statut}
                    </span>
                  </td>
                  <td className="offre-actions">
                    <button
                      className="btn-details"
                      onClick={() =>navigate(`/credits/offres/${o.id}`)}
                    >
                      Détails
                    </button>

                    {/* {o.statut === 'EN_ATTENTE' && (
                      <>

                        <button 
                        className="btn-accepter"
                        onClick={() => onAccepter?.(o.id)}>
                          <Check size={14} />Accepter
                        </button>

                        <button
                          className="btn-refuser"
                          onClick={() => onRefuser?.(o.id)}
                        >
                          <X size={14} />Refuser
                        </button>
                      </>
                    )} */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="offre-pagination">
        <span>{offresFiltrees.length} offre(s)</span>
        <div className="offre-pagination-buttons">

          {Array.from({ length: totalPages },(_, i) => i + 1).map((n) => 
          (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={
                n === pageActuelle
                  ? 'page-active'
                  : ''
              }
            >
              {n}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}

export default OffreCreditTable;