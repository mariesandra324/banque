package com.erpbanking.compte.service;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.erpbanking.client.entity.Client;
import com.erpbanking.compte.dto.CarteRequest;
import com.erpbanking.compte.dto.CarteResponse;
import com.erpbanking.compte.entity.Carte;
import com.erpbanking.compte.entity.Compte;
import com.erpbanking.compte.mapper.CarteMapper;
import com.erpbanking.compte.repository.CarteRepository;
import com.erpbanking.compte.repository.CompteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarteServiceImpl implements CarteService{
    private final CarteRepository carteRepository;
    private final CompteRepository compteRepository;
    private final CarteMapper carteMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;


    @Override
    public CarteResponse create(CarteRequest request) {

        // 1. Vérifier que le compte existe
        Compte compte = compteRepository.findById(request.getCompteId())
                .orElseThrow(() ->
                        new RuntimeException("Compte introuvable")
                );


        // 2. Vérifier qu'il n'existe pas déjà une carte
        if (carteRepository.existsByCompteId(compte.getId())) {
            throw new RuntimeException(
                    "Ce compte possède déjà une carte."
            );
        }


        // 3. Récupérer le client
        Client client = compte.getClient();

        if (client == null) {
            throw new RuntimeException(
                    "Aucun client n'est associé à ce compte."
            );
        }


        // 4. Vérifier que le client possède un email
        if (client.getEmail() == null ||
                client.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Le client ne possède pas d'adresse email."
            );
        }


        // 5. Générer le numéro de carte
        String numeroCarte = genererNumeroCarte();


        // 6. Générer le PIN
        String pin = String.format(
                "%04d",
                ThreadLocalRandom.current().nextInt(10000)
        );


        // 7. Hasher le PIN avant de le sauvegarder
        String pinHash = passwordEncoder.encode(pin);


        // 8. Date d'expiration : 3 ans
        LocalDate dateExpiration =
                LocalDate.now().plusYears(3);


        // 9. Créer la carte
        Carte carte = Carte.builder()
                .numeroCarte(numeroCarte)
                .dateExpiration(dateExpiration)
                .typeCarte(request.getTypeCarte())
                .statut("ACTIVE")
                .pinHash(pinHash)
                .compte(compte)
                .build();


        // 10. Sauvegarder la carte
        Carte saved = carteRepository.save(carte);


        // 11. Envoyer le PIN par email
        String nomClient = construireNomClient(client);

        emailService.envoyerPinCarte(
                client.getEmail(),
                nomClient,
                numeroCarte,
                pin
        );


        // 12. Retourner la réponse
        return carteMapper.toResponse(saved);
    }


    @Override
    public List<CarteResponse> findAll() {

        return carteRepository.findAll()
                .stream()
                .map(carteMapper::toResponse)
                .toList();
    }


    @Override
    public CarteResponse findById(Long id) {

        Carte carte = carteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Carte introuvable")
                );

        return carteMapper.toResponse(carte);
    }


    @Override
    public CarteResponse findByCompteId(Long compteId) {

        Carte carte = carteRepository
                .findByCompteId(compteId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Aucune carte trouvée pour ce compte"
                        )
                );

        return carteMapper.toResponse(carte);
    }


    @Override
    public CarteResponse update(
            Long id,
            CarteRequest request
    ) {

        Carte carte = carteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Carte introuvable")
                );

        if (request.getTypeCarte() != null &&
                !request.getTypeCarte().isBlank()) {

            carte.setTypeCarte(
                    request.getTypeCarte()
            );
        }

        Carte updated = carteRepository.save(carte);

        return carteMapper.toResponse(updated);
    }


    @Override
    public void delete(Long id) {

        if (!carteRepository.existsById(id)) {
            throw new RuntimeException(
                    "Carte introuvable"
            );
        }

        carteRepository.deleteById(id);
    }


    /**
     * Génération d'un numéro de carte de 16 chiffres.
     */
    private String genererNumeroCarte() {

        String numero;

        do {

            StringBuilder builder =
                    new StringBuilder();

            for (int i = 0; i < 16; i++) {

                int chiffre =
                        ThreadLocalRandom.current()
                                .nextInt(10);

                builder.append(chiffre);
            }

            numero = builder.toString();

        } while (
                carteRepository
                        .findByNumeroCarte(numero)
                        .isPresent()
        );

        return numero;
    }


    /**
     * Construit le nom du client.
     *
     * Adapte les getters si ton entité Client
     * utilise des noms différents.
     */
    private String construireNomClient(Client client) {

        StringBuilder nom =
                new StringBuilder();

        if (client.getNom() != null) {
            nom.append(client.getNom());
        }

        if (client.getPrenom() != null) {

            if (!nom.isEmpty()) {
                nom.append(" ");
            }

            nom.append(client.getPrenom());
        }

        return nom.isEmpty()
                ? "Client"
                : nom.toString();
    }
}
