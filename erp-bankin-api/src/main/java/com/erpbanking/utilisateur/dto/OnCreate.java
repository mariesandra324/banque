package com.erpbanking.utilisateur.dto;

import jakarta.validation.groups.Default;

/**
 * Groupe de validation appliqué uniquement à la création d'un utilisateur.
 * Etend {@link Default} afin que les contraintes standard (nom, email, ...)
 * restent vérifiées lors de la création.
 */
public interface OnCreate extends Default {
}
