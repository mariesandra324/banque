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
        <h1>Paramètres</h1>
        <p>
          Gérez votre compte et les préférences de l'application
        </p>
      </div>

      <div className="settings-container">

        {/* MENU GAUCHE */}
        <div className="settings-menu">

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
                <Icon size={19} />

                <span>{item.label}</span>

                <ChevronRight
                  size={17}
                  className="settings-arrow"
                />
              </button>
            );
          })}

        </div>

        {/* CONTENU */}
        <div className="settings-content">

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
            Consultez les informations de votre compte
          </p>
        </div>
      </div>

      {/* =========================
          AVATAR
      ========================== */}

      <div className="profile-card">

        <div className="profile-avatar">
          {initiales || "U"}
        </div>

        <div className="profile-info">
          <h3>
            {prenom} {nom}
          </h3>

          <p>
            {role}
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
            <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>
              {fieldErrors.nom}
            </div>
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
            <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '12px' }}>
              {fieldErrors.prenom}
            </div>
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
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '13px' }}>
          {successMessage}
        </div>
      )}

      {submitError && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '13px' }}>
          {submitError}
        </div>
      )}

      {modeEdition ? (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={enregistrer} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={annulerEdition}
            disabled={loading}
            style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--input-border)' }}
          >
            Annuler
          </button>
        </div>
      ) : (
        <button className="btn-primary" onClick={debutEdition}>
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

      <h2>Apparence</h2>

      <p>
        Choisissez le mode d'affichage de l'application.
      </p>

      <div className="theme-options">

        <button
          className={`theme-option ${
            theme === "light" ? "selected" : ""
          }`}
          onClick={() => setTheme("light")}
        >
          ☀️
          <div>
            <strong>Mode clair</strong>
            <span>
              Utiliser le thème clair
            </span>
          </div>
        </button>


        <button
          className={`theme-option ${
            theme === "dark" ? "selected" : ""
          }`}
          onClick={() => setTheme("dark")}
        >
          🌙
          <div>
            <strong>Mode sombre</strong>
            <span>
              Utiliser le thème sombre
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
              <div key={pref.type} className="setting-row">
                <div>
                  <strong>
                    {pref.emoji} {pref.libelle}
                  </strong>
                  <p>
                    Notifier lorsque ce type d'événement se produit
                  </p>
                </div>

                <div className="notification-toggles">
                  <label className="notification-toggle">
                    <Mail size={15} />
                    Email
                    <Switch
                      on={pref.emailActive}
                      onClick={() =>
                        toggle(pref.type, "emailActive", !pref.emailActive)
                      }
                    />
                  </label>

                  <label className="notification-toggle">
                    <Smartphone size={15} />
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
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '13px' }}>
          {successMessage}
        </div>
      )}

      {modeEdition ? (
        <div style={{ padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--heading)', margin: '0 0 4px' }}>
            Changer le mot de passe
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 18px' }}>
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

          <h3>Mot de passe</h3>

          <p>
            Il est recommandé de modifier régulièrement
            votre mot de passe.
          </p>

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

      <div className="form-group">

        <label>Langue</label>

        <select
          value={langue}
          onChange={(e) => changerLangue(e.target.value)}
        >
          <option value="fr">
            Français
          </option>

          <option value="en">
            English
          </option>
        </select>

      </div>

    </div>
  );
};

export default Settings;