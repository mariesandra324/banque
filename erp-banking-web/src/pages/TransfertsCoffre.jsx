import { useEffect, useState } from "react";
import { ArrowDownUp, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { getDemandesTransfertEnAttente, traiterDemandeTransfert } from "../service/caisseService";

const formatMontant = (montant) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(Number(montant) || 0)) + " Ar";

function TransfertsCoffre() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motifRefus, setMotifRefus] = useState({});
  const [notification, setNotification] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const charger = async () => {
    try {
      setLoading(true);
      const res = await getDemandesTransfertEnAttente();
      setDemandes(res.data || []);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      showNotif("Erreur chargement demandes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, []);

  const traiter = async (id, accepter) => {
    try {
      await traiterDemandeTransfert(id, { accepter, motifRefus: motifRefus[id] || "" });
      showNotif(accepter ? "Demande acceptée" : "Demande refusée");
      charger();
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      showNotif("Erreur traitement", "error");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: 10 }}><ArrowDownUp size={22}/> Demandes de transfert vers coffre</h1>
        <button onClick={charger} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 6, border: "1px solid var(--border-color)", background: "var(--card-bg)", cursor: "pointer" }}><RefreshCw size={16}/> Actualiser</button>
      </div>

      {notification && (
        <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 8, background: notification.type==="error"?"#fef2f2":"#ecfdf5", color: notification.type==="error"?"#991b1b":"#065f46"  }}>
          {notification.msg}
        </div>
      )}

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--table-header)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Guichet</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Agent</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Montant</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Motif</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Date</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 20, textAlign: "center" }}>Chargement...</td></tr>
            ) : demandes.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)" }}>Aucune demande en attente</td></tr>
            ) : (
              demandes.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--faint)" }}>
                  <td style={{ padding: "12px 16px" }}>{d.guichet?.codeGuichet}</td>
                  <td style={{ padding: "12px 16px" }}>{d.agentDemandeur?.prenom} {d.agentDemandeur?.nom}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{formatMontant(d.montant)}</td>
                  <td style={{ padding: "12px 16px" }}>{d.motif || "-"}</td>
                  <td style={{ padding: "12px 16px" }}>{d.dateDemande ? new Date(d.dateDemande).toLocaleString("fr-FR") : "-"}</td>
                  <td style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => traiter(d.id, true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, border: "none", background: "#10b981", color: "white", cursor: "pointer" }}><CheckCircle2 size={16}/> Accepter</button>
                      <button onClick={() => traiter(d.id, false)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, border: "none", background: "#ef4444", color: "white", cursor: "pointer" }}><XCircle size={16}/> Refuser</button>
                    </div>
                    <input placeholder="Motif de refus (si refus)" value={motifRefus[d.id] || ""} onChange={e => setMotifRefus({...motifRefus, [d.id]: e.target.value})} style={{ padding: 8, borderRadius: 6, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}/>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransfertsCoffre;
