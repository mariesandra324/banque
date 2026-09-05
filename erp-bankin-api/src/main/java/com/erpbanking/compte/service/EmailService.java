package com.erpbanking.compte.service;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;

    public void envoyerNumeroCompte(
            String emailClient,
            String nomClient,
            String numeroCompte,
            String iban,
            String cleRib,
            String codePersonnel
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(emailClient);
        message.setSubject("Confirmation de création de votre compte bancaire");

        message.setText(
                "Bonjour " + nomClient + ",\n\n" +

                "Nous vous confirmons la création de votre compte bancaire.\n\n" +

                "Informations de votre compte :\n" +
                "----------------------------------\n" +
                "Numéro de compte : " + numeroCompte + "\n" +
                "Clé RIB : " + cleRib + "\n" +
                "IBAN : " + iban + "\n" +
                "----------------------------------\n\n" +

                "code personnel: "+ codePersonnel +"\n\n" +

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
    }

    public void envoyerPinCarte(
            String emailClient,
            String nomClient,
            String numeroCarte,
            String pin
    ) {
         try {
        System.out.println("=================================");
        System.out.println("ENVOI EMAIL CARTE");
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

                "⚠️ IMPORTANT :\n" +
                "Pour votre sécurité, ne communiquez jamais votre code PIN "
                + "à une autre personne.\n\n" +

                "Nous vous recommandons de mémoriser votre PIN et de supprimer "
                + "cet email après l'avoir consulté.\n\n" +

                "Cordialement,\n" +
                "L'équipe de votre banque"
        );

        mailSender.send(message);
        System.out.println("EMAIL CARTE ENVOYÉ AVEC SUCCÈS");
        } catch (Exception e) {
        System.out.println("ERREUR ENVOI EMAIL CARTE");
        e.printStackTrace();
    }
    }

    public void envoyerConfirmationOffreAcceptee(
        String emailClient,
        String nomClient,
        String numeroOffre,
        String montant,
        String dateDebut
) {

    SimpleMailMessage message = new SimpleMailMessage();

    message.setTo(emailClient);
    message.setSubject("Confirmation d'acceptation de votre offre de crédit");

    message.setText(
            "Bonjour " + nomClient + ",\n\n" +
            "Nous avons le plaisir de vous informer que votre offre de crédit a été acceptée.\n\n" +
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
}

public void envoyerOffrePdf(String emailClient, String nomClient, String numeroOffre, byte[] pdf) {

    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(emailClient);
        helper.setSubject("Votre offre de crédit " + numeroOffre);
        helper.setText(
            "Bonjour " + nomClient + ",\n\n" +
            "Veuillez trouver ci-joint votre offre de crédit n°" + numeroOffre + ".\n" +
            "Pour l'accepter ou la refuser, veuillez consulter le lien qui vous a été communiqué.\n\n" +
            "Cordialement."
        );
        helper.addAttachment("offre-" + numeroOffre + ".pdf", new ByteArrayResource(pdf));

        mailSender.send(message);

    } catch (MessagingException e) {
        throw new RuntimeException("Erreur lors de l'envoi de l'offre par email", e);
    }
}

public void envoyerConfirmationOffreRefusee(String emailClient, String nomClient, String numeroOffre) {

    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(emailClient);
        helper.setSubject("Votre offre de crédit " + numeroOffre + " a été refusée");
        helper.setText(
            "Bonjour " + nomClient + ",\n\n" +
            "Nous confirmons que vous avez refusé l'offre de crédit n°" + numeroOffre + ".\n" +
            "N'hésitez pas à nous contacter pour toute nouvelle demande.\n\n" +
            "Cordialement."
        );

        mailSender.send(message);

    } catch (MessagingException e) {
        throw new RuntimeException("Erreur lors de l'envoi de la confirmation de refus", e);
    }
}
}
