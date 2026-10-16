package com.erpbanking.credit.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.erpbanking.client.entity.Client;
import com.erpbanking.credit.entity.DemandeCredit;
import com.erpbanking.credit.entity.OffreCredit;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;

/**
 * Génère le PDF de l'offre de crédit.
 *
 * Le rendu reproduit l'aperçu A4 affiché côté front
 * (OffreCreditDetail.jsx) : même en-tête, mêmes sections numérotées,
 * même tableau de conditions, même bloc de coût et mêmes signatures.
 */
@Service
public class OffrePdfService {

    // Palette identique à l'aperçu web
    private static final Color DARK = new Color(31, 41, 55);        // #1f2937
    private static final Color MUTED = new Color(100, 116, 139);    // #64748b
    private static final Color BORDER = new Color(203, 213, 225);   // #cbd5e1
    private static final Color HEADER_BG = new Color(241, 245, 249); // #f1f5f9
    private static final Color FOOTER = new Color(148, 163, 184);   // #94a3b8

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final List<String> DOCUMENTS_PAR_DEFAUT = List.of(
            "Pièce d'identité",
            "Justificatif de domicile",
            "Justificatifs de revenus",
            "Contrat de travail",
            "Relevés de compte",
            "Documents relatifs au projet financé"
    );

    public byte[] genererPdfOffre(OffreCredit offre) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 45, 45, 40, 45);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 17, Font.BOLD, DARK);
            Font brandFont = new Font(Font.HELVETICA, 9, Font.NORMAL, MUTED);
            Font refLabelFont = new Font(Font.HELVETICA, 9, Font.BOLD, DARK);
            Font refValueFont = new Font(Font.HELVETICA, 9, Font.NORMAL, DARK);
            Font sectionFont = new Font(Font.HELVETICA, 11, Font.BOLD, DARK);
            Font labelFont = new Font(Font.HELVETICA, 9, Font.BOLD, DARK);
            Font valueFont = new Font(Font.HELVETICA, 9, Font.NORMAL, DARK);
            Font noteFont = new Font(Font.HELVETICA, 8, Font.ITALIC, MUTED);
            Font footerFont = new Font(Font.HELVETICA, 7, Font.NORMAL, FOOTER);

            Client client = offre.getClient();
            DemandeCredit demande = offre.getDemandeCredit();

            // ---------- En-tête ----------
            ajouterEntete(document, offre, titleFont, brandFont, refLabelFont, refValueFont);

            // ---------- 1. Emprunteur ----------
            ajouterTitreSection(document, "1. Informations sur l'emprunteur", sectionFont);
            document.add(grilleInfos(client, demande, labelFont, valueFont));

            // ---------- 2. Conditions du crédit ----------
            ajouterTitreSection(document, "2. Conditions du crédit", sectionFont);
            document.add(tableConditions(offre, demande, labelFont, valueFont));

            // ---------- 3. Coût du crédit ----------
            ajouterTitreSection(document, "3. Coût du crédit", sectionFont);
            document.add(boiteCout(offre, labelFont, valueFont));
            document.add(new Paragraph(
                    "Les montants indiqués sont calculés automatiquement "
                            + "par le système selon les conditions du crédit.",
                    noteFont));

            // ---------- 4. Conditions ----------
            ajouterTitreSection(document, "4. Conditions", sectionFont);
            document.add(new Paragraph(
                    offre.getConditions() != null && !offre.getConditions().isBlank()
                            ? offre.getConditions()
                            : "Selon les conditions générales de l'offre.",
                    valueFont));

            // ---------- 5. Documents requis ----------
            ajouterTitreSection(document, "5. Documents requis", sectionFont);
            document.add(listeDocuments(valueFont));

            // ---------- 6. Décision du client ----------
            ajouterTitreSection(document, "6. Décision du client", sectionFont);
            Paragraph decisionIntro = new Paragraph(
                    "Après avoir pris connaissance des conditions de la présente offre, "
                            + "le client peut choisir :",
                    valueFont);
            decisionIntro.setSpacingAfter(10);
            document.add(decisionIntro);

            Paragraph cases = new Paragraph();
            cases.add(new Chunk("[    ]   Accepter l'offre          ", valueFont));
            cases.add(new Chunk("[    ]   Refuser l'offre", valueFont));
            document.add(cases);

            // ---------- Signatures ----------
            document.add(new Paragraph(" "));
            document.add(tableSignatures(labelFont, valueFont));

            // ---------- Pied de page ----------
            document.add(new Paragraph(" "));
            ajouterLigne(document, BORDER, 0.5f);
            document.add(piedDePage(offre, footerFont));

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF de l'offre", e);
        }

        return out.toByteArray();
    }

    // =====================================================
    // EN-TÊTE
    // =====================================================

    private void ajouterEntete(
            Document doc,
            OffreCredit offre,
            Font titleFont,
            Font brandFont,
            Font refLabelFont,
            Font refValueFont
    ) throws DocumentException {

        PdfPTable header = new PdfPTable(new float[] { 68, 32 });
        header.setWidthPercentage(100);

        PdfPCell titreCell = new PdfPCell();
        titreCell.setBorder(Rectangle.NO_BORDER);
        titreCell.setPadding(0);

        Paragraph titre = new Paragraph("OFFRE DE CRÉDIT", titleFont);
        titre.setSpacingAfter(2);
        titreCell.addElement(titre);
        titreCell.addElement(new Paragraph("Banque ERP Banking", brandFont));
        header.addCell(titreCell);

        PdfPCell refCell = new PdfPCell();
        refCell.setBorder(Rectangle.NO_BORDER);
        refCell.setPadding(0);

        Paragraph ref = new Paragraph();
        ref.setAlignment(Element.ALIGN_RIGHT);
        ref.add(new Chunk("Référence : ", refLabelFont));
        ref.add(new Chunk(
                offre.getNumeroOffre() != null ? offre.getNumeroOffre() : "#" + offre.getId(),
                refValueFont));
        ref.add(Chunk.NEWLINE);
        ref.add(new Chunk("Date : ", refLabelFont));
        ref.add(new Chunk(formatDate(offre.getDateOffre()), refValueFont));
        refCell.addElement(ref);
        header.addCell(refCell);

        doc.add(header);
        ajouterLigne(doc, DARK, 1f);
        doc.add(new Paragraph(" "));
    }

    // =====================================================
    // 1. GRILLE EMPRUNTEUR
    // =====================================================

    private PdfPTable grilleInfos(
            Client client,
            DemandeCredit demande,
            Font labelFont,
            Font valueFont
    ) throws DocumentException {

        PdfPTable table = new PdfPTable(new float[] { 50, 50 });
        table.setWidthPercentage(100);

        table.addCell(cellInfo(
                "Client :", nomComplet(client), labelFont, valueFont));
        table.addCell(cellInfo(
                "Numéro client :",
                client != null && client.getId() != null ? String.valueOf(client.getId()) : "-",
                labelFont, valueFont));
        table.addCell(cellInfo(
                "Profession :", valeur(demande != null ? demande.getProfession() : null),
                labelFont, valueFont));
        table.addCell(cellInfo(
                "Type de contrat :", valeur(demande != null ? demande.getTypeContrat() : null),
                labelFont, valueFont));

        table.setSpacingAfter(4);
        return table;
    }

    private PdfPCell cellInfo(String label, String valeur, Font labelFont, Font valueFont) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", labelFont));
        p.add(new Chunk(valeur, valueFont));

        PdfPCell cell = new PdfPCell(p);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingTop(3);
        cell.setPaddingBottom(3);
        cell.setPaddingLeft(0);
        return cell;
    }

    // =====================================================
    // 2. CONDITIONS DU CRÉDIT
    // =====================================================

    private PdfPTable tableConditions(
            OffreCredit offre,
            DemandeCredit demande,
            Font labelFont,
            Font valueFont
    ) throws DocumentException {

        PdfPTable table = new PdfPTable(new float[] { 55, 45 });
        table.setWidthPercentage(100);

        table.addCell(cellEntete("Élément", labelFont));
        table.addCell(cellEntete("Détail", labelFont));

        table.addCell(cellLigne("Montant du crédit", labelFont));
        table.addCell(cellLigne(formatMontant(offre.getMontantPropose()), valueFont));

        table.addCell(cellLigne("Durée", labelFont));
        table.addCell(cellLigne(
                offre.getDuree() != null ? offre.getDuree() + " mois" : "-", valueFont));

        table.addCell(cellLigne("Taux d'intérêt annuel", labelFont));
        table.addCell(cellLigne(
                offre.getTauxInteret() != null ? offre.getTauxInteret() + " %" : "-", valueFont));

        table.addCell(cellLigne("Mensualité", labelFont));
        table.addCell(cellLigne(formatMontant(offre.getMensualite()), valueFont));

        table.addCell(cellLigne("Nombre de mensualités", labelFont));
        table.addCell(cellLigne(
                offre.getDuree() != null ? String.valueOf(offre.getDuree()) : "-", valueFont));

        table.addCell(cellLigne("Objet du crédit", labelFont));
        table.addCell(cellLigne(
                valeur(demande != null ? demande.getMotif() : null), valueFont));

        table.setSpacingAfter(4);
        return table;
    }

    private PdfPCell cellEntete(String texte, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(texte, font));
        cell.setBackgroundColor(HEADER_BG);
        cell.setBorderColor(BORDER);
        cell.setPadding(6);
        return cell;
    }

    private PdfPCell cellLigne(String texte, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(texte, font));
        cell.setBorderColor(BORDER);
        cell.setPadding(6);
        return cell;
    }

    // =====================================================
    // 3. COÛT DU CRÉDIT
    // =====================================================

    private PdfPTable boiteCout(
            OffreCredit offre,
            Font labelFont,
            Font valueFont
    ) throws DocumentException {

        BigDecimal montant = offre.getMontantPropose();

        BigDecimal total = null;
        if (offre.getMensualite() != null && offre.getDuree() != null) {
            total = offre.getMensualite().multiply(BigDecimal.valueOf(offre.getDuree()));
        }

        BigDecimal interets = (total != null && montant != null)
                ? total.subtract(montant)
                : null;

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);

        table.addCell(cellCout("Montant emprunté", formatMontant(montant), labelFont, valueFont));
        table.addCell(cellCout("Intérêts estimés",
                interets != null ? formatMontant(interets) : "-", labelFont, valueFont));
        table.addCell(cellCout("Total à rembourser",
                total != null ? formatMontant(total) : "-", labelFont, valueFont));

        table.setSpacingAfter(6);
        return table;
    }

    private PdfPCell cellCout(String label, String valeur, Font labelFont, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(BORDER);
        cell.setPadding(8);

        Paragraph l = new Paragraph(label, new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED));
        l.setSpacingAfter(3);
        cell.addElement(l);
        cell.addElement(new Paragraph(valeur, new Font(Font.HELVETICA, 10, Font.BOLD, DARK)));

        return cell;
    }

    // =====================================================
    // 5. DOCUMENTS REQUIS
    // =====================================================

    private PdfPTable listeDocuments(Font valueFont) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        for (String doc : DOCUMENTS_PAR_DEFAUT) {
            PdfPCell cell = new PdfPCell(new Paragraph("• " + doc, valueFont));
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setPaddingTop(2);
            cell.setPaddingBottom(2);
            cell.setPaddingLeft(0);
            table.addCell(cell);
        }

        if (DOCUMENTS_PAR_DEFAUT.size() % 2 != 0) {
            PdfPCell vide = new PdfPCell(new Paragraph(""));
            vide.setBorder(Rectangle.NO_BORDER);
            table.addCell(vide);
        }

        table.setSpacingAfter(4);
        return table;
    }

    // =====================================================
    // SIGNATURES
    // =====================================================

    private PdfPTable tableSignatures(Font labelFont, Font valueFont) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] { 50, 50 });
        table.setWidthPercentage(100);

        PdfPCell client = new PdfPCell();
        client.setBorder(Rectangle.NO_BORDER);
        client.setPadding(0);
        client.setPaddingRight(30);
        Paragraph cTitre = new Paragraph("Signature du client", labelFont);
        cTitre.setSpacingAfter(30);
        client.addElement(cTitre);
        client.addElement(ligneSignature());
        client.addElement(new Paragraph("Date : ____ / ____ / ________", valueFont));
        table.addCell(client);

        PdfPCell banque = new PdfPCell();
        banque.setBorder(Rectangle.NO_BORDER);
        banque.setPadding(0);
        Paragraph bTitre = new Paragraph("Signature de la banque", labelFont);
        bTitre.setSpacingAfter(30);
        banque.addElement(bTitre);
        banque.addElement(ligneSignature());
        banque.addElement(new Paragraph("Date : ____ / ____ / ________", valueFont));
        table.addCell(banque);

        return table;
    }

    private Paragraph ligneSignature() {
        return new Paragraph(
                new Chunk(new LineSeparator(0.5f, 100, DARK, Element.ALIGN_CENTER, 0)));
    }

    // =====================================================
    // PIED DE PAGE
    // =====================================================

    private PdfPTable piedDePage(OffreCredit offre, Font footerFont) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] { 50, 50 });
        table.setWidthPercentage(100);

        PdfPCell left = new PdfPCell(new Paragraph("Banque ERP Banking", footerFont));
        left.setBorder(Rectangle.NO_BORDER);
        left.setPadding(0);
        table.addCell(left);

        PdfPCell right = new PdfPCell(new Paragraph(
                "Offre de crédit — "
                        + (offre.getNumeroOffre() != null ? offre.getNumeroOffre() : "#" + offre.getId()),
                footerFont));
        right.setBorder(Rectangle.NO_BORDER);
        right.setPadding(0);
        right.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(right);

        return table;
    }

    // =====================================================
    // OUTILS
    // =====================================================

    private void ajouterTitreSection(Document doc, String titre, Font font) throws DocumentException {
        Paragraph p = new Paragraph(titre, font);
        p.setSpacingBefore(12);
        p.setSpacingAfter(5);
        doc.add(p);
        ajouterLigne(doc, BORDER, 0.5f);
        doc.add(new Paragraph(" "));
    }

    private void ajouterLigne(Document doc, Color couleur, float epaisseur) throws DocumentException {
        LineSeparator ls = new LineSeparator(epaisseur, 100, couleur, Element.ALIGN_CENTER, -2);
        doc.add(new Chunk(ls));
    }

    private String formatMontant(BigDecimal montant) {
        if (montant == null) {
            return "-";
        }

        NumberFormat nf = NumberFormat.getInstance(Locale.FRANCE);
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);

        return nf.format(montant)
                .replace('\u202F', ' ')
                .replace('\u00A0', ' ')
                + " Ar";
    }

    private String formatDate(LocalDate date) {
        return date == null ? "-" : date.format(DATE_FMT);
    }

    private String formatDate(LocalDateTime date) {
        return date == null ? "-" : date.format(DATE_FMT);
    }

    private String nomComplet(Client client) {
        if (client == null) {
            return "-";
        }

        String nom = client.getNom() == null ? "" : client.getNom();
        String prenom = client.getPrenom() == null ? "" : client.getPrenom();
        String complet = (nom + " " + prenom).trim();

        return complet.isEmpty() ? "-" : complet;
    }

    private String valeur(String v) {
        return (v == null || v.isBlank()) ? "-" : v;
    }
}
