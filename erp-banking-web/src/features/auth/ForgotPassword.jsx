import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, Eye, EyeOff, Landmark, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import "../../styles/login.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
    const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState("");
    const [message, setMessage] = useState("");

    const handleSendCode = async (e) => {
        e.preventDefault();
        setErreur("");
        setMessage("");
        setLoading(true);
        try {
            const response = await api.post("/auth/mobile/forgot-password", { email });
            setMessage(response.data?.message || "Un code de vérification a été envoyé à votre adresse e-mail.");
            setStep(2);
        } catch (error) {
            setErreur(error?.response?.data?.message || "Impossible d'envoyer le code. Vérifiez votre adresse e-mail.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErreur("");
        setMessage("");
        setLoading(true);
        try {
            await api.post("/auth/mobile/verify-otp", { email, code });
            setMessage("Code vérifié avec succès.");
            setStep(3);
        } catch (error) {
            setErreur(error?.response?.data?.message || "Code invalide ou expiré.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErreur("");
        setMessage("");
        if (nouveauMotDePasse !== confirmationMotDePasse) {
            setErreur("Les deux mots de passe ne correspondent pas.");
            return;
        }
        if (nouveauMotDePasse.length < 6) {
            setErreur("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post("/auth/mobile/reset-password", { email, code, nouveauMotDePasse, confirmationMotDePasse });
            setMessage(response.data?.message || "Mot de passe réinitialisé avec succès.");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            setErreur(error?.response?.data?.message || "Impossible de réinitialiser le mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => (step === 1 ? "Mot de passe oublié" : step === 2 ? "Vérification du code" : "Nouveau mot de passe");
    const getSubtitle = () => (step === 1 ? "Saisissez votre adresse e-mail pour recevoir un code de vérification" : step === 2 ? "Saisissez le code à 6 chiffres reçu par e-mail" : "Créez et confirmez votre nouveau mot de passe");

    return (
        <div className="login-page">
            <span className="login-blob login-blob--one" />
            <span className="login-blob login-blob--two" />
            <div className="login-shell">
                <aside className="login-side">
                    <div className="login-brand">
                        <span className="login-logo"><Landmark size={26} /></span>
                        <div>
                            <p className="login-logo-name">ERP Banking</p>
                            <p className="login-logo-tag">Plateforme de gestion bancaire</p>
                        </div>
                    </div>
                    <div className="login-hero">
                        <h2>Récupération de mot de passe</h2>
                        <p>Un code de vérification vous sera envoyé par e-mail pour sécuriser la réinitialisation de votre mot de passe.</p>
                    </div>
                    <p className="login-side-foot">© {new Date().getFullYear()} ERP Banking — Tous droits réservés</p>
                </aside>
                <main className="login-form-side">
                    <div className="login-form-head">
                        <h1>{getTitle()}</h1>
                        <p>{getSubtitle()}</p>
                    </div>
                    {erreur && (<div className="login-error" role="alert"><AlertCircle size={16} /><span>{erreur}</span></div>)}
                    {message && !erreur && (<div className="login-success" role="status"><CheckCircle2 size={16} /><span>{message}</span></div>)}

                    {step === 1 && (
                        <form onSubmit={handleSendCode} noValidate>
                            <div className="login-field">
                                <label htmlFor="forgot-email">Adresse email</label>
                                <div className="login-input">
                                    <Mail size={18} />
                                    <input id="forgot-email" type="email" placeholder="prenom.nom@banque.mg" value={email} onChange={(e) => { setEmail(e.target.value); setErreur(""); setMessage(""); }} autoComplete="email" autoFocus required />
                                </div>
                            </div>
                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? (<><Loader2 size={18} className="login-spinner" />Envoi en cours...</>) : (<><span>Envoyer le code</span><KeyRound size={18} /></>)}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} noValidate>
                            <div className="login-field">
                                <label htmlFor="forgot-code">Code de vérification (6 chiffres)</label>
                                <div className="login-input">
                                    <KeyRound size={18} />
                                    <input id="forgot-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="123456" value={code} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6); setCode(v); setErreur(""); setMessage(""); }} autoFocus required />
                                </div>
                            </div>
                            <button type="submit" className="login-btn" disabled={loading || code.length !== 6}>
                                {loading ? (<><Loader2 size={18} className="login-spinner" />Vérification...</>) : (<><span>Vérifier le code</span><CheckCircle2 size={18} /></>)}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} noValidate>
                            <div className="login-field">
                                <label htmlFor="forgot-new">Nouveau mot de passe</label>
                                <div className="login-input">
                                    <Lock size={18} />
                                    <input id="forgot-new" type={showPassword ? "text" : "password"} placeholder="Minimum 6 caractères" value={nouveauMotDePasse} onChange={(e) => { setNouveauMotDePasse(e.target.value); setErreur(""); setMessage(""); }} autoComplete="new-password" required />
                                    <button type="button" className="login-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                            </div>
                            <div className="login-field">
                                <label htmlFor="forgot-confirm">Confirmer le mot de passe</label>
                                <div className="login-input">
                                    <Lock size={18} />
                                    <input id="forgot-confirm" type={showConfirm ? "text" : "password"} placeholder="Confirmer votre mot de passe" value={confirmationMotDePasse} onChange={(e) => { setConfirmationMotDePasse(e.target.value); setErreur(""); setMessage(""); }} autoComplete="new-password" required />
                                    <button type="button" className="login-toggle" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                            </div>
                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? (<><Loader2 size={18} className="login-spinner" />Réinitialisation...</>) : (<><span>Réinitialiser le mot de passe</span><CheckCircle2 size={18} /></>)}
                            </button>
                        </form>
                    )}

                    <button type="button" className="login-back" onClick={() => navigate("/login")}><ArrowLeft size={16} />Retour à la connexion</button>
                </main>
            </div>
        </div>
    );
}

export default ForgotPassword;
