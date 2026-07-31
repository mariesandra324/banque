// Rôles disponibles pour un utilisateur interne (hors Client, géré ailleurs)
export const ROLES_INTERNES = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "AGENT", label: "Agent guichet" },
  { value: "GESTIONNAIRE", label: "Gestionnaire de crédit" },
  { value: "COMPTABLE", label: "Comptable" },
];

// Permissions groupées par module, cochées/décochées individuellement.
// Chaque rôle a un préréglage par défaut (voir DEFAULT_PERMISSIONS_BY_ROLE),
// mais l'admin peut les ajuster manuellement avant de créer l'utilisateur.
export const PERMISSIONS_PAR_MODULE = [
  {
    module: "Clients",
    permissions: [
      { code: "CLIENT_CREATE", label: "Créer un dossier client" },
      { code: "CLIENT_READ", label: "Consulter les clients" },
      { code: "CLIENT_UPDATE", label: "Modifier un client" },
    ],
  },
  {
    module: "Comptes",
    permissions: [
      { code: "COMPTE_CREATE", label: "Ouvrir un compte" },
      { code: "COMPTE_READ", label: "Consulter les comptes" },
      { code: "COMPTE_CLOSE", label: "Clôturer / bloquer un compte" },
    ],
  },
  {
    module: "Transactions",
    permissions: [
      { code: "TRANSACTION_CREATE", label: "Initier une transaction" },
      { code: "TRANSACTION_READ", label: "Consulter l'historique" },
      { code: "TRANSACTION_VALIDATE", label: "Valider une transaction à seuil" },
      { code: "TRANSACTION_CANCEL", label: "Annuler une transaction" },
    ],
  },
  {
    module: "Crédits",
    permissions: [
      { code: "CREDIT_REQUEST", label: "Initier une demande de crédit" },
      { code: "CREDIT_EVALUATE", label: "Étudier un dossier de crédit" },
      { code: "CREDIT_APPROVE", label: "Approuver / rejeter un crédit" },
      { code: "CREDIT_READ", label: "Consulter les dossiers de crédit" },
    ],
  },
  {
    module: "Comptabilité",
    permissions: [
      { code: "COMPTA_REPORT", label: "Générer des rapports financiers" },
      { code: "COMPTA_CLOSE", label: "Clôture comptable" },
      { code: "COMPTA_READ", label: "Consulter les écritures comptables" },
    ],
  },
  {
    module: "Administration",
    permissions: [
      { code: "USER_MANAGE", label: "Gérer les utilisateurs & rôles" },
    ],
  },
];

// Préréglage de permissions par rôle, appliqué automatiquement à la sélection
// du rôle dans le formulaire (l'admin peut ensuite ajuster manuellement).
export const DEFAULT_PERMISSIONS_BY_ROLE = {
  ADMIN: PERMISSIONS_PAR_MODULE.flatMap((m) => m.permissions.map((p) => p.code)),
  AGENT: [
    "CLIENT_CREATE", "CLIENT_READ", "CLIENT_UPDATE",
    "COMPTE_CREATE", "COMPTE_READ", "COMPTE_CLOSE",
    "TRANSACTION_CREATE", "TRANSACTION_READ",
    "CREDIT_REQUEST", "CREDIT_READ",
  ],
  GESTIONNAIRE: [
    "CLIENT_READ",
    "COMPTE_READ",
    "TRANSACTION_READ",
    "CREDIT_EVALUATE", "CREDIT_APPROVE", "CREDIT_READ",
  ],
  COMPTABLE: [
    "CLIENT_READ",
    "COMPTE_READ",
    "TRANSACTION_READ", "TRANSACTION_VALIDATE",
    "CREDIT_READ",
    "COMPTA_REPORT", "COMPTA_CLOSE", "COMPTA_READ",
  ],
};