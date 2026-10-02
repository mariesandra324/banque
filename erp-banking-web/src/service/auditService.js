import api from '../api/axios';

const AUDIT_URL = '/audit';

/**
 * Construit la query string en ignorant les filtres vides,
 * pour ne pas envoyer role=""&module="" au backend.
 */
const construireParams = (filtres = {}) => {
  const params = {};

  if (filtres.utilisateurId) params.utilisateurId = filtres.utilisateurId;
  if (filtres.role) params.role = filtres.role;
  if (filtres.module) params.module = filtres.module;
  if (filtres.action) params.action = filtres.action;
  if (filtres.depuis) params.depuis = filtres.depuis;
  if (filtres.jusqua) params.jusqua = filtres.jusqua;
  if (filtres.recherche) params.recherche = filtres.recherche;
  if (filtres.page !== undefined && filtres.page !== null) params.page = filtres.page;
  if (filtres.taille !== undefined && filtres.taille !== null) params.taille = filtres.taille;

  return params;
};

export const auditService = {
  /** Journal filtré et paginé côté serveur. */
  getAuditLogs: async (filtres) => {
    const response = await api.get(AUDIT_URL, { params: construireParams(filtres) });
    return response.data;
  },

  /** Valeurs disponibles pour alimenter les menus déroulants des filtres. */
  getAuditFiltres: async () => {
    const response = await api.get(`${AUDIT_URL}/filtres`);
    return response.data;
  },

  /** URL de téléchargement du CSV, à ouvrir dans un nouvel onglet. */
  getExportUrl: (filtres) => {
    const params = construireParams(filtres);
    const query = new URLSearchParams(params).toString();
    return `${api.defaults.baseURL}${AUDIT_URL}/export${query ? `?${query}` : ''}`;
  },

  /** Déclenche le téléchargement du CSV en réutilisant le token du header. */
  exportCsv: async (filtres) => {
    const response = await api.get(`${AUDIT_URL}/export`, {
      params: construireParams(filtres),
      responseType: 'blob',
    });

    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8' }));
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `journal-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    URL.revokeObjectURL(url);
  },
};

export default auditService;
