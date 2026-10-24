import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Landmark,
    ShieldCheck,
    Users,
    TrendingUp,
    AlertCircle,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/login.css";

const AVANTAGES = [
    {
        icon: ShieldCheck,
         titre: "Accès sécurisé et tracé",
        // texte: "Chaque opération effectuée est journalisée dans l'audit.",
    },
    {
        icon: Users,
         titre: "Clients, comptes & crédits",
        // texte: "Pilotez l'ensemble du portefeuille depuis un seul écran.",
    },
    {
        icon: TrendingUp,
        titre: "Reporting en temps réel",
        // texte: "Tableaux de bord et indicateurs toujours à jour.",
    },
];

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

            {/* Décor */}
            <span className="login-blob login-blob--one" />
            <span className="login-blob login-blob--two" />

            <div className="login-shell">

                {/* ===== Colonne présentation ===== */}
                <aside className="login-side">

                    <div className="login-brand">

                        <span className="login-logo">
                            <Landmark size={26} />
                        </span>

                        <div>
                            <p className="login-logo-name">ERP Banking</p>
                            <p className="login-logo-tag">Plateforme de gestion bancaire</p>
                        </div>

                    </div>

                    <div className="login-hero">
                        <h2>Toute votre banque, en un seul écran</h2>
                        <p>
                            Comptes, crédits, clients et comptabilité : un espace unique,
                            sécurisé et pensé pour les équipes de guichet.
                        </p>
                    </div>

                    <ul className="login-features">
                        {AVANTAGES.map(({ icon: Icone, titre, texte }) => (
                            <li className="login-feature" key={titre}>
                                <span className="login-feature-icon">
                                    <Icone size={17} />
                                </span>
                                <div>
                                    <p className="login-feature-title">{titre}</p>
                                    <p className="login-feature-text">{texte}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p className="login-side-foot">
                        © {new Date().getFullYear()} ERP Banking — Tous droits réservés
                    </p>

                </aside>

                {/* ===== Colonne formulaire ===== */}
                <main className="login-form-side">

                    <div className="login-form-head">
                        <h1>Connexion</h1>
                        <p>Accédez à votre espace sécurisé</p>
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
                                    placeholder="prenom.nom@banque.mg"
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
                                    placeholder="••••••••"
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
                                Connexion en cours...
                            </>
                        ) : (
                            <>
                                Se connecter
                                <ArrowRight size={18} />
                            </>
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
