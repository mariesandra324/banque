import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../../styles/offres-credit.css";
import offreCreditService from "../../service/offreCreditService";

const formatMontant = (montant) => {
    if (montant === null || montant === undefined) return "-";
    return new Intl.NumberFormat("fr-FR").format(montant) + " Ar";
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("fr-FR");
};

// Documents génériquement demandés pour un dossier de crédit.
// Si l'offre renvoie sa propre liste (offre.documentsRequis), elle est utilisée à la place.
const DOCUMENTS_PAR_DEFAUT = [
    "Pièce d'identité",
    "Justificatif de domicile",
    "Justificatifs de revenus",
    "Contrat de travail",
    "Relevés de compte",
    "Documents relatifs au projet financé",
];

function OffreCreditDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [offre, setOffre] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [traitement, setTraitement] = useState(false);
    const [telechargement, setTelechargement] = useState(false);
    const offreA4Ref = useRef(null);

    const charger = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const data = await offreCreditService.getById(id);
            setOffre(data);
        } catch (err) {
            console.error("Erreur chargement offre :", err.response?.data || err.message);
            setErreur(err.response?.data?.message || "Impossible de charger l'offre de crédit.");
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        charger();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleTelecharger = async () => {
        if (!offreA4Ref.current) return;

        setTelechargement(true);
        try {
            const canvas = await html2canvas(offreA4Ref.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            let imgWidth = pageWidth;
            let imgHeight = (canvas.height * imgWidth) / canvas.width;

            // On force le rendu sur une seule page : si l'aperçu est plus
            // haut qu'une page A4, on réduit l'image proportionnellement
            // pour qu'elle tienne entièrement dessus.
            if (imgHeight > pageHeight) {
                const ratio = pageHeight / imgHeight;
                imgHeight = pageHeight;
                imgWidth = imgWidth * ratio;
            }

            const x = (pageWidth - imgWidth) / 2;
            const y = 0;

            pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

            const nomFichier = `Offre-credit-${offre.numeroOffre || offre.id}.pdf`;
            pdf.save(nomFichier);
        } catch (err) {
            console.error("Erreur génération PDF :", err);
            alert("Impossible de générer le fichier PDF de l'offre.");
        } finally {
            setTelechargement(false);
        }
    };

    const handleAccepter = async () => {
        const confirmation = window.confirm("Voulez-vous vraiment accepter cette offre de crédit ?");
        if (!confirmation) return;

        setTraitement(true);
        try {
            await offreCreditService.accepter(id);
            alert("L'offre a été acceptée. Le crédit a été créé avec succès.");
            navigate("/credits");
        } catch (err) {
            console.error("Erreur acceptation offre :", err.response?.data || err.message);
            alert(err.response?.data?.message || "Impossible d'accepter cette offre.");
        } finally {
            setTraitement(false);
        }
    };

    const handleRefuser = async () => {
        const confirmation = window.confirm("Voulez-vous vraiment refuser cette offre de crédit ?");
        if (!confirmation) return;

        setTraitement(true);
        try {
            await offreCreditService.updateStatut(id, "REFUSEE");
            alert("L'offre de crédit a été refusée.");
            navigate("/credits");
        } catch (err) {
            console.error("Erreur refus offre :", err.response?.data || err.message);
            alert(err.response?.data?.message || "Impossible de refuser cette offre.");
        } finally {
            setTraitement(false);
        }
    };

    if (chargement) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                Chargement...
            </div>
        );
    }

    if (erreur || !offre) {
        return (
            <div style={{ padding: "24px" }}>
                <div style={{
                    padding: "12px 16px", backgroundColor: "#fee2e2", color: "#991b1b",
                    borderRadius: "8px", fontSize: "13px",
                }}>
                    {erreur || "Offre introuvable."}
                </div>
            </div>
        );
    }

    const offreEnAttente = (offre.statut || "").toUpperCase() === "EN_ATTENTE";

    // Calcul du coût du crédit à partir des données de l'offre
    const montantTotal =
        offre.mensualite && offre.duree
            ? offre.mensualite * offre.duree
            : offre.montantPropose;

    const montantInterets =
        montantTotal && offre.montantPropose
            ? montantTotal - offre.montantPropose
            : null;

    const documents = Array.isArray(offre.documentsRequis) && offre.documentsRequis.length > 0
        ? offre.documentsRequis
        : DOCUMENTS_PAR_DEFAUT;

    const getMessageStatut = () => {
        switch ((offre.statut || "").toUpperCase()) {
            case "EN_ATTENTE":
                return "⏳ Cette offre est en attente de réponse du client.";

            case "ACCEPTEE":
                return "✓ Cette offre a déjà été acceptée par le client.";

            case "REFUSEE":
                return "✕ Cette offre a été refusée par le client.";

            case "EXPIREE":
                return "⌛ Cette offre a expiré.";

            default:
                return "";
        }
    };
    return (
    <div className="offre-detail-page">

        {/* ===================== BARRE DU HAUT ===================== */}
        <div className="offre-toolbar">
            <button
                onClick={() => navigate(-1)}
                className="btn-retour"
            >
                <ArrowLeft size={16} />
                Retour
            </button>

            <div className="toolbar-actions">
                {offreEnAttente && (
                    <>
                        <button
                            onClick={handleAccepter}
                            disabled={traitement}
                            className="btn-accepter"
                        >
                            <Check size={16} />
                            {traitement ? "Traitement..." : "Accepter l'offre"}
                        </button>

                        <button
                            onClick={handleRefuser}
                            disabled={traitement}
                            className="btn-refuser"
                        >
                            <X size={16} />
                            Refuser
                        </button>
                    </>
                )}
            </div>
        </div>
        
        <div className={`offre-statut-message statut-${(offre.statut || "").toLowerCase()}`}>
            {getMessageStatut()}
        </div>

        {/* ===================== CONTENU PRINCIPAL ===================== */}
        <div className="offre-detail-layout">

            {/* ===================== APERCU A4 ===================== */}
            <div className="offre-preview-panel">

                <div className="preview-title">
                    <div>
                        <strong>Aperçu de l'offre</strong>
                        <span>Format A4</span>
                    </div>

                    <button
                        onClick={handleTelecharger}
                        disabled={telechargement}
                        className="preview-print-btn"
                    >
                        <Download size={15} />
                        {telechargement ? "..." : "PDF"}
                    </button>
                </div>


                {/* ===================== FEUILLE A4 ===================== */}
                <div className="offre-a4" ref={offreA4Ref}>

                    {/* HEADER */}
                    <div className="offre-a4-header">

                        <div className="offre-a4-titre">

                            <div className="banque-logo">
                                <FileText size={25} />
                            </div>

                            <div>
                                <h1>
                                    OFFRE DE CRÉDIT
                                </h1>

                                <p>
                                    Banque ERP Banking
                                </p>
                            </div>

                        </div>


                        <div className="offre-a4-ref">

                            <p>
                                <strong>
                                    Référence :
                                </strong>{" "}
                                {offre.numeroOffre ||
                                    `#${offre.id}`
                                }
                            </p>

                            <p>
                                <strong>
                                    Date :
                                </strong>{" "}
                                {formatDate(offre.dateOffre)}
                            </p>

                        </div>

                    </div>


                    {/* CLIENT */}
                    <section className="offre-a4-section">
                        <h2> 1. Informations sur l'emprunteur</h2>
                        <div className="a4-info-grid">
                            <p>
                                <strong>Client :</strong>{" "}
                                {offre.clientNom
                                    ? `${offre.clientNom} ${offre.clientPrenom || ""}`.trim()
                                    : `Client #${offre.clientId}`
                                }
                            </p>
                            <p>
                                <strong>Numéro client :</strong>{" "}
                                {offre.clientId ?? "-"}
                            </p>
                            <p>
                                <strong>Profession :</strong>{" "}
                                {offre.demandeProfession || "-"}
                            </p>
                            <p>
                                <strong>Type de contrat :</strong>{" "}
                                {offre.demandeTypeContrat || "-"}
                            </p>
                        </div>
                    </section>
                    {/* CONDITIONS CREDIT */}
                    <section className="offre-a4-section">
                        <h2>2. Conditions du crédit</h2>
                        <table className="offre-a4-table">
                            <thead>
                                <tr>
                                    <th>Élément</th>
                                    <th>Détail</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Montant du crédit</td>
                                    <td>{formatMontant( offre.montantPropose)}</td>
                                </tr>
                                <tr>
                                    <td>Durée</td>
                                    <td>{offre.duree ? `${offre.duree} mois` : "-"}   </td>
                                </tr>
                                <tr>
                                    <td>Taux d'intérêt annuel</td>
                                    <td>
                                        {offre.tauxInteret
                                            ? `${offre.tauxInteret} %`
                                            : "-"
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td>Mensualité</td>
                                    <td>
                                        {formatMontant(
                                            offre.mensualite
                                        )}
                                    </td>
                                </tr>

                                {/* <tr>
                                    <td>Date de début</td>
                                    <td> {offre.statut?.toUpperCase() === "ACCEPTEE"
                                        ? formatDate(offre.dateDebut)
                                        : formatDate(offre.dateExpiration)}
                                    </td>
                                </tr> */}
                                <tr>
                                    <td>Nombre de mensualités</td>
                                    <td> {offre.duree ?? "-"} </td>
                                </tr>
                                <tr>
                                    <td>Objet du crédit</td>
                                    <td>{offre.demandeMotif ?? "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                    {/* COUT */}
                    <section className="offre-a4-section">
                        <h2>3. Coût du crédit</h2>
                        <div className="a4-cost-box">
                            <div>
                                <span>Montant emprunté</span>
                                <strong>
                                    {formatMontant(
                                        offre.montantPropose
                                    )}
                                </strong>
                            </div>
                            <div>
                                <span>Intérêts estimés</span>
                                <strong>
                                    {montantInterets !== null
                                        ? formatMontant(
                                            montantInterets
                                        )
                                        : "-"
                                    }
                                </strong>
                            </div>
                            <div>
                                <span>Total à rembourser</span>
                                <strong>
                                    {montantTotal
                                        ? formatMontant(
                                            montantTotal
                                        )
                                        : "-"
                                    }
                                </strong>
                            </div>
                        </div>
                        <p className="offre-a4-note">
                            Les montants indiqués sont calculésautomatiquement par le système selon les conditions du crédit.
                        </p>
                    </section>
                    {/* CONDITIONS */}
                    <section className="offre-a4-section">
                        <h2>4. Conditions</h2>
                        <p>
                            {offre.conditions ||
                                "Selon les conditions générales de l'offre."
                            }
                        </p>
                    </section>
                    {/* DOCUMENTS */}
                    <section className="offre-a4-section">
                        <h2> 5. Documents requis</h2>

                        <ul className="a4-documents-list">

                            {documents.map((doc) => (
                                <li key={doc}>
                                    {doc}
                                </li>
                            ))}
                        </ul>
                    </section>
                    {/* DECISION */}
                    <section className="offre-a4-section">
                        <h2> 6. Décision du client</h2>
                        <p>
                            Après avoir pris connaissance des
                            conditions de la présente offre, le
                            client peut choisir :
                        </p>
                        <div className="a4-decision">
                            <div>☐
                                <span>Accepter l'offre</span>
                            </div>
                            <div> ☐
                                <span>Refuser l'offre</span>
                            </div>
                        </div>
                    </section>
                    {/* SIGNATURES */}
                    <section className="offre-a4-signatures">
                        <div>
                            <p>
                                <strong> Signature du client</strong>
                            </p>
                            <div className="offre-a4-signature-ligne"></div>
                            <p>Date : ___ / ___ / ______</p>
                        </div>
                        <div>
                            <p>
                                <strong> Signature de la banque</strong>
                            </p>
                            <div className="offre-a4-signature-ligne"></div>
                            <p>
                                Date : ___ / ___ / ______
                            </p>
                        </div>
                    </section>
                    {/* FOOTER */}
                    <div className="offre-a4-footer">
                        <span>Banque ERP Banking</span>
                        <span>Offre de crédit —{" "}{offre.numeroOffre || `#${offre.id}`}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

export default OffreCreditDetail;
