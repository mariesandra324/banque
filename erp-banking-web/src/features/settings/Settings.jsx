import { useState } from "react";
import {
  User,
  Palette,
  Bell,
  Lock,
  Globe,
  ChevronRight,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme";
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
  const { user } = useAuth();

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
            value={nom}
            readOnly
          />
        </div>


        <div className="form-group">
          <label>Prénom</label>

          <input
            type="text"
            value={prenom}
            readOnly
          />
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

      <button className="btn-primary">
        Modifier le profil
      </button>

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

const Notifications = () => {

  const [notifications, setNotifications] = useState(true);

  return (
    <div>

      <div className="settings-section-header">

        <div className="settings-icon">
          <Bell size={22} />
        </div>

        <div>
          <h2>Notifications</h2>
          <p>
            Gérez vos préférences de notifications
          </p>
        </div>

      </div>

      <div className="setting-row">

        <div>
          <strong>Notifications</strong>
          <p>
            Recevoir les notifications de l'application
          </p>
        </div>

        <button
          className={`switch ${
            notifications ? "on" : ""
          }`}
          onClick={() => setNotifications(!notifications)}
        >
          <span />
        </button>

      </div>

    </div>
  );
};


/* =========================
   SECURITE
========================= */

const Securite = () => {

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

      <div className="security-card">

        <h3>Mot de passe</h3>

        <p>
          Il est recommandé de modifier régulièrement
          votre mot de passe.
        </p>

        <button className="btn-primary">
          Changer le mot de passe
        </button>

      </div>

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