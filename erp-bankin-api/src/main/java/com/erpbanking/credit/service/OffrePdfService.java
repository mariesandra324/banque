package com.erpbanking.credit.service;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Service;

import com.erpbanking.credit.entity.OffreCredit;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

@Service
public class OffrePdfService {

    public byte[] genererPdfOffre(OffreCredit offre) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titreFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font labelFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font valeurFont = new Font(Font.HELVETICA, 12, Font.NORMAL);

            // 1. Titre
            Paragraph titre = new Paragraph("Offre de Crédit", titreFont);
            titre.setAlignment(Element.ALIGN_CENTER);
            titre.setSpacingAfter(20);
            document.add(titre);

            // 2. Infos client / offre
            document.add(new Paragraph("Numéro d'offre : " + offre.getNumeroOffre(), valeurFont));
            document.add(new Paragraph(
                    "Client : " + offre.getClient().getNom() + " " + offre.getClient().getPrenom(),
                    valeurFont));
            document.add(Chunk.NEWLINE);

            // 3. Valeurs finales
            ajouterLigne(document, "Montant proposé", formatMontant(offre.getMontantPropose()), labelFont, valeurFont);
            ajouterLigne(document, "Taux d'intérêt", offre.getTauxInteret() + " %", labelFont, valeurFont);
            ajouterLigne(document, "Durée", offre.getDuree() + " mois", labelFont, valeurFont);
            ajouterLigne(document, "Mensualité", formatMontant(offre.getMensualite()), labelFont, valeurFont);

            // 4. Conditions
            if (offre.getConditions() != null && !offre.getConditions().isBlank()) {
                document.add(Chunk.NEWLINE);
                document.add(new Paragraph("Conditions particulières :", labelFont));
                document.add(new Paragraph(offre.getConditions(), valeurFont));
            }

            // 5. Validité
            document.add(Chunk.NEWLINE);
            document.add(new Paragraph(
                    "Cette offre est valable jusqu'au " + offre.getDateExpiration() + ".",
                    valeurFont));

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF de l'offre", e);
        }

        return out.toByteArray();
    }

    private void ajouterLigne(Document doc, String label, String valeur, Font labelFont, Font valeurFont)
            throws DocumentException {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " : ", labelFont));
        p.add(new Chunk(valeur, valeurFont));
        doc.add(p);
    }

    private String formatMontant(java.math.BigDecimal montant) {
        return String.format("%,.2f Ar", montant);
    }
}