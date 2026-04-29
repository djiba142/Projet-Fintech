const { 
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
    Header, Footer, AlignmentType, HeadingLevel, BorderStyle, 
    WidthType, ShadingType, PageNumber, TableOfContents, 
    LevelFormat, VerticalAlign
} = require('docx');
const fs = require('fs');

// Constants for Page Layout (US Letter)
const PAGE_WIDTH = 12240;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

// Borders helper
const borderThin = { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" };
const bordersThin = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };

// Create the document
const doc = new Document({
    title: "Kandjou Fintech - Spécifications",
    styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 36, bold: true, font: "Arial", color: "006233" },
                paragraph: { spacing: { before: 400, after: 300 }, outlineLevel: 0 }
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 28, bold: true, font: "Arial", color: "1A2B4B" },
                paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 1 }
            }
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: PAGE_WIDTH, height: 15840 },
                margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
            }
        },
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "KANDJOU FINTECH | Dossier de Spécifications", bold: true, color: "006233", size: 18 }),
                            new TextRun({ text: "\tConfidentiel", size: 14 })
                        ],
                        tabStops: [{ type: "right", position: CONTENT_WIDTH }]
                    }),
                    new Paragraph({
                        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "006233", space: 1 } }
                    })
                ]
            })
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 1 } }
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "© 2026 Kandjou Fintech • Tous droits réservés • Page ", size: 16 }),
                            new TextRun({ children: [PageNumber.CURRENT], size: 16 })
                        ]
                    })
                ]
            })
        },
        children: [
            // COVER PAGE
            new Paragraph({ spacing: { before: 2000 } }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "KANDJOU FINTECH", bold: true, size: 72, color: "006233" })]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "L'intelligence financière au service de la Guinée", italic: true, size: 28, color: "1A2B4B" })]
            }),
            new Paragraph({ spacing: { before: 1000 } }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Dossier de Spécifications Fonctionnelles & Techniques", bold: true, size: 32 })]
            }),
            new Paragraph({ spacing: { before: 4000 } }),
            new Table({
                width: { size: CONTENT_WIDTH, type: WidthType.DXA },
                columnWidths: [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                borders: { bottom: borderThin },
                                children: [new Paragraph({ children: [new TextRun({ text: "Version: 2.0 (Kandjou Rebrand)", bold: true })] })]
                            }),
                            new TableCell({
                                borders: { bottom: borderThin },
                                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Date: 28 Avril 2026", bold: true })] })]
                            })
                        ]
                    })
                ]
            }),

            // TABLE OF CONTENTS
            new Paragraph({ pageBreakBefore: true }),
            new Heading1("Table des Matières"),
            new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),

            // INTRODUCTION
            new Paragraph({ pageBreakBefore: true }),
            new Heading1("1. Introduction et Vision"),
            new Paragraph({
                children: [
                    new TextRun("Kandjou est une plateforme fintech innovante conçue pour l'écosystème guinéen. "),
                    new TextRun("Elle agit en tant qu'Account Information Service Provider (AISP) en agrégeant les comptes Mobile Money (Orange Money et MTN) "),
                    new TextRun("dans une interface unique, sécurisée et intelligente.")
                ]
            }),
            new Paragraph({
                spacing: { before: 200 },
                children: [
                    new TextRun("L'objectif est de permettre aux utilisateurs (particuliers et commerçants) de consolider leur patrimoine financier "),
                    new TextRun("numérique et de générer un score de solvabilité fiable pour faciliter l'accès au crédit auprès des institutions de microfinance.")
                ]
            }),

            // FONCTIONNALITES
            new Heading1("2. Spécifications Fonctionnelles"),
            new Paragraph("La plateforme s'articule autour de 10 interfaces clés, assurant une expérience utilisateur premium et conforme aux standards de la BCRG."),
            
            new Heading2("2.1. Tableau de Bord Client (Consolidé)"),
            new Paragraph({
                children: [
                    new TextRun("L'interface principale affiche le "),
                    new TextRun({ text: "Solde Total Consolidé", bold: true }),
                    new TextRun(" (ex: 12 847 500 GNF) fusionnant les avoirs Orange et MTN. "),
                    new TextRun("Elle propose également une analyse graphique des flux (entrées/sorties) sur les 30 derniers jours.")
                ]
            }),

            new Heading2("2.2. Score de Solvabilité (Credit Scoring)"),
            new Paragraph({
                children: [
                    new TextRun("Kandjou calcule en temps réel un score de 0 à 100 basé sur les habitudes transactionnelles. "),
                    new TextRun("Le score est certifié et peut être partagé avec des partenaires financiers pour des demandes de micro-crédit.")
                ]
            }),

            new Heading2("2.3. Portails Acteurs (RBAC)"),
            new Table({
                width: { size: CONTENT_WIDTH, type: WidthType.DXA },
                columnWidths: [CONTENT_WIDTH * 0.3, CONTENT_WIDTH * 0.7],
                rows: [
                    ["Acteur", "Rôle et Droits"],
                    ["Client", "Consultation soldes, historique, score personnel, transferts inter-réseaux."],
                    ["Agent de Crédit", "Analyse des dossiers clients, consultation des scores (avec consentement), gestion des dossiers."],
                    ["Administrateur", "Supervision système, monitoring des API, gestion des utilisateurs et logs."],
                    ["Régulateur (BCRG)", "Consultation des logs d'audit, surveillance de la conformité, rapports statistiques."]
                ].map((row, i) => new TableRow({
                    children: row.map(cell => new TableCell({
                        borders: bordersThin,
                        shading: i === 0 ? { fill: "F1F5F9", type: ShadingType.CLEAR } : undefined,
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        children: [new Paragraph({ children: [new TextRun({ text: cell, bold: i === 0 })] })]
                    }))
                }))
            }),

            // ARCHITECTURE TECHNIQUE
            new Heading1("3. Architecture Technique"),
            new Paragraph("Kandjou repose sur une architecture micro-services modulaire garantissant scalabilité et sécurité."),
            
            new Heading2("3.1. Agrégation via API REST"),
            new Paragraph({
                children: [
                    new TextRun("Le système se connecte via des adaptateurs sécurisés aux API d'Orange et MTN. "),
                    new TextRun("Les données sont normalisées au format JSON standardisé conforme aux directives Open Banking de la BCRG.")
                ]
            }),

            new Heading2("3.2. Sécurité et Conformité"),
            new BulletPoint("Chiffrement des données de bout en bout (TLS 1.3)."),
            new BulletPoint("Double authentification (2FA) via OTP pour chaque connexion."),
            new BulletPoint("Traçabilité complète des accès via un registre d'audit immuable."),
            new BulletPoint("Conformité stricte au règlement BCRG n°001/2019 sur les paiements électroniques.")
        ]
    }]
});

// Helpers
function Heading1(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_1 }); }
function Heading2(text) { return new Paragraph({ text, heading: HeadingLevel.HEADING_2 }); }
function BulletPoint(text) { 
    return new Paragraph({ 
        children: [new TextRun({ text: "• ", bold: true }), new TextRun(text)],
        indent: { left: 720, hanging: 360 }
    }); 
}

// Generate the file
Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync("Kandjou_Specifications_Final.docx", buffer);
    console.log("Document 'Kandjou_Specifications_Final.docx' généré avec succès.");
});
