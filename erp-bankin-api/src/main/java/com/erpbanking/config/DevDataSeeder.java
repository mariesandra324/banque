package com.erpbanking.config;

import com.erpbanking.permission.entity.Permission;
import com.erpbanking.permission.repository.PermissionRepository;
import com.erpbanking.role.entity.Role;
import com.erpbanking.role.repository.RoleRepository;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {
        Map<String, String> permissions = new LinkedHashMap<>();
        permissions.put("USER_MANAGE", "Gerer les utilisateurs");
        permissions.put("ROLE_MANAGE", "Gerer les roles");
        permissions.put("PERMISSION_MANAGE", "Gerer les permissions");
        permissions.put("CLIENT_CREATE", "Créer un dossier client");
        permissions.put("CLIENT_READ", "Consulter les clients");
        permissions.put("CLIENT_UPDATE", "Modifier un client");
        permissions.put("COMPTE_CREATE", "Ouvrir un compte");
        permissions.put("COMPTE_READ", "Consulter les comptes");
        permissions.put("COMPTE_CLOSE", "Clôturer ou bloquer un compte");
        permissions.put("TRANSACTION_CREATE", "Initier une transaction");
        permissions.put("TRANSACTION_READ", "Consulter l'historique");
        permissions.put("TRANSACTION_VALIDATE", "Valider une transaction");
        permissions.put("TRANSACTION_CANCEL", "Annuler une transaction");
        permissions.put("CREDIT_REQUEST", "Initier une demande de crédit");
        permissions.put("CREDIT_EVALUATE", "Étudier un dossier de crédit");
        permissions.put("CREDIT_APPROVE", "Approuver ou rejeter un crédit");
        permissions.put("CREDIT_READ", "Consulter les dossiers de crédit");
        permissions.put("COMPTA_REPORT", "Générer des rapports financiers");
        permissions.put("COMPTA_CLOSE", "Clôturer la comptabilité");
        permissions.put("COMPTA_READ", "Consulter les écritures comptables");

        Map<String, Permission> seededPermissions = new LinkedHashMap<>();
        permissions.forEach((code, description) ->
                seededPermissions.put(code,
                        permissionRepository.findByNom(code)
                                .orElseGet(() -> permissionRepository.save(Permission.builder()
                                        .nom(code)
                                        .description(description)
                                        .actif(true)
                                        .build()))));

        Set<Permission> allPermissions = new HashSet<>(seededPermissions.values());
        Set<Permission> agentPermissions = permissions(
                seededPermissions,
                "CLIENT_CREATE", "CLIENT_READ", "CLIENT_UPDATE",
                "COMPTE_CREATE", "COMPTE_READ", "COMPTE_CLOSE",
                "TRANSACTION_CREATE", "TRANSACTION_READ",
                "CREDIT_REQUEST", "CREDIT_READ");
        Set<Permission> gestionnairePermissions = permissions(
                seededPermissions,
                "CLIENT_READ", "COMPTE_READ", "TRANSACTION_READ",
                "CREDIT_EVALUATE", "CREDIT_APPROVE", "CREDIT_READ");
        Set<Permission> comptablePermissions = permissions(
                seededPermissions,
                "CLIENT_READ", "COMPTE_READ", "TRANSACTION_READ",
                "TRANSACTION_VALIDATE", "CREDIT_READ",
                "COMPTA_REPORT", "COMPTA_CLOSE", "COMPTA_READ");

        createRoleIfMissing("SUPER_ADMIN", "Super administrateur", allPermissions);
        createRoleIfMissing("ADMIN", "Administrateur", allPermissions);
        createRoleIfMissing("AGENT", "Agent guichet", agentPermissions);
        createRoleIfMissing("GESTIONNAIRE", "Gestionnaire de crédit", gestionnairePermissions);
        createRoleIfMissing("COMPTABLE", "Comptable", comptablePermissions);
        createRoleIfMissing("CLIENT", "Client", new HashSet<>());
    }

    private Set<Permission> permissions(
            Map<String, Permission> seededPermissions,
            String... codes
    ) {
        Set<Permission> result = new HashSet<>();
        for (String code : codes) {
            result.add(seededPermissions.get(code));
        }
        return result;
    }

    private void createRoleIfMissing(
            String name,
            String description,
            Set<Permission> permissions
    ) {
        if (roleRepository.findByNom(name).isEmpty()) {
            roleRepository.save(Role.builder()
                    .nom(name)
                    .description(description)
                    .actif(true)
                    .permissions(new HashSet<>(permissions))
                    .build());
        }
    }
}
