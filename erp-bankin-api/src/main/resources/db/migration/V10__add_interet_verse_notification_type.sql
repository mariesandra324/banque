-- Synchronise la contrainte CHECK de notifications.type_notification avec
-- l'enum Java NotificationType apres l'ajout de INTERET_VERSE.
--
-- Meme logique que V1 : la contrainte est recreee pour inclure la nouvelle
-- valeur, sinon toute notification INTERET_VERSE serait rejetee a l'insertion.
--
-- notifications ET notification_preferences partagent le meme enum : les deux
-- contraintes doivent etre resynchronisees ensemble.
--
-- A rejouer si d'autres valeurs sont ajoutees a NotificationType.

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_notification_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_notification_check
    CHECK (type_notification::text = ANY (ARRAY['CLIENT_CREE'::character varying, 'COMPTE_CREE'::character varying, 'EVENEMENT_SYSTEME'::character varying, 'CLIENT_A_TRAITER'::character varying, 'COMPTE_CREE_AGENT'::character varying, 'TRANSACTION_EFFECTUEE'::character varying, 'DEPOT_EFFECTUE'::character varying, 'RETRAIT_EFFECTUE'::character varying, 'VIREMENT_RECU'::character varying, 'VIREMENT_EFFECTUE'::character varying, 'DEMANDE_CREDIT_SOUMISE'::character varying, 'DEMANDE_CREDIT_DECIDEE'::character varying, 'OFFRE_CREDIT_RECUE'::character varying, 'CREDIT_ACCORDE'::character varying, 'ECHEANCE_PROCHAINE'::character varying, 'ECHEANCE_EN_RETARD'::character varying, 'INTERET_VERSE'::character varying, 'DEMANDE_CREDIT_A_TRAITER'::character varying, 'PIECE_JOINTE_AJOUTEE'::character varying, 'CLIENT_REPONSE_DEMANDE'::character varying, 'OFFRE_ACCEPTEE'::character varying, 'OFFRE_REFUSEE'::character varying, 'REMBOURSEMENT_RECU'::character varying, 'TRANSACTION_A_COMPTABILISER'::character varying, 'CREDIT_A_ENREGISTRER'::character varying, 'REMBOURSEMENT_ENREGISTRE'::character varying, 'OPERATION_A_VERIFIER'::character varying]::text[]));

ALTER TABLE notification_preferences
    DROP CONSTRAINT IF EXISTS notification_preferences_type_notification_check;

ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_type_notification_check
    CHECK (type_notification::text = ANY (ARRAY['CLIENT_CREE'::character varying, 'COMPTE_CREE'::character varying, 'EVENEMENT_SYSTEME'::character varying, 'CLIENT_A_TRAITER'::character varying, 'COMPTE_CREE_AGENT'::character varying, 'TRANSACTION_EFFECTUEE'::character varying, 'DEPOT_EFFECTUE'::character varying, 'RETRAIT_EFFECTUE'::character varying, 'VIREMENT_RECU'::character varying, 'VIREMENT_EFFECTUE'::character varying, 'DEMANDE_CREDIT_SOUMISE'::character varying, 'DEMANDE_CREDIT_DECIDEE'::character varying, 'OFFRE_CREDIT_RECUE'::character varying, 'CREDIT_ACCORDE'::character varying, 'ECHEANCE_PROCHAINE'::character varying, 'ECHEANCE_EN_RETARD'::character varying, 'INTERET_VERSE'::character varying, 'DEMANDE_CREDIT_A_TRAITER'::character varying, 'PIECE_JOINTE_AJOUTEE'::character varying, 'CLIENT_REPONSE_DEMANDE'::character varying, 'OFFRE_ACCEPTEE'::character varying, 'OFFRE_REFUSEE'::character varying, 'REMBOURSEMENT_RECU'::character varying, 'TRANSACTION_A_COMPTABILISER'::character varying, 'CREDIT_A_ENREGISTRER'::character varying, 'REMBOURSEMENT_ENREGISTRE'::character varying, 'OPERATION_A_VERIFIER'::character varying]::text[]));
