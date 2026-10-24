import { useEffect, useState } from "react";
import {
  User,
  Palette,
  Bell,
  Lock,
  Globe,
  ChevronRight,
  Mail,
  Smartphone,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  Pencil,
  X,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme";
import notificationService from "../../service/notificationService";
import authService from "../../service/authService";
import ChangePasswordForm from "./ChangePasswordForm";
import "../../styles/settings.css";
import { useAuth } from "../../hooks/useAuth";

const Settings = () => {
  const [section, setSection] = useState("profil");
  const { theme, setTheme } = useTheme();

  const menu = [
    {
      id: "profil",
      label: "Mon profil",
      icon: User,
    },
    {
      id: "apparence",
      label: "Apparence",
      icon: Palette,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "securite",
      label: "Sécurité",
      icon: Lock,
    },
    {
      id: "langue",
      label: "Langue",
      icon: Globe,
    },
  ];

  return (
    <div className="settings-page">

      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">Compte & préférences</span>
          <h1>Paramètres</h1>
          <p>
            Gérez votre profil, l'apparence et la sécurité de votre compte.
          </p>
        </div>

        <span className="settings-header-badge">
          <ShieldCheck size={15} />
          Espace sécurisé
        </span>
      </div>

      <div className="settings-container">

        {/* MENU GAUCHE */}
        <aside className="settings-menu">

          <div className="settings-menu-title">Réglages</div>

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`settings-menu-item ${
                  section === item.id ? "active" : ""
                }`}
                onClick={() => setSection(item.id)}
              >
                <Icon size={18} />

                <span>{item.label}</span>

                <ChevronRight
                  size={16}
                  className="settings-arrow"
                />
              </button>
            );
          })}

        </aside>

        {/* CONTENU */}
        <section className="settings-content">
          <div className="settings-enter" key={section}>

            {section === "profil" && (
              <Profil />
            )}

            {section === "apparence" && (
              <Apparence
                theme={theme}
                setTheme={setTheme}
              />
            )}

            {section === "notifications" && (
              <Notifications />
            )}

            {section === "securite" && (
              <Securite />
            )}

            {section === "langue" && (
              <Langue />
            )}

          </div>
        </section>
      </div>
    </div>
  );
};


/* =========================
   PROFIL
========================= */

const Profil = () => {
  const { user, setUser } = useAuth();
  const [modeEdition, setModeEdition] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  if (!user) {
    return (
      <div className="profile-loading">
        Chargement du profil...
      </div>
    );
  }

  // On récupère les informations disponibles
  const nom = user.nom || "";
  const prenom = user.prenom || "";
  const email = user.email || "";
  const role = user.role || "";

  // Initiales pour l'avatar
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

  const debutEdition = () => {
    setForm({ nom, prenom });
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");
    setModeEdition(true);
  };

  const annulerEdition = () => {
    setModeEdition(false);
    setFieldErrors({});
    setSubmitError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const valider = () => {
    const errors = {};
    if (!form.nom.trim()) errors.nom = "Le nom est obligatoire.";
    if (!form.prenom.trim()) errors.prenom = "Le prénom est obligatoire.";
    return errors;
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    const errors = valider();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setSubmitError("");
    try {
      const data = await authService.updateProfil({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
      });
      setUser((prev) => ({ ...prev, nom: data.nom, prenom: data.prenom }));
      setModeEdition(false);
      setSuccessMessage("Profil modifié avec succès.");
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Impossible de modifier le profil."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="settings-section-header">
        <div className="settings-icon">
          <User size={22} />
        </div>

        <div>
          <h2>Mon profil</h2>
          <p>
            Consultez et mettez à jour les informations de votre compte
          </p>
        </div>
      </div>

      {/* =========================
          BANNIÈRE
      ========================== */}

      <div className="profile-banner">

        <div className="profile-avatar">
          {initiales || "U"}
        </div>

        <div className="profile-info">
          <h3>
            {prenom} {nom}
          </h3>

          {role && (
            <span className="profile-role">{role}</span>
          )}

          <p className="profile-email">
            <Mail size={13} />
            {email || "—"}
          </p>
        </div>

      </div>


      {/* =========================
          INFORMATIONS
      ========================== */}

      <div className="form-grid">

        <div className="form-group">
          <label>Nom</label>

          <input
            type="text"
            name="nom"
            value={modeEdition ? form.nom : nom}
            onChange={handleChange}
            readOnly={!modeEdition}
          />
          {modeEdition && fieldErrors.nom && (
            <div className="field-error">{fieldErrors.nom}</div>
          )}
        </div>


        <div className="form-group">
          <label>Prénom</label>

          <input
            type="text"
            name="prenom"
            value={modeEdition ? form.prenom : prenom}
            onChange={handleChange}
            readOnly={!modeEdition}
          />
          {modeEdition && fieldErrors.prenom && (
            <div className="field-error">{fieldErrors.prenom}</div>
          )}
        </div>


        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            readOnly
          />
        </div>


        <div className="form-group">
          <label>Rôle</label>

          <input
            type="text"
            value={role}
            readOnly
          />
        </div>

      </div>

      {successMessage && (
        <div className="alert alert-success">
          <Check size={15} />
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="alert alert-error">
          <X size={15} />
          {submitError}
        </div>
      )}

      {modeEdition ? (
        <div className="settings-actions">
          <button className="btn-primary" onClick={enregistrer} disabled={loading}>
            <Check size={15} />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>

          <button
            type="button"
            className="btn-primary btn-ghost"
            onClick={annulerEdition}
            disabled={loading}
          >
            <X size={15} />
            Annuler
          </button>
        </div>
      ) : (
        <button className="btn-primary" onClick={debutEdition}>
          <Pencil size={15} />
          Modifier le profil
        </button>
      )}

    </div>
  );
};


/* =========================
   APPARENCE
========================= */

const Apparence = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="appearance-settings">

      <div className="settings-section-header">
        <div className="settings-icon">
          <Palette size={22} />
        </div>

        <div>
          <h2>Apparence</h2>
          <p>
            Choisissez le mode d'affichage de l'application
          </p>
        </div>
      </div>

      <div className="theme-options">

        <button
          className={`theme-option ${
            theme === "light" ? "selected" : ""
          }`}
          onClick={() => setTheme("light")}
        >
          <div className="theme-preview theme-preview-light">
            <span className="tp-bar" />
            <span className="tp-line" />
            <span className="tp-line tp-short" />
          </div>

          <div className="theme-option-row">
            <div className="theme-option-text">
              <strong>
                <Sun size={15} />
                Mode clair
              </strong>
              <span>Interface lumineuse</span>
            </div>

            <span className="theme-radio">
              {theme === "light" && <Check size={11} />}
            </span>
          </div>
        </button>


        <button
          className={`theme-option ${
            theme === "dark" ? "selected" : ""
          }`}
          onClick={() => setTheme("dark")}
        >
          <div className="theme-preview theme-preview-dark">
            <span className="tp-bar" />
            <span className="tp-line" />
            <span className="tp-line tp-short" />
          </div>

          <div className="theme-option-row">
            <div className="theme-option-text">
              <strong>
                <Moon size={15} />
                Mode sombre
              </strong>
              <span>Repos visuel</span>
            </div>

            <span className="theme-radio">
              {theme === "dark" && <Check size={11} />}
            </span>
          </div>
        </button>

      </div>

    </div>
  );
};


/* =========================
   NOTIFICATIONS
========================= */

const ROLE_LABELS = {
  ADMIN: "Administration",
  AGENT: "Agents",
  GESTIONNAIRE: "Gestionnaires crédit",
  COMPTABLE: "Comptable",
  CLIENT: "Clients",
};

const ROLE_ORDER = [
  "ADMIN",
  "AGENT",
  "GESTIONNAIRE",
  "COMPTABLE",
  "CLIENT",
];

const Switch = ({ on, onClick }) => (
  <button
    className={`switch ${on ? "on" : ""}`}
    onClick={onClick}
    aria-pressed={on}
  >
    <span />
  </button>
);

const Notifications = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ligneSauvee, setLigneSauvee] = useState(null);

  useEffect(() => {
    if (!ligneSauvee) return undefined;

    const timer = setTimeout(() => setLigneSauvee(null), 5000);
    return () => clearTimeout(timer);
  }, [ligneSauvee]);

  useEffect(() => {
    let active = true;

    notificationService
      .getPreferences()
      .then((data) => {
        if (active) setPreferences(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggle = (type, field, value) => {
    const next = preferences.map((p) =>
      p.type === type ? { ...p, [field]: value } : p
    );
    setPreferences(next);
    setLigneSauvee(type);
    notificationService.savePreferences(next).catch(() => {});
  };

  const groups = ROLE_ORDER.map((role) => ({
    role,
    label: ROLE_LABELS[role] || role,
    items: preferences.filter((p) => p.roleCible === role),
  })).filter((group) => group.items.length > 0);

  return (
    <div>
      <div className="settings-section-header">
        <div className="settings-icon">
          <Bell size={22} />
        </div>

        <div>
          <h2>Notifications</h2>
          <p>
            Choisissez comment vous souhaitez être notifié :
            email et/ou notification mobile
          </p>
        </div>
      </div>

      {loading ? (
        <p className="profile-loading">Chargement des préférences…</p>
      ) : (
        groups.map((group) => (
          <div key={group.role} className="notification-group">
            <h3 className="notification-group-title">{group.label}</h3>

            {group.items.map((pref) => (
              <div
                key={pref.type}
                className={`setting-row ${ligneSauvee === pref.type ? "setting-row-saved" : ""}`}
                style={ligneSauvee === pref.type ? { backgroundColor: 'rgba(34,197,94,0.16)' } : undefined}
              >
                <div className="setting-row-text">
                  <strong>
                    {pref.emoji && (
                      <span className="notification-emoji">{pref.emoji}</span>
                    )}
                    {pref.libelle}
                  </strong>
                  <p>
                    Notifier lorsque ce type d'événement se produit
                  </p>
                </div>

                <div className="notification-toggles">
                  <label className="notification-toggle">
                    <Mail size={14} />
                    Email
                    <Switch
                      on={pref.emailActive}
                      onClick={() =>
                        toggle(pref.type, "emailActive", !pref.emailActive)
                      }
                    />
                  </label>

                  <label className="notification-toggle">
                    <Smartphone size={14} />
                    Push
                    <Switch
                      on={pref.pushActive}
                      onClick={() =>
                        toggle(pref.type, "pushActive", !pref.pushActive)
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};


/* =========================
   SECURITE
========================= */

const Securite = () => {
  const [modeEdition, setModeEdition] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div>

      <div className="settings-section-header">

        <div className="settings-icon">
          <Lock size={22} />
        </div>

        <div>
          <h2>Sécurité</h2>
          <p>
            Gérez la sécurité de votre compte
          </p>
        </div>

      </div>

      {successMessage && (
        <div className="alert alert-success">
          <Check size={15} />
          {successMessage}
        </div>
      )}

      {modeEdition ? (
        <div className="security-editor">
          <h3>
            Changer le mot de passe
          </h3>
          <p>
            Renseignez votre mot de passe actuel puis choisissez un nouveau mot de passe sécurisé.
          </p>

          <ChangePasswordForm
            onCancel={() => setModeEdition(false)}
            onSuccess={() => {
              setModeEdition(false);
              setSuccessMessage("Mot de passe modifié avec succès.");
            }}
          />
        </div>
      ) : (
        <div className="security-card">

          <div className="security-badge">
            <Lock size={18} />
          </div>

          <div className="security-text">
            <h3>Mot de passe</h3>

            <p>
              Il est recommandé de modifier régulièrement
              votre mot de passe.
            </p>
          </div>

          <button className="btn-primary" onClick={() => { setSuccessMessage(""); setModeEdition(true); }}>
            Changer le mot de passe
          </button>

        </div>
      )}

    </div>
  );
};


/* =========================
   LANGUE
========================= */

const LANGUES = [
  { code: "fr", nom: "Français", court: "FR" },
  { code: "en", nom: "English", court: "EN" },
];

const Langue = () => {

  const [langue, setLangue] = useState(
    localStorage.getItem("langue") || "fr"
  );

  const changerLangue = (value) => {
    setLangue(value);
    localStorage.setItem("langue", value);
  };

  return (
    <div>

      <div className="settings-section-header">

        <div className="settings-icon">
          <Globe size={22} />
        </div>

        <div>
          <h2>Langue</h2>
          <p>
            Choisissez la langue de l'application
          </p>
        </div>

      </div>

      <div className="language-options">

        {LANGUES.map((item) => (
          <button
            key={item.code}
            className={`language-option ${
              langue === item.code ? "selected" : ""
            }`}
            onClick={() => changerLangue(item.code)}
          >
            <span className="lang-code">{item.court}</span>
            {item.nom}

            {langue === item.code && (
              <span className="language-check">
                <Check size={16} />
              </span>
            )}
          </button>
        ))}

      </div>

    </div>
  );
};

export default Settings;
