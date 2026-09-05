import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreditCard, Mail } from "lucide-react";

import compteService from "../../service/compteService";
import carteService from "../../service/carteService";

const CompteDetail = () => {

  const { id } = useParams();

  const [compte, setCompte] = useState(null);
  const [carte, setCarte] = useState(null);

  const [chargement, setChargement] = useState(true);
  const [creationCarte, setCreationCarte] = useState(false);

  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    chargerCompte();
    // eslint-disable-next-line react-hooks/immutability
    chargerCarte();
  }, [id]);


  const chargerCompte = async () => {
    try {
      const data = await compteService.getById(id);
      setCompte(data);
    } catch (error) {
      console.error(error);
      setErreur("Impossible de charger le compte.");
    } finally {
      setChargement(false);
    }
  };


  const chargerCarte = async () => {
    try {
      const data = await carteService.getByCompteId(id);
      setCarte(data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {

      // 404 = aucune carte pour ce compte
      setCarte(null);
    }
  };


  const creerCarte = async () => {

    setCreationCarte(true);
    setMessage("");
    setErreur("");

    try {

      const nouvelleCarte = await carteService.create({
        compteId: Number(id),
        typeCarte: "VISA"
      });

      setCarte(nouvelleCarte);

      setMessage(
        "Carte créée avec succès. Le code PIN a été envoyé par email au client."
      );

    } catch (error) {

      console.error(error);

      setErreur(
        error.response?.data?.message ||
        "Impossible de créer la carte."
      );

    } finally {
      setCreationCarte(false);
    }
  };


  if (chargement) {
    return <p>Chargement...</p>;
  }


  if (!compte) {
    return <p>Compte introuvable.</p>;
  }


  return (
    <div className="compte-detail">

      <h1>Détail du compte</h1>


      {/* Informations compte */}
      <div className="card">

        <h2>Informations du compte</h2>

        <p>
          <strong>Numéro :</strong>{" "}
          {compte.numeroCompte}
        </p>

        <p>
          <strong>IBAN :</strong>{" "}
          {compte.iban}
        </p>

        <p>
          <strong>Type :</strong>{" "}
          {compte.typeCompte}
        </p>

        <p>
          <strong>Solde :</strong>{" "}
          {compte.solde}
        </p>

        <p>
          <strong>Statut :</strong>{" "}
          {compte.statut}
        </p>

      </div>


      {/* Messages */}
      {message && (
        <div className="message-success">
          {message}
        </div>
      )}

      {erreur && (
        <div className="message-error">
          {erreur}
        </div>
      )}


      {/* Carte */}
      <div className="card">

        <div className="card-header">

          <h2>
            <CreditCard size={22} />
            Carte bancaire
          </h2>

        </div>


        {carte ? (

          <div className="carte-info">

            <p>
              <strong>Numéro de carte :</strong>{" "}
              {carte.numeroCarte}
            </p>

            <p>
              <strong>Type :</strong>{" "}
              {carte.typeCarte}
            </p>

            <p>
              <strong>Date d'expiration :</strong>{" "}
              {carte.dateExpiration}
            </p>

            <p>
              <strong>Statut :</strong>{" "}
              {carte.statut}
            </p>

            <div className="email-info">

              <Mail size={18} />

              Le PIN a été envoyé par email au client.

            </div>

          </div>

        ) : (

          <div>

            <p>
              Aucune carte n'est associée à ce compte.
            </p>

            <button
              className="btn-primary"
              onClick={creerCarte}
              disabled={creationCarte}
            >

              <CreditCard size={18} />

              {creationCarte
                ? "Création..."
                : "Créer une carte"}

            </button>

          </div>

        )}

      </div>

    </div>
  );
};

export default CompteDetail;