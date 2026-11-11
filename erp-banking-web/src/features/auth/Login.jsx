import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Mail,Lock,Eye,EyeOff, AlertCircle,Loader2,} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import loginImage from "../../assets/login-baobabs.png";
import logo from "../../assets/isalosys-logo-transparent.png";
import "../../styles/login.css";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        setErreur("");
        setLoading(true);

        try {

            await login({
                email,
                motDePasse
            });

            navigate("/dashboard");

        } catch (error) {

            // On affiche le message renvoyé par l'API s'il existe,
            // sinon on retombe sur le message générique.
            setErreur(
                error?.response?.data?.message || "Email ou mot de passe incorrect."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-page">

            <div className="login-shell">

                {/* ===== Colonne image ===== */}
                <aside
                    className="login-side"
                    style={{ "--login-image": `url(${loginImage})` }}
                >

                    <div className="login-brand">

                        <div className="login-brand-content">

                            <div className="login-brand-icon">
                                <img
                                    src={logo}
                                    alt="Logo ISALOSYS"
                                    className="login-logo-img"
                                />
                            </div>

                            {/* Séparateur vertical */}
                            <div className="login-brand-separator"></div>

                            {/* Nom et description */}
                            <div className="login-brand-text">
                                <h1>Isalosys Bank</h1>
                                <p>Plateforme de gestion bancaire</p>
                            </div>

                            {/* Badge */}
                            <span className="login-bank-badge">Bank</span>

                        </div>

                    </div>


                    <div className="login-hero">
                        <h2>Chaque opération, claire et tracée.</h2>
                        <p>
                            Comptes, crédits, clients et comptabilité réunis dans un espace
                            de travail pensé pour les équipes de guichet.
                        </p>
                    </div>

                    <p className="login-side-foot">
                        © {new Date().getFullYear()} ISALOSYS Banking. Tous droits réservés.
                    </p>

                </aside>

                {/* ===== Colonne formulaire ===== */}
                <main className="login-form-side">

                    <div className="login-form-head">
                        <h1>Connexion</h1>
                        <p>Accédez à votre espace sécurisé.</p>
                    </div>

                    {erreur && (
                        <div className="login-error" role="alert">
                            <AlertCircle size={16} />
                            <span>{erreur}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} noValidate>

                        <div className="login-field">
                            <label htmlFor="login-email">Adresse email</label>
                            <div className="login-input">
                                <Mail size={18} />
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="prenom.nom@isalosys.mg"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErreur("");
                                    }}
                                    autoComplete="email"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-motdepasse">Mot de passe</label>
                            <div className="login-input">
                                <Lock size={18} />
                                <input
                                    id="login-motdepasse"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Votre mot de passe"
                                    value={motDePasse}
                                    onChange={(e) => {
                                        setMotDePasse(e.target.value);
                                        setErreur("");
                                    }}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="login-spinner" />
                                    Connexion en cours
                                </>
                            ) : (
                                "Se connecter"
                            )}
                        </button>

                        <div className="login-forgot">
                            <button type="button" onClick={() => navigate("/mot-de-passe-oublie")}>
                                Mot de passe oublié ?
                            </button>
                        </div>

                    </form>

                    <p className="login-help">
                        Accès réservé au personnel autorisé. En cas d'oubli de mot de passe,
                        contactez votre administrateur.
                    </p>

                </main>

            </div>

        </div>

    );

}

export default Login;
