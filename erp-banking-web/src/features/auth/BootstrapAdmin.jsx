import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../service/authService";
import "../../styles/login.css";

function BootstrapAdmin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [available, setAvailable] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    motDePasse: "",
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authService.getBootstrapStatus()
      .then((data) => setAvailable(data.available))
      .catch(() => {
        setAvailable(false);
        setError("Impossible de vérifier si l'initialisation est disponible.");
      });
  }, []);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const start = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await authService.startBootstrap(form);
      setMessage(data.message);
      setStep(2);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.verifyBootstrap({ ...form, code });
      setUser({ email: data.email, role: data.role, codeGuichet: null });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-form-side" style={{ maxWidth: 520, margin: "auto" }}>
        <div className="login-form-head">
          <h1>Première utilisation</h1>
          <p>Créer le super administrateur et confirmer son adresse e-mail.</p>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {message && <div className="login-success" role="status">{message}</div>}

        {available === null ? (
          <p className="login-help">Vérification de la disponibilité...</p>
        ) : !available ? (
          <p className="login-help">
            L'initialisation a déjà été effectuée.{" "}
            <Link to="/login">Retour à la connexion</Link>
          </p>
        ) : step === 1 ? (
          <form onSubmit={start}>
            {[
              ["nom", "Nom", "text"],
              ["prenom", "Prénom", "text"],
              ["email", "Adresse email", "email"],
              ["telephone", "Téléphone", "tel"],
              ["motDePasse", "Mot de passe (12 caractères minimum)", "password"],
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
                    autoComplete={name === "motDePasse" ? "new-password" : name}
                    required={name !== "telephone"}
                    minLength={name === "motDePasse" ? 12 : undefined}
                  />
                </div>
              </div>
            ))}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Envoi du code..." : "Recevoir le code de confirmation"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <div className="login-field">
              <label htmlFor="bootstrap-code">Code reçu par e-mail</label>
              <div className="login-input">
                <input
                  id="bootstrap-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  autoFocus
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={loading || code.length !== 6}>
              {loading ? "Confirmation..." : "Confirmer et créer le compte"}
            </button>
            <button type="button" className="login-back" onClick={() => setStep(1)}>
              Modifier les informations
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default BootstrapAdmin;
