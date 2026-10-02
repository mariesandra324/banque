import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  CreditCard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  FileText,
  CircleDollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  RefreshCw,
} from "lucide-react";

import api from "../service/api";
import "../styles/clientDossier.css";

function ClientDossier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("comptes");

  const chargerDossier = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await api.get(`/clients/${id}/dossier`);
      setDossier(response.data);
    } catch (err) {
      console.error("Erreur chargement dossier client :", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de charger le dossier du client."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerDossier();
  }, [chargerDossier]);

  const client = useMemo(() => dossier?.client || {}, [dossier]);
  const comptes = useMemo(() => dossier?.comptes || [], [dossier]);
  const cartes = useMemo(() => dossier?.cartes || [], [dossier]);
  const transactions = useMemo(() => dossier?.transactions || [], [dossier]);
  const demandesCredit = useMemo(() => dossier?.demandesCredit || [], [dossier]);
  const offresCredit = useMemo(() => dossier?.offresCredit || [], [dossier]);
  const credits = useMemo(() => dossier?.credits || [], [dossier]);

  const formatMontant = (montant) => {
    if (montant === null || montant === undefined) return "0 Ar";
    return new Intl.NumberFormat("fr-FR").format(montant) + " Ar";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR").format(new Date(date));
  };

  const getStatutClass = (statut) => {
    if (!statut) return "statut-neutre";
    const value = statut.toString().toUpperCase();

    if (["ACTIF", "ACCEPTE", "SUCCES"].some((s) => value.includes(s))) {
      return "statut-success";
    }
    if (["ATTENTE", "EN_COURS", "EN COURS"].some((s) => value.includes(s))) {
      return "statut-warning";
    }
    if (["REJETE", "REFUSE", "BLOQUE"].some((s) => value.includes(s))) {
      return "statut-danger";
    }
    return "statut-neutre";
  };

  const getTransactionIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "DEPOT":
        return <ArrowDownToLine size={18} />;
      case "RETRAIT":
        return <ArrowUpFromLine size={18} />;
      case "VIREMENT":
        return <ArrowLeftRight size={18} />;
      default:
        return <CircleDollarSign size={18} />;
    }
  };

  const getTransactionClass = (type, transaction) => {
    const typeUpper = type?.toUpperCase();
    if (typeUpper === "DEPOT") return "transaction-positive";
    if (typeUpper === "RETRAIT") return "transaction-negative";
    if (typeUpper === "VIREMENT") {
      const compteClient = comptes.some(
        (compte) => compte.numeroCompte === transaction.numeroCompteSource
      );
      return compteClient ? "transaction-negative" : "transaction-positive";
    }
    return "";
  };

  if (loading) {
    return (
      <div className="client-dossier-page">
        <div className="dossier-loading">
          <RefreshCw className="loading-icon animate-spin" size={28} />
          <p>Chargement du dossier client...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-dossier-page">
        <div className="dossier-error">
          <h3>Impossible de charger le dossier</h3>
          <p>{error}</p>
          <button className="btn-retour" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!dossier) return null;

  return (
    <div className="client-dossier-page">
      {/* HEADER */}
      <header className="dossier-header">
        <button className="dossier-back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={19} />
          Retour
        </button>

        <p className="dossier-breadcrumb">Dossier client #{client.id}</p>

        <button
          className={`refresh-button ${refreshing ? "is-refreshing" : ""}`}
          onClick={() => chargerDossier(true)}
          title="Actualiser"
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </header>

      {/* ===================================================
          LAYOUT PRINCIPAL : profil (gauche) + contenu (droite)
      ==================================================== */}
      <div className="dossier-layout">

        {/* ---------------- SIDEBAR : PROFIL CLIENT ---------------- */}
        <aside className="dossier-sidebar">

          <div className="sidebar-profile">
            <div className="client-avatar">
              <User size={32} />
            </div>
            <h1>{client.prenom} {client.nom}</h1>
            <span className="sidebar-cin">
              <Hash size={13} /> {client.cin || "-"}
            </span>
          </div>

          <ul className="sidebar-contact-list">
            <li>
              <Mail size={15} />
              <span>{client.email || "-"}</span>
            </li>
            <li>
              <Phone size={15} />
              <span>{client.telephone || "-"}</span>
            </li>
            <li>
              <MapPin size={15} />
              <span>{client.adresse || "-"}</span>
            </li>
            <li>
              <Calendar size={15} />
              <span>Né(e) le {formatDate(client.dateNaissance)}</span>
            </li>
            <li>
              <Calendar size={15} />
              <span>Client depuis le {formatDate(client.dateCreation)}</span>
            </li>
          </ul>

          <ul className="sidebar-stat-list">
            <li>
              <div className="stat-icon"><Wallet size={18} /></div>
              <span>Comptes</span>
              <strong>{comptes.length}</strong>
            </li>
            <li>
              <div className="stat-icon"><CircleDollarSign size={18} /></div>
              <span>Solde total</span>
              <strong>{formatMontant(dossier.soldeTotal)}</strong>
            </li>
            <li>
              <div className="stat-icon"><CreditCard size={18} /></div>
              <span>Cartes</span>
              <strong>{cartes.length}</strong>
            </li>
            <li>
              <div className="stat-icon"><ArrowLeftRight size={18} /></div>
              <span>Transactions</span>
              <strong>{transactions.length}</strong>
            </li>
            <li>
              <div className="stat-icon"><FileText size={18} /></div>
              <span>Crédits</span>
              <strong>{credits.length}</strong>
            </li>
          </ul>

        </aside>

        {/* ---------------- CONTENU PRINCIPAL ---------------- */}
        <div className="dossier-main">

          {/* ONGLETS */}
          <nav className="dossier-tabs" aria-label="Navigation des sections">
            <button
              className={activeTab === "comptes" ? "active" : ""}
              onClick={() => setActiveTab("comptes")}
            >
              <Wallet size={17} /> Comptes
            </button>
            <button
              className={activeTab === "cartes" ? "active" : ""}
              onClick={() => setActiveTab("cartes")}
            >
              <CreditCard size={17} /> Cartes
            </button>
            <button
              className={activeTab === "transactions" ? "active" : ""}
              onClick={() => setActiveTab("transactions")}
            >
              <ArrowLeftRight size={17} /> Transactions
            </button>
            <button
              className={activeTab === "credits" ? "active" : ""}
              onClick={() => setActiveTab("credits")}
            >
              <FileText size={17} /> Crédits
            </button>
          </nav>

          {/* CONTENU DES ONGLETS */}
          <main className="dossier-content">
            {/* COMPTES */}
            {activeTab === "comptes" && (
              <section>
                <div className="section-header">
                  <h2>Comptes bancaires</h2>
                  <p>Comptes détenus par ce client</p>
                </div>

                {comptes.length === 0 ? (
                  <div className="empty-state">
                    <Wallet size={35} />
                    <p>Aucun compte bancaire.</p>
                  </div>
                ) : (
                  <div className="accounts-grid">
                    {comptes.map((compte) => (
                      <div className="account-card" key={compte.id}>
                        <div className="account-card-header">
                          <div className="account-type-icon">
                            <Wallet size={21} />
                          </div>
                          <span className={`status-badge ${getStatutClass(compte.statut)}`}>
                            {compte.statut || "-"}
                          </span>
                        </div>

                        <h3>{compte.typeCompte || "Compte bancaire"}</h3>
                        <div className="account-number">{compte.numeroCompte || "-"}</div>

                        <div className="account-balance">
                          <span>Solde actuel</span>
                          <strong>{formatMontant(compte.solde)}</strong>
                        </div>

                        <div className="account-details">
                          <div>
                            <span>Code banque</span>
                            <strong>{compte.codeBanque || "-"}</strong>
                          </div>
                          <div>
                            <span>Code guichet</span>
                            <strong>{compte.codeGuichet || "-"}</strong>
                          </div>
                          <div>
                            <span>Clé RIB</span>
                            <strong>{compte.cleRib || "-"}</strong>
                          </div>
                          <div>
                            <span>IBAN</span>
                            <strong>{compte.iban || "-"}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* CARTES */}
            {activeTab === "cartes" && (
              <section>
                <div className="section-header">
                  <h2>Cartes bancaires</h2>
                  <p>Cartes associées aux comptes du client</p>
                </div>

                {cartes.length === 0 ? (
                  <div className="empty-state">
                    <CreditCard size={35} />
                    <p>Aucune carte bancaire.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {cartes.map((carte) => (
                      <div className="bank-card" key={carte.id}>
                        <div className="bank-card-top">
                          <span>ERP BANKING</span>
                          <CreditCard size={28} />
                        </div>
                        <div className="bank-card-number">
                          {carte.numeroCarte || "•••• •••• •••• ••••"}
                        </div>
                        <div className="bank-card-bottom">
                          <div>
                            <span>TYPE</span>
                            <strong>{carte.typeCarte || "-"}</strong>
                          </div>
                          <div>
                            <span>EXPIRATION</span>
                            <strong>{formatDate(carte.dateExpiration)}</strong>
                          </div>
                          <div>
                            <span>STATUT</span>
                            <strong>{carte.statut || "-"}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* TRANSACTIONS */}
            {activeTab === "transactions" && (
              <section>
                <div className="section-header">
                  <h2>Historique des transactions</h2>
                  <p>Toutes les opérations liées aux comptes du client</p>
                </div>

                {transactions.length === 0 ? (
                  <div className="empty-state">
                    <ArrowLeftRight size={35} />
                    <p>Aucune transaction.</p>
                  </div>
                ) : (
                  <div className="transactions-table-wrapper">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Référence</th>
                          <th>Compte source</th>
                          <th>Compte destination</th>
                          <th>Montant</th>
                          <th>Date</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>
                              <div className="transaction-type">
                                <span
                                  className={`transaction-icon ${getTransactionClass(
                                    transaction.type,
                                    transaction
                                  )}`}
                                >
                                  {getTransactionIcon(transaction.type)}
                                </span>
                                <strong>{transaction.type || "-"}</strong>
                              </div>
                            </td>
                            <td>{transaction.reference || "-"}</td>
                            <td>{transaction.numeroCompteSource || "-"}</td>
                            <td>{transaction.numeroCompteDestination || "-"}</td>
                            <td>
                              <strong
                                className={getTransactionClass(
                                  transaction.type,
                                  transaction
                                )}
                              >
                                {formatMontant(transaction.montant)}
                              </strong>
                            </td>
                            <td>{formatDate(transaction.dateTransaction)}</td>
                            <td>
                              <span
                                className={`status-badge ${getStatutClass(
                                  transaction.statut
                                )}`}
                              >
                                {transaction.statut || "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* CREDITS */}
            {activeTab === "credits" && (
              <section>
                <div className="section-header">
                  <h2>Crédits</h2>
                  <p>Demandes, offres et crédits du client</p>
                </div>

                {/* DEMANDES */}
                <div className="credit-subsection">
                  <h3>Demandes de crédit</h3>
                  {demandesCredit.length === 0 ? (
                    <div className="empty-state small">
                      <p>Aucune demande de crédit.</p>
                    </div>
                  ) : (
                    <div className="credit-list">
                      {demandesCredit.map((demande) => (
                        <div className="credit-item" key={demande.id}>
                          <div>
                            <strong>Demande #{demande.id}</strong>
                            <span>Montant demandé : {formatMontant(demande.montantDemande)}</span>
                            <span>Durée : {demande.duree || "-"} mois</span>
                            <span>Date : {formatDate(demande.dateDemande)}</span>
                          </div>
                          <span className={`status-badge ${getStatutClass(demande.statut)}`}>
                            {demande.statut || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* OFFRES */}
                <div className="credit-subsection">
                  <h3>Offres de crédit</h3>
                  {offresCredit.length === 0 ? (
                    <div className="empty-state small">
                      <p>Aucune offre de crédit.</p>
                    </div>
                  ) : (
                    <div className="credit-list">
                      {offresCredit.map((offre) => (
                        <div className="credit-item" key={offre.id}>
                          <div>
                            <strong>Offre {offre.numeroOffre || `#${offre.id}`}</strong>
                            <span>Montant proposé : {formatMontant(offre.montantPropose)}</span>
                            <span>Taux : {offre.taux || "-"} %</span>
                            <span>Durée : {offre.duree || "-"} mois</span>
                          </div>
                          <span className={`status-badge ${getStatutClass(offre.statut)}`}>
                            {offre.statut || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CREDITS ACCORDES */}
                <div className="credit-subsection">
                  <h3>Crédits accordés</h3>
                  {credits.length === 0 ? (
                    <div className="empty-state small">
                      <p>Aucun crédit accordé.</p>
                    </div>
                  ) : (
                    <div className="credit-list">
                      {credits.map((credit) => (
                        <div className="credit-item" key={credit.id}>
                          <div>
                            <strong>Crédit {credit.numeroCredit || `#${credit.id}`}</strong>
                            <span>Montant : {formatMontant(credit.montant)}</span>
                            <span>Mensualité : {formatMontant(credit.mensualite)}</span>
                            <span>Capital restant : {formatMontant(credit.capitalRestant)}</span>
                          </div>
                          <span className={`status-badge ${getStatutClass(credit.statut)}`}>
                            {credit.statut || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

export default ClientDossier;
