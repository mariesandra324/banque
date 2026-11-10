import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../service/authService";
import api from "../../service/api";
import "../../styles/login.css";

function BootstrapAdmin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [available, setAvailable] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    setupSecret: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/bootstrap/status")
      .then(({ data }) => setAvailable(data.available))
      .catch(() => {
        setAvailable(false);
        setError("Impossible de vérifier si l'initialisation est disponible.");
      });
  }, []);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.bootstrap(form);
      setUser({ email: data.email, role: data.role, codeGuichet: null });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail
        || requestError.response?.data?.message
        || "L'initialisation a échoué. Vérifiez le secret et les informations saisies."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-form-side" style={{ maxWidth: 520, margin: "auto" }}>
        <div className="login-form-head">
          <h1>Initialiser le super administrateur</h1>
          <p>Cette étape n'est disponible qu'une seule fois, lors de la première utilisation.</p>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}

        {available === null ? (
          <p className="login-help">Vérification de la disponibilité...</p>
        ) : !available ? (
          <p className="login-help">
            L'initialisation n'est pas disponible ou a déjà été effectuée.{" "}
            <Link to="/login">Retour à la connexion</Link>
          </p>
        ) : (
          <form onSubmit={submit}>
            {[
              ["nom", "Nom", "text"],
              ["prenom", "Prénom", "text"],
              ["email", "Adresse email", "email"],
              ["motDePasse", "Mot de passe (12 caractères minimum)", "password"],
              ["setupSecret", "Secret d'initialisation fourni par l'administrateur technique", "password"],
            ].map(([name, label, type]) => (
              <div className="login-field" key={name}>
                <label htmlFor={`bootstrap-${name}`}>{label}</label>
                <div className="login-input">
                  <input
                    id={`bootstrap-${name}`}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={update}
                    autoComplete={name === "motDePasse" || name === "setupSecret" ? "new-password" : name}
                    required
                    minLength={name === "motDePasse" ? 12 : undefined}
                  />
                </div>
              </div>
            ))}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Initialisation en cours..." : "Créer le super administrateur"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default BootstrapAdmin;
