import { useEffect, useState } from "react";
import {
  Store,
  DoorOpen,
  DoorClosed,
  Send,
  Calculator,
  RefreshCw,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  getMonGuichet,
  ouvrirSession,
  fermerSession,
  creerDemandeTransfert,
  getMesDemandesTransfert,
  enregistrerComptage,
  getMesComptages,
} from "../service/caisseService";

const formatMontant = (montant) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(Number(montant) || 0)) + " Ar";

function MonGuichet() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState("aperçu");
  const [notification, setNotification] = useState(null);

  const [soldeOuverture, setSoldeOuverture] = useState("");
  const [soldeFermeture, setSoldeFermeture] = useState("");
  const [obsFermeture, setObsFermeture] = useState("");

  const [montantTransfert, setMontantTransfert] = useState("");
  const [motifTransfert, setMotifTransfert] = useState("");
  const [mesDemandes, setMesDemandes] = useState([]);
  const [demandesChargees, setDemandesChargees] = useState(false);
  const [chargementDemandes, setChargementDemandes] = useState(false);

  const [montantTheo, setMontantTheo] = useState("");
  const [obsComptage, setObsComptage] = useState("");
  const [billets, setBillets] = useState({
    billets20000:0,
    billets10000: 0, billets5000: 0, billets2000: 0, billets1000: 0,
    pieces500: 0, pieces200: 0, pieces100: 0, 
  });
  const [mesComptages, setMesComptages] = useState([]);
  const [comptagesCharges, setComptagesCharges] = useState(false);
  const [chargementComptages, setChargementComptages] = useState(false);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const charger = async () => {
    try {
      if (!data) setLoading(true);
      const res = await getMonGuichet();
      setData(res.data);
      if (res.data?.soldeDisponible != null) {
        setMontantTheo(String(Math.round(Number(res.data.soldeDisponible) || 0)));
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      showNotif("Erreur lors du chargement du guichet", "error");
    } finally {
      setLoading(false);
    }
  };

  const chargerDemandes = async (forcer = false) => {
    if ((!forcer && demandesChargees) || chargementDemandes) return;
    setChargementDemandes(true);
    try {
      const res = await getMesDemandesTransfert();
      setMesDemandes(res.data || []);
    } catch {
      setMesDemandes([]);
    } finally {
      setDemandesChargees(true);
      setChargementDemandes(false);
    }
  };

  const chargerComptages = async (forcer = false) => {
    if ((!forcer && comptagesCharges) || chargementComptages) return;
    setChargementComptages(true);
    try {
      const res = await getMesComptages();
      setMesComptages(res.data || []);
    } catch {
      setMesComptages([]);
    } finally {
      setComptagesCharges(true);
      setChargementComptages(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
    // Load only the summary on first render; transaction histories are loaded when requested.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changerOnglet = (tab) => {
    setOnglet(tab);
    if (tab === "transfert") chargerDemandes();
    if (tab === "comptage") chargerComptages();
    if (tab === "historique") {
      chargerDemandes();
      chargerComptages();
    }
  };

  const handleOuvrir = async () => {
    try {
      await ouvrirSession({ guichetId: data?.guichetId, soldeOuverture: Number(soldeOuverture) || 0 });
      showNotif("Session de caisse ouverte avec succès");
      charger();
    } catch (e) {
      showNotif(e.response?.data?.message || "Erreur ouverture session", "error");
    }
  };

  const handleFermer = async () => {
    try {
      await fermerSession({ soldeFermeture: Number(soldeFermeture) || 0, observation: obsFermeture });
      showNotif("Session de caisse fermée avec succès");
      charger();
    } catch (e) {
      showNotif(e.response?.data?.message || "Erreur fermeture session", "error");
    }
  };

  const handleDemandeTransfert = async (e) => {
    e.preventDefault();
    try {
      await creerDemandeTransfert({ guichetId: data?.guichetId, montant: Number(montantTransfert), motif: motifTransfert });
      showNotif("Demande de transfert envoyée au gestionnaire");
      setMontantTransfert("");
      setMotifTransfert("");
      charger();
      chargerDemandes(true);
    } catch (e) {
      showNotif(e.response?.data?.message || "Erreur envoi demande", "error");
    }
  };

  const calculerPhysique = () => {
    let total = 0;
    total += (Number(billets.billets20000||0)*20000);
    total += (Number(billets.billets10000)||0)*10000;
    total += (Number(billets.billets5000)||0)*5000;
    total += (Number(billets.billets2000)||0)*2000;
    total += (Number(billets.billets1000)||0)*1000;
    total += (Number(billets.pieces500)||0)*500;
    total += (Number(billets.pieces200)||0)*200;
    total += (Number(billets.pieces100)||0)*100;
    return total;
  };

  const handleComptage = async (e) => {
    e.preventDefault();
    try {
      const physique = calculerPhysique();
      await enregistrerComptage({
        sessionCaisseId: data?.sessionOuverte?.id,
        guichetId: data?.guichetId,
        montantTheorique: Number(montantTheo) || 0,
        ...billets,
        observation: obsComptage,
      });
      const ecart = physique - (Number(montantTheo)||0);
      showNotif(`Comptage enregistré. Montant physique : ${formatMontant(physique)} | Écart : ${formatMontant(ecart)}`);
      charger();
      chargerComptages(true);
    } catch (e) {
      showNotif(e.response?.data?.message || "Erreur enregistrement comptage", "error");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Chargement...</div>;
  if (!data?.guichetId) return <div style={{ padding: 24 }}>Aucun guichet affecté à votre compte agent.</div>;

  const sessionOuverte = data?.sessionOuverte;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: 10 }}><Store size={22}/> Mon Guichet</h1>
        <button onClick={charger} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 6, border: "1px solid var(--border-color)", background: "var(--card-bg)", cursor: "pointer" }}><RefreshCw size={16}/> Actualiser</button>
      </div>

      {notification && (
        <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 8, background: notification.type==="error"?"#fef2f2":"#ecfdf5", color: notification.type==="error"?"#991b1b":"#065f46"  }}>
          {notification.msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Guichet</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{data.codeGuichet}</div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            {sessionOuverte ? <><DoorOpen size={16} color="#10b981"/><span style={{ color: "#10b981", fontWeight: 500 }}>Ouvert</span></> : <><DoorClosed size={16} color="#f59e0b"/><span style={{ color: "#f59e0b", fontWeight: 500 }}>Fermé</span></>}
          </div>
        </div>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Solde disponible (estimé)</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{formatMontant(data?.soldeDisponible)}</div>
        </div>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Agent</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{user?.prenom} {user?.nom}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["aperçu", "transfert", "comptage", "historique"].map(t => (
          <button key={t} onClick={() => changerOnglet(t)} style={{ padding: "8px 14px", borderRadius: 8, border: onglet===t?"1px solid #2563eb":"1px solid var(--border-color)", background: onglet===t?"rgba(37,99,235,0.08)":"var(--card-bg)", color: onglet===t?"#2563eb":"var(--text-primary)", cursor: "pointer", textTransform: "capitalize" }}>{t === "aperçu"?"Aperçu":t === "transfert"?"Demande de transfert au coffre":t === "comptage"?"Comptage physique & écart":"Historique"}</button>
        ))}
      </div>

      {onglet === "aperçu" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: 8 }}><DoorOpen size={18}/> Gestion session</h3>
            {!sessionOuverte ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="number" placeholder="Solde d'ouverture (Ar)" value={soldeOuverture} onChange={e=>setSoldeOuverture(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}/>
                <button onClick={handleOuvrir} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#10b981", color: "white", cursor: "pointer" }}>Ouvrir la caisse</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="number" placeholder="Solde de fermeture (Ar)" value={soldeFermeture} onChange={e=>setSoldeFermeture(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}/>
                <input placeholder="Observation" value={obsFermeture} onChange={e=>setObsFermeture(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}/>
                <button onClick={handleFermer} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#f59e0b", color: "white", cursor: "pointer" }}>Fermer la caisse</button>
              </div>
            )}
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: 8 }}><ArrowLeftRight size={18}/> 5 dernières transactions du guichet</h3>
            {(data?.dernieresTransactions||[]).length === 0 ? <div style={{ color: "var(--text-secondary)" }}>Aucune transaction</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(data?.dernieresTransactions||[]).map(tx => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--faint)" }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{tx.reference}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{tx.type} • {tx.dateTransaction ? new Date(tx.dateTransaction).toLocaleString("fr-FR") : ""}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatMontant(tx.montant)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {onglet === "transfert" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
          <form onSubmit={handleDemandeTransfert} style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Send size={18}/> Demande de transfert vers coffre-fort / gestionnaire</h3>
            <input type="number" placeholder="Montant physique à transférer (Ar)" value={montantTransfert} onChange={e=>setMontantTransfert(e.target.value)} required style={{ padding: 10, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}/>
            <textarea placeholder="Motif de la demande" value={motifTransfert} onChange={e=>setMotifTransfert(e.target.value)} rows={4} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)", resize: "vertical" }}/>
            <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#2563eb", color: "white", cursor: "pointer" }}>Envoyer la demande</button>
          </form>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px 0" }}>Mes demandes</h3>
            {chargementDemandes ? <div style={{ color: "var(--text-secondary)" }}>Chargement des demandes...</div> : (mesDemandes||[]).length === 0 ? <div style={{ color: "var(--text-secondary)" }}>Aucune demande</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mesDemandes.map(d => (
                  <div key={d.id} style={{ padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{formatMontant(d.montant)}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.dateDemande ? new Date(d.dateDemande).toLocaleString("fr-FR") : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {d.statut === "EN_ATTENTE" && <><AlertTriangle size={16} color="#f59e0b"/><span style={{ color: "#f59e0b" }}>En attente</span></>}
                      {d.statut === "ACCEPTE" && <><CheckCircle2 size={16} color="#10b981"/><span style={{ color: "#10b981" }}>Acceptée</span></>}
                      {d.statut === "REFUSE" && <><XCircle size={16} color="#ef4444"/><span style={{ color: "#ef4444" }}>Refusée</span></>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {onglet === "comptage" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
          <form onSubmit={handleComptage} style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Calculator size={18}/> Comptage physique & calcul d'écart</h3>
            <input type="number" placeholder="Montant théorique (Ar)" value={montantTheo} onChange={e=>setMontantTheo(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}/>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {[["billets20000", "Billets 20000"],["billets10000","Billets 10000"],["billets5000","Billets 5000"],["billets2000","Billets 2000"],["billets1000","Billets 1000"],["pieces500","Pièces 500"],["pieces200","Pièces 200"],["pieces100","Pièces 100"]].map(([k,l]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l}</label>
                  <input type="number" min="0" value={billets[k]} onChange={e=>setBillets({...billets,[k]:e.target.value})} style={{ padding: 8, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}/>
                </div>
              ))}
            </div>  
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(37,99,235,0.06)", display: "flex", justifyContent: "space-between" }}>
              <span>Montant physique calculé</span>
              <strong>{formatMontant(calculerPhysique())}</strong>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: (calculerPhysique() - (Number(montantTheo)||0)) >=0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", display: "flex", justifyContent: "space-between" }}>
              <span>Écart</span>
              <strong style={{ color: (calculerPhysique() - (Number(montantTheo)||0)) >=0 ? "#10b981" : "#ef4444" }}>{(calculerPhysique() - (Number(montantTheo)||0)) >=0?'+':''}{formatMontant(calculerPhysique() - (Number(montantTheo)||0))}</strong>
            </div>
            <textarea placeholder="Observation" value={obsComptage} onChange={e=>setObsComptage(e.target.value)} rows={3} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--input-border)", background: "var(--card-bg)", color: "var(--text-primary)", resize: "vertical" }}/>
            <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#2563eb", color: "white", cursor: "pointer" }}>Enregistrer le comptage</button>
          </form>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px 0" }}>Mes derniers comptages</h3>
            {chargementComptages ? <div style={{ color: "var(--text-secondary)" }}>Chargement des comptages...</div> : (mesComptages||[]).length === 0 ? <div style={{ color: "var(--text-secondary)" }}>Aucun comptage</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mesComptages.slice(0,10).map(c => (
                  <div key={c.id} style={{ padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600 }}>{formatMontant(c.montantPhysique)}</span>
                      <span style={{ color: Number(c.ecart)>=0?"#10b981":"#ef4444", fontWeight: 600 }}>{Number(c.ecart)>=0?'+':''}{formatMontant(c.ecart)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{c.dateComptage ? new Date(c.dateComptage).toLocaleString("fr-FR") : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {onglet === "historique" && (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px 0" }}>Historique complet</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            <div>
              <h4 style={{ margin: "0 0 10px 0" }}>Demandes de transfert</h4>
              {(mesDemandes||[]).map(d => (
                <div key={d.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--faint)", display: "flex", justifyContent: "space-between" }}>
                  <span>{formatMontant(d.montant)}</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{d.statut}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ margin: "0 0 10px 0" }}>Comptages</h4>
              {(mesComptages||[]).map(c => (
                <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--faint)", display: "flex", justifyContent: "space-between" }}>
                  <span>Physique {formatMontant(c.montantPhysique)}</span>
                  <span style={{ color: Number(c.ecart)>=0?"#10b981":"#ef4444" }}>Écart {Number(c.ecart)>=0?'+':''}{formatMontant(c.ecart)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonGuichet;
