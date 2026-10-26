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
  Landmark,
  KeyRound,
  Plus,
  Save,
  Power,
  RefreshCw,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme";
import notificationService from "../../service/notificationService";
import authService from "../../service/authService";
import ChangePasswordForm from "./ChangePasswordForm";
import { getRoles, createRole, updateRole } from "../../service/roleService";
import { getPermissions, createPermission } from "../../service/permissionService";
import { getGuichets, createGuichet, updateGuichet } from "../../service/guichetService";
import { PERMISSIONS_PAR_MODULE } from "../../config/permissions";
import "../../styles/settings.css";
import { useAuth } from "../../hooks/useAuth";

const Settings = () => {
  const [section, setSection] = useState("profil");
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

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
    ...(isAdmin
      ? [
          {
            id: "guichets",
            label: "Guichets",
            icon: Landmark,
          },
          {
            id: "roles",
            label: "Rôles & permissions",
            icon: KeyRound,
          },
        ]
      : []),
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

            {isAdmin && section === "guichets" && (
              <Guichets />
            )}

            {isAdmin && section === "roles" && (
              <RolesPermissions />
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

/* =========================
   GUICHETS (ADMIN)
========================= */

const Guichets = () => {
  const [guichets, setGuichets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const charger = async () => {
    try {
      const response = await getGuichets();
      setGuichets(response.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les guichets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, []);

  const ajouter = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Le code guichet est obligatoire.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createGuichet({ codeGuichet: code.trim(), actif: true });
      setCode("");
      setSuccess("Guichet ajouté avec succès.");
      await charger();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'ajouter le guichet.");
    } finally {
      setSaving(false);
    }
  };

  const basculerActif = async (guichet) => {
    setError("");
    setSuccess("");

    try {
      await updateGuichet(guichet.id, {
        codeGuichet: guichet.codeGuichet,
        actif: !guichet.actif,
      });
      setSuccess(guichet.actif ? "Guichet désactivé." : "Guichet activé.");
      await charger();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de modifier le guichet.");
    }
  };

  return (
    <div>
      <div className="settings-section-header">
        <div className="settings-icon">
          <Landmark size={22} />
        </div>

        <div>
          <h2>Guichets</h2>
          <p>Ajoutez ou désactivez les guichets de l'agence</p>
        </div>
      </div>

      <form className="admin-inline-form" onSubmit={ajouter}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Code guichet</label>
          <input
            type="text"
            value={code}
            maxLength={5}
            placeholder="Ex : 00001"
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          <Plus size={15} />
          {saving ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <X size={15} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <Check size={15} />
          {success}
        </div>
      )}

      <div className="admin-list">
        {loading ? (
          <p className="profile-loading">Chargement des guichets…</p>
        ) : guichets.length === 0 ? (
          <p className="profile-loading">Aucun guichet enregistré.</p>
        ) : (
          guichets.map((guichet) => (
            <div key={guichet.id} className="admin-list-row">
              <div className="admin-list-row-main">
                <span className="admin-badge">
                  {guichet.codeGuichet}
                </span>
                <span className={`admin-status ${guichet.actif ? "on" : "off"}`}>
                  {guichet.actif ? "Actif" : "Inactif"}
                </span>
              </div>

              <button
                type="button"
                className="btn-primary btn-ghost"
                onClick={() => basculerActif(guichet)}
              >
                <Power size={15} />
                {guichet.actif ? "Désactiver" : "Activer"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* =========================
   RÔLES & PERMISSIONS (ADMIN)
========================= */

const ROLE_VIDE = {
  id: null,
  nom: "",
  description: "",
  actif: true,
  permissionIds: [],
};

const construireModules = (permissions) => {
  const permissionsParNom = new Map(
    permissions.map((permission) => [permission.nom, permission])
  );

  const idsConnus = new Set();

  const modules = PERMISSIONS_PAR_MODULE.map((module) => ({
    module: module.module,
    items: module.permissions
      .map((item) => {
        const permission = permissionsParNom.get(item.code);

        if (!permission) return null;

        idsConnus.add(permission.id);

        return { ...permission, label: item.label };
      })
      .filter(Boolean),
  })).filter((module) => module.items.length > 0);

  const autres = permissions
    .filter((permission) => !idsConnus.has(permission.id))
    .map((permission) => ({ ...permission, label: permission.nom }));

  if (autres.length > 0) {
    modules.push({ module: "Autres", items: autres });
  }

  return modules;
};

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState(ROLE_VIDE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rechargerRoles = async () => {
    const response = await getRoles();
    setRoles(response.data || []);
  };

  useEffect(() => {
    let active = true;

    Promise.all([getRoles(), getPermissions()])
      .then(([rolesResponse, permissionsResponse]) => {
        if (!active) return;

        setRoles(rolesResponse.data || []);
        setPermissions(permissionsResponse.data || []);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Impossible de charger les rôles et permissions."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const modules = construireModules(permissions);

  const codesConfig = PERMISSIONS_PAR_MODULE.flatMap((module) =>
    module.permissions.map((permission) => permission.code)
  );

  const nomsExistants = new Set(permissions.map((permission) => permission.nom));
  const permissionsManquantes = codesConfig.filter((code) => !nomsExistants.has(code));

  const selectionnerRole = (role) => {
    setForm({
      id: role.id,
      nom: role.nom || "",
      description: role.description || "",
      actif: role.actif !== false,
      permissionIds: (role.permissionIds || []).map(String),
    });
    setError("");
    setSuccess("");
  };

  const nouveauRole = () => {
    setForm({ ...ROLE_VIDE, permissionIds: [] });
    setError("");
    setSuccess("");
  };

  const basculerPermission = (permissionId) => {
    const id = String(permissionId);

    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter((item) => item !== id)
        : [...prev.permissionIds, id],
    }));
  };

  const creerPermissionsManquantes = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await Promise.all(
        permissionsManquantes.map((code) => {
          const item = PERMISSIONS_PAR_MODULE
            .flatMap((module) => module.permissions)
            .find((permission) => permission.code === code);

          return createPermission({
            nom: code,
            description: item?.label || code,
          });
        })
      );

      const response = await getPermissions();
      setPermissions(response.data || []);
      setSuccess(`${permissionsManquantes.length} permission(s) créée(s).`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de créer les permissions par défaut."
      );
    } finally {
      setSaving(false);
    }
  };

  const enregistrer = async (e) => {
    e.preventDefault();

    if (!form.nom.trim()) {
      setError("Le nom du rôle est obligatoire.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      nom: form.nom.trim(),
      description: form.description.trim(),
      actif: form.actif,
      permissionIds: form.permissionIds.map(Number),
    };

    try {
      if (form.id) {
        await updateRole(form.id, payload);
        setSuccess("Rôle et permissions mis à jour.");
      } else {
        await createRole(payload);
        setSuccess("Rôle créé avec succès.");
      }

      await rechargerRoles();
      setForm({ ...ROLE_VIDE, permissionIds: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'enregistrer le rôle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="settings-section-header">
        <div className="settings-icon">
          <KeyRound size={22} />
        </div>

        <div>
          <h2>Rôles & permissions</h2>
          <p>Modifiez les permissions accordées à chaque rôle</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <X size={15} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <Check size={15} />
          {success}
        </div>
      )}

      {permissionsManquantes.length > 0 && (
        <div className="admin-notice">
          <div>
            <strong>Permissions par défaut manquantes</strong>
            <p>
              Certaines permissions proposées ne sont pas encore enregistrées
              en base. Créez-les pour pouvoir les affecter aux rôles.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={creerPermissionsManquantes}
            disabled={saving}
          >
            <RefreshCw size={15} />
            {saving ? "Création..." : "Créer les permissions"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="profile-loading">Chargement des rôles…</p>
      ) : (
        <div className="admin-split">
          <aside className="admin-list admin-role-list">
            <button type="button" className="btn-primary" onClick={nouveauRole}>
              <Plus size={15} />
              Nouveau rôle
            </button>

            {roles.length === 0 ? (
              <p className="profile-loading">Aucun rôle enregistré.</p>
            ) : (
              roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`admin-list-item ${
                    form.id === role.id ? "active" : ""
                  }`}
                  onClick={() => selectionnerRole(role)}
                >
                  <span>{role.nom}</span>
                  <span className="admin-list-item-count">
                    {(role.permissionIds || []).length}
                  </span>
                </button>
              ))
            )}
          </aside>

          <form className="admin-editor" onSubmit={enregistrer}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom du rôle</label>
                <input
                  type="text"
                  value={form.nom}
                  readOnly={!!form.id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nom: e.target.value }))
                  }
                />
                {form.id && (
                  <span className="admin-hint">
                    Le nom technique d'un rôle existant ne peut pas être modifié.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="admin-permissions">
              <div className="admin-permissions-title">
                Permissions
                <span>{form.permissionIds.length} sélectionnée(s)</span>
              </div>

              {modules.length === 0 ? (
                <p className="profile-loading">
                  Aucune permission disponible. Créez d'abord les permissions
                  par défaut.
                </p>
              ) : (
                modules.map((module) => (
                  <div key={module.module} className="admin-permission-group">
                    <h4>{module.module}</h4>

                    <div className="admin-permission-grid">
                      {module.items.map((permission) => (
                        <label
                          key={permission.id}
                          className={`admin-permission-item ${
                            form.permissionIds.includes(String(permission.id))
                              ? "checked"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.permissionIds.includes(
                              String(permission.id)
                            )}
                            onChange={() => basculerPermission(permission.id)}
                          />
                          <span>{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                <Save size={15} />
                {saving ? "Enregistrement..." : form.id ? "Enregistrer" : "Créer le rôle"}
              </button>

              <button
                type="button"
                className="btn-primary btn-ghost"
                onClick={nouveauRole}
                disabled={saving}
              >
                <X size={15} />
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
