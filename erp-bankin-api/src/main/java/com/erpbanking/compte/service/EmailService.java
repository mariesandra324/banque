package com.erpbanking.compte.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.backend-url}")
    private String backendUrl;
    @Value("${spring.mail.username}")
    private String mailUsername;


    // =========================================================
    // 1. EMAIL CREATION COMPTE
    // =========================================================

    @Async
    public void envoyerNumeroCompte(
            String emailClient,
            String nomClient,
            String numeroCompte,
            String iban,
            String cleRib,
            String codePersonnel
    ) {

        try {

            SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailUsername);
            message.setTo(emailClient);
            message.setSubject(
                    "Confirmation de création de votre compte bancaire"
            );

            message.setText(
                    "Bonjour " + nomClient + ",\n\n" +

                    "Nous vous confirmons la création de votre compte bancaire.\n\n" +

                    "Informations de votre compte :\n" +
                    "----------------------------------\n" +
                    "Numéro de compte : " + numeroCompte + "\n" +
                    "Clé RIB : " + cleRib + "\n" +
                    "IBAN : " + iban + "\n" +
                    "----------------------------------\n\n" +

                    "Code personnel : " + codePersonnel + "\n\n" +

                    "Ce code personnel est strictement confidentiel.\n" +
                    "Ne le communiquez à personne, y compris à un agent " +
                    "ou à un administrateur de la banque.\n\n" +

                    "La banque ne pourra pas consulter votre code personnel " +
                    "après sa génération.\n\n" +

                    "Veuillez conserver ces informations en lieu sûr.\n\n" +

                    "Cordialement,\n" +
                    "L'équipe de votre banque"
            );

            mailSender.send(message);

            System.out.println(
                    "EMAIL COMPTE ENVOYÉ À : " + emailClient
            );

        } catch (Exception e) {

            System.err.println(
                    "ERREUR ENVOI EMAIL COMPTE"
            );

            e.printStackTrace();
        }
    }


    // =========================================================
    // 2. EMAIL PIN CARTE
    // =========================================================

    public void envoyerPinCarte(
            String emailClient,
            String nomClient,
            String numeroCarte,
            String pin
    ) {

        try {

            System.out.println("=================================");
            System.out.println("ENVOI EMAIL CARTE");
            System.out.println("PIN GÉNÉRÉ : " + pin);
            System.out.println("Email : " + emailClient);
            System.out.println("Nom : " + nomClient);
            System.out.println("Carte : " + numeroCarte);
            System.out.println("=================================");

            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(emailClient);

            message.setSubject(
                    "Votre carte bancaire - Code PIN"
            );

            message.setText(
        "Bonjour " + nomClient + ",\n\n" +
        "Votre carte bancaire vient d'être créée avec succès.\n\n" +
        "Informations de votre carte :\n" +
        "----------------------------------\n" +
        "Numéro de carte : " + numeroCarte + "\n" +
        "Code PIN : " + pin + "\n" +
        "----------------------------------\n\n" +
        "IMPORTANT :\n" +
        "Pour votre sécurité, ne communiquez jamais votre code PIN "
        + "à une autre personne.\n\n" +
        "Cordialement,\n" +
        "L'équipe ERP Banking"
);

            mailSender.send(message);

            System.out.println(
                    "EMAIL CARTE ENVOYÉ AVEC SUCCÈS"
            );

        } catch (Exception e) {

            System.err.println(
                    "ERREUR ENVOI EMAIL CARTE"
            );

            e.printStackTrace();
        }
    }
// transaction notification email
    @Async
public void envoyerNotificationTransaction(
        String emailClient,
        String nomClient,
        String typeTransaction,
        String montant,
        String numeroCompte,
        String reference,
        String dateTransaction,
        String description
) {

    try {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(emailClient);

        message.setSubject(
                "Notification - Transaction effectuée avec succès"
        );

        StringBuilder contenu = new StringBuilder();

        contenu.append("Bonjour ")
                .append(nomClient)
                .append(",\n\n");

        contenu.append(
                "Nous vous confirmons qu'une transaction a été effectuée "
                + "avec succès sur votre compte bancaire.\n\n"
        );

        contenu.append(
                "Détails de la transaction :\n"
        );

        contenu.append("----------------------------------\n");

        contenu.append("Type : ")
                .append(typeTransaction)
                .append("\n");

        contenu.append("Montant : ")
                .append(montant)
                .append("\n");

        contenu.append("Compte : ")
                .append(numeroCompte)
                .append("\n");

        contenu.append("Référence : ")
                .append(reference)
                .append("\n");

        contenu.append("Date : ")
                .append(dateTransaction)
                .append("\n");

        if (description != null && !description.isBlank()) {
            contenu.append("Description : ")
                    .append(description)
                    .append("\n");
        }

        contenu.append("----------------------------------\n\n");

        contenu.append(
                "Cette opération a été enregistrée avec succès "
                + "dans votre compte.\n\n"
        );

        contenu.append(
                "Si vous n'êtes pas à l'origine de cette opération, "
                + "veuillez contacter immédiatement votre banque.\n\n"
        );

        contenu.append(
                "Cordialement,\n"
                + "L'équipe ERP Banking"
        );

        message.setText(contenu.toString());

        mailSender.send(message);

        System.out.println(
                "EMAIL TRANSACTION ENVOYÉ À : " + emailClient
        );

    } catch (Exception e) {

        System.err.println(
                "ERREUR ENVOI EMAIL TRANSACTION"
        );

        e.printStackTrace();
    }
}

    // =========================================================
    // 3. EMAIL CONFIRMATION OFFRE ACCEPTÉE
    // =========================================================

    @Async
    public void envoyerConfirmationOffreAcceptee(
            String emailClient,
            String nomClient,
            String numeroOffre,
            String montant,
            String dateDebut
    ) {

        try {

            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(emailClient);

            message.setSubject(
                    "Confirmation d'acceptation de votre offre de crédit"
            );

            message.setText(
                    "Bonjour " + nomClient + ",\n\n" +

                    "Nous avons le plaisir de vous informer que " +
                    "votre offre de crédit a été acceptée.\n\n" +

                    "Informations du crédit :\n" +
                    "----------------------------------\n" +
                    "Numéro de l'offre : " + numeroOffre + "\n" +
                    "Montant : " + montant + "\n" +
                    "Date de début : " + dateDebut + "\n" +
                    "----------------------------------\n\n" +

                    "Votre crédit est maintenant en cours de mise en place.\n\n" +

                    "Cordialement,\n" +
                    "L'équipe de votre banque"
            );

            mailSender.send(message);

            System.out.println(
                    "EMAIL CONFIRMATION ACCEPTATION ENVOYÉ"
            );

        } catch (Exception e) {

            System.err.println(
                    "ERREUR EMAIL CONFIRMATION ACCEPTATION"
            );

            e.printStackTrace();
        }
    }


    // =========================================================
    // 4. EMAIL OFFRE PDF + BOUTONS ACCEPTER / REFUSER
    // =========================================================

    @Async
    public void envoyerOffrePdf(
            String emailClient,
            String nomClient,
            String numeroOffre,
            byte[] pdf,
            String token
    ) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );


            // -------------------------------------------------
            // Liens
            // -------------------------------------------------

            String lienAccepter =
                    backendUrl
                            + "/api/offres-credit/token/"
                            + token
                            + "/confirmer-accepter";

            String lienRefuser =
                    backendUrl
                            + "/api/offres-credit/token/"
                            + token
                            + "/confirmer-refuser";


            // -------------------------------------------------
            // Destinataire
            // -------------------------------------------------

            helper.setTo(emailClient);


            // -------------------------------------------------
            // Sujet
            // -------------------------------------------------

            helper.setSubject(
                    "Votre offre de crédit " + numeroOffre
            );


            // -------------------------------------------------
            // Contenu HTML
            // -------------------------------------------------

            String html =

                    "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "</head>" +

                    "<body style='font-family:Arial,sans-serif;" +
                    "font-size:15px;color:#333;" +
                    "line-height:1.6;'>" +

                    "<div style='max-width:650px;margin:auto;'>" +

                    "<h2 style='color:#1e3a8a;'>" +
                    "Votre offre de crédit" +
                    "</h2>" +

                    "<p>Bonjour <strong>" +
                    nomClient +
                    "</strong>,</p>" +

                    "<p>" +
                    "Nous avons le plaisir de vous transmettre " +
                    "votre offre de crédit." +
                    "</p>" +

                    "<p>" +
                    "Veuillez trouver votre offre " +
                    "en pièce jointe de cet email." +
                    "</p>" +

                    "<div style='background:#f8fafc;" +
                    "padding:18px;" +
                    "border-radius:8px;" +
                    "margin:20px 0;'>" +

                    "<strong>Numéro de l'offre :</strong> " +
                    numeroOffre +

                    "</div>" +

                    "<p>" +
                    "Après avoir consulté votre offre, " +
                    "vous pouvez choisir l'une des deux options :" +
                    "</p>" +

                    "<div style='margin:30px 0;'>" +

                    "<a href='" +
                    lienAccepter +
                    "' " +

                    "style='background:#16a34a;" +
                    "color:white;" +
                    "padding:14px 25px;" +
                    "text-decoration:none;" +
                    "border-radius:6px;" +
                    "display:inline-block;" +
                    "margin-right:10px;'>" +

                    "✅ Accepter l'offre" +

                    "</a>" +

                    "<a href='" +
                    lienRefuser +
                    "' " +

                    "style='background:#dc2626;" +
                    "color:white;" +
                    "padding:14px 25px;" +
                    "text-decoration:none;" +
                    "border-radius:6px;" +
                    "display:inline-block;'>" +

                    "❌ Refuser l'offre" +

                    "</a>" +

                    "</div>" +

                    "<p style='font-size:13px;color:#777;'>" +
                    "Ces liens sont personnels et confidentiels. " +
                    "Ne les partagez avec personne." +
                    "</p>" +

                    "<p>" +
                    "Cordialement,<br>" +
                    "<strong>L'équipe de votre banque</strong>" +
                    "</p>" +

                    "</div>" +

                    "</body>" +
                    "</html>";


            // -------------------------------------------------
            // HTML
            // -------------------------------------------------

            helper.setText(
                    html,
                    true
            );


            // -------------------------------------------------
            // PDF
            // -------------------------------------------------

            helper.addAttachment(
                    "offre-" + numeroOffre + ".pdf",
                    new ByteArrayResource(pdf)
            );


            // -------------------------------------------------
            // ENVOI
            // -------------------------------------------------

            mailSender.send(message);

            System.out.println(
                    "================================="
            );

            System.out.println(
                    "OFFRE PDF ENVOYÉE AVEC SUCCÈS"
            );

            System.out.println(
                    "Email : " + emailClient
            );

            System.out.println(
                    "Offre : " + numeroOffre
            );

            System.out.println(
                    "================================="
            );

        } catch (Exception e) {

            System.err.println(
                    "ERREUR ENVOI OFFRE PDF"
            );

            e.printStackTrace();
        }
    }


    // =========================================================
    // 5. EMAIL OFFRE REFUSÉE
    // =========================================================

    @Async
    public void envoyerConfirmationOffreRefusee(
            String emailClient,
            String nomClient,
            String numeroOffre
    ) {

        try {

            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setTo(emailClient);

            message.setSubject(
                    "Votre offre de crédit "
                            + numeroOffre
                            + " a été refusée"
            );

            message.setText(
                    "Bonjour " + nomClient + ",\n\n" +

                    "Nous confirmons que vous avez refusé " +
                    "l'offre de crédit n°"
                    + numeroOffre
                    + ".\n\n" +

                    "N'hésitez pas à nous contacter pour " +
                    "toute nouvelle demande.\n\n" +

                    "Cordialement,\n" +
                    "L'équipe de votre banque"
            );

            mailSender.send(message);

            System.out.println(
                    "EMAIL REFUS ENVOYÉ AVEC SUCCÈS"
            );

        } catch (Exception e) {

            System.err.println(
                    "ERREUR EMAIL REFUS"
            );

            e.printStackTrace();
        }
    }

    @Async
public void envoyerConfirmationDemandeCredit(
        String emailClient,
        String nomClient,
        String numeroDemande,
        String montant,
        Integer duree) {

    try {
        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(emailClient);
        helper.setFrom(mailUsername);
        helper.setSubject("Confirmation de votre demande de crédit - ERP Banking");

        String html = """
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">

                    <h2>Confirmation de votre demande de crédit</h2>

                    <p>Bonjour <strong>%s</strong>,</p>

                    <p>
                        Nous vous confirmons que votre demande de crédit
                        a bien été enregistrée dans notre système ERP Banking.
                    </p>

                    <h3>Détails de votre demande</h3>

                    <p>
                        <strong>Numéro de demande :</strong> %s<br>
                        <strong>Montant demandé :</strong> %s Ar<br>
                        <strong>Durée :</strong> %d mois
                    </p>

                    <p>
                        Votre demande est actuellement en cours d'étude
                        par notre service de crédit.
                    </p>

                    <p>
                        Vous recevrez une nouvelle notification par email
                        lorsque la banque aura pris une décision concernant
                        votre demande.
                    </p>

                    <br>

                    <p>
                        Cordialement,<br>
                        <strong>ERP Banking</strong>
                    </p>

                </body>
                </html>
                """.formatted(
                    nomClient,
                    numeroDemande,
                    montant,
                    duree
                );

        helper.setText(html, true);

        mailSender.send(message);

        System.out.println(
                "EMAIL CONFIRMATION DEMANDE ENVOYE A : "
                + emailClient
        );

    } catch (Exception e) {

        System.err.println(
                "ERREUR ENVOI EMAIL DEMANDE CREDIT : "
                + e.getMessage()
        );

        e.printStackTrace();
    }
}
}