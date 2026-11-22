ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_notification_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_notification_check
CHECK (type_notification::text = ANY (ARRAY[
    'CLIENT_CREE'::character varying,
    'COMPTE_CREE'::character varying,
    'EVENEMENT_SYSTEME'::character varying,
    'CLIENT_A_TRAITER'::character varying,
    'COMPTE_CREE_AGENT'::character varying,
    'TRANSACTION_EFFECTUEE'::character varying,
    'DEPOT_EFFECTUE'::character varying,
    'RETRAIT_EFFECTUE'::character varying,
    'VIREMENT_RECU'::character varying,
    'VIREMENT_EFFECTUE'::character varying,
    'DEMANDE_CREDIT_SOUMISE'::character varying,
    'DEMANDE_CREDIT_DECIDEE'::character varying,
    'OFFRE_CREDIT_RECUE'::character varying,
    'CREDIT_ACCORDE'::character varying,
    'ECHEANCE_PROCHAINE'::character varying,
    'ECHEANCE_EN_RETARD'::character varying,
    'INTERET_VERSE'::character varying,
    'DEMANDE_CREDIT_A_TRAITER'::character varying,
    'PIECE_JOINTE_AJOUTEE'::character varying,
    'CLIENT_REPONSE_DEMANDE'::character varying,
    'OFFRE_ACCEPTEE'::character varying,
    'OFFRE_REFUSEE'::character varying,
    'REMBOURSEMENT_RECU'::character varying,
    'CREDIT_EN_RETARD'::character varying,
    'TRANSACTION_A_COMPTABILISER'::character varying,
    'CREDIT_A_ENREGISTRER'::character varying,
    'REMBOURSEMENT_ENREGISTRE'::character varying,
    'OPERATION_A_VERIFIER'::character varying
]::text[]));
