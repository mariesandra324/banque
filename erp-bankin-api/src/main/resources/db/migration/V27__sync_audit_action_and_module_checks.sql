-- Synchronise les contraintes CHECK du journal d'audit avec les enums Java.
--
-- Les contraintes audit_log_action_check / audit_log_module_check ont ete
-- creees a partir des anciennes valeurs des enums. Les actions de caisse
-- (TRANSFERT, ACCEPTATION, OUVERTURE_SESSION, FERMETURE_SESSION,
-- VALIDATION_CLOTURE, REJET_CLOTURE) et le module CAISSE n'y figuraient pas :
-- toute journalisation de ces evenements echouait avec SQLState 23514.

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;

ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check
    CHECK (action IN (
        'CREATION',
        'MODIFICATION',
        'SUPPRESSION',
        'DEPOT',
        'RETRAIT',
        'VIREMENT',
        'TRANSFERT',
        'VALIDATION',
        'ACCEPTATION',
        'REFUS',
        'DESACTIVATION',
        'OUVERTURE_SESSION',
        'FERMETURE_SESSION',
        'VALIDATION_CLOTURE',
        'REJET_CLOTURE',
        'MODIFICATION_STATUT'
    ));

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_module_check;

ALTER TABLE audit_log ADD CONSTRAINT audit_log_module_check
    CHECK (module IN (
        'CLIENTS',
        'COMPTES',
        'TRANSACTIONS',
        'CREDITS',
        'CARTES',
        'CAISSE',
        'UTILISATEURS',
        'SYSTEME'
    ));
