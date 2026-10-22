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
            // Destinataire / Expéditeur
            // -------------------------------------------------

            helper.setTo(emailClient);
            helper.setFrom(mailUsername);


            // -------------------------------------------------
            // Sujet
            // -------------------------------------------------

            helper.setSubject(
                    "Votre offre de crédit n° " + numeroOffre
            );


            // -------------------------------------------------
            // Contenu HTML (courrier formel)
            // -------------------------------------------------

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                    </head>

                    <body style="margin:0;padding:0;background-color:#f1f5f9;
                        font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                            style="background-color:#f1f5f9;padding:24px 0;">
                            <tr>
                                <td align="center">

                                    <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                                        style="background-color:#ffffff;border-radius:10px;
                                        overflow:hidden;border:1px solid #e2e8f0;">

                                        <tr>
                                            <td style="background-color:#1e3a8a;padding:24px 32px;">
                                                <div style="color:#ffffff;font-size:18px;
                                                    font-weight:bold;letter-spacing:1px;">
                                                    BANQUE ERP BANKING
                                                </div>
                                                <div style="color:#c7d2fe;font-size:12px;margin-top:4px;">
                                                    Service Crédits
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding:32px;">

                                                <h1 style="font-size:18px;color:#1e3a8a;
                                                    margin:0 0 20px 0;">
                                                    Votre offre de crédit
                                                </h1>

                                                <p style="font-size:15px;line-height:1.6;margin:0 0 14px 0;">
                                                    Madame, Monsieur <strong>{{nomClient}}</strong>,
                                                </p>

                                                <p style="font-size:15px;line-height:1.6;margin:0 0 14px 0;">
                                                    Nous avons l'honneur de vous adresser l'offre de crédit
                                                    établie par nos services, dont vous trouverez le détail
                                                    complet dans le document PDF joint à la présente.
                                                </p>

                                                <table role="presentation" width="100%" cellpadding="0"
                                                    cellspacing="0" style="background-color:#f8fafc;
                                                    border:1px solid #e2e8f0;border-radius:8px;margin:20px 0;">
                                                    <tr>
                                                        <td style="padding:16px 20px;">
                                                            <div style="font-size:12px;color:#64748b;
                                                                text-transform:uppercase;letter-spacing:0.5px;">
                                                                Référence de l'offre
                                                            </div>
                                                            <div style="font-size:16px;font-weight:bold;
                                                                color:#1f2937;margin-top:4px;">
                                                                {{numeroOffre}}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <p style="font-size:15px;line-height:1.6;margin:0 0 14px 0;">
                                                    Nous vous invitons à prendre connaissance de l'ensemble des
                                                    conditions qui y figurent, puis à nous faire part de votre
                                                    décision au moyen des options ci-dessous.
                                                </p>

                                                <table role="presentation" cellpadding="0" cellspacing="0"
                                                    style="margin:26px 0;">
                                                    <tr>
                                                        <td style="padding-right:12px;">
                                                            <a href="{{lienAccepter}}"
                                                                style="display:inline-block;background-color:#16a34a;
                                                                color:#ffffff;text-decoration:none;font-size:14px;
                                                                font-weight:bold;padding:14px 26px;border-radius:6px;">
                                                                Accepter l'offre
                                                            </a>
                                                        </td>
                                                        <td>
                                                            <a href="{{lienRefuser}}"
                                                                style="display:inline-block;background-color:#dc2626;
                                                                color:#ffffff;text-decoration:none;font-size:14px;
                                                                font-weight:bold;padding:14px 26px;border-radius:6px;">
                                                                Refuser l'offre
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <p style="font-size:13px;line-height:1.6;color:#64748b;
                                                    margin:0 0 14px 0;">
                                                    Ces liens sont strictement personnels et confidentiels.
                                                    Nous vous remercions de ne les communiquer à aucune tierce
                                                    personne.
                                                </p>

                                                <p style="font-size:15px;line-height:1.6;margin:24px 0 0 0;">
                                                    Veuillez agréer, Madame, Monsieur, l'expression de nos
                                                    salutations distinguées.
                                                </p>

                                                <p style="font-size:15px;line-height:1.6;margin:18px 0 0 0;">
                                                    <strong>Le Service Crédits</strong><br>
                                                    Banque ERP Banking
                                                </p>

                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;
                                                padding:18px 32px;">
                                                <div style="font-size:11px;color:#94a3b8;line-height:1.5;">
                                                    Ce message est un courriel automatique émis par le système
                                                    d'information de la Banque ERP Banking. Merci de ne pas y
                                                    répondre directement.
                                                </div>
                                            </td>
                                        </tr>

                                    </table>

                                </td>
                            </tr>
                        </table>

                    </body>
                    </html>
                    """
                    .replace("{{nomClient}}", nomClient == null ? "" : nomClient)
                    .replace("{{numeroOffre}}", numeroOffre == null ? "" : numeroOffre)
                    .replace("{{lienAccepter}}", lienAccepter)
                    .replace("{{lienRefuser}}", lienRefuser);


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

    // =========================================================
    // CODE OTP DE REINITIALISATION DU MOT DE PASSE MOBILE
    // =========================================================

    /**
     * Envoie le code de reinitialisation par e-mail.
     *
     * Volontairement synchrone et sans catch : si l'e-mail ne part pas, le
     * service appelant doit le savoir et ne pas annoncer un envoi reussi.
     */
    public void envoyerCodeReinitialisation(
            String emailClient,
            String nomClient,
            String code
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(mailUsername);
        message.setTo(emailClient);
        message.setSubject("Code de reinitialisation - ERP Banking");

        message.setText(
                "Bonjour " + nomClient + ",\n\n" +

                "Votre code de reinitialisation de mot de passe est :\n\n" +

                "        " + code + "\n\n" +

                "Ce code est valable pendant 10 minutes.\n" +
                "Il ne peut etre utilise qu'une seule fois.\n\n" +

                "Si vous n'etes pas a l'origine de cette demande, ignorez " +
                "cet e-mail : votre mot de passe reste inchange.\n\n" +

                "Cordialement,\n" +
                "L'equipe de votre banque"
        );

        mailSender.send(message);

        System.out.println(
                "EMAIL OTP REINITIALISATION ENVOYE A : " + emailClient
        );
    }
}