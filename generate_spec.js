const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, Header, PageBreak, VerticalAlign,
} = require("docx");
const fs = require("fs");

// â”€â”€ Couleurs Kandjou â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  bleuProfond:  "0D2B4E",
  bleuPrimaire: "1565C0",
  bleuClair:    "1E88E5",
  cyanElec:     "06B6D4",
  vertSucces:   "166534",
  gris1:        "1E293B",
  gris2:        "334155",
  gris3:        "64748B",
  gris4:        "94A3B8",
  blanc:        "FFFFFF",
  fondSection:  "EFF6FF",
  fondTableau:  "F8FAFC",
  bordure:      "CBD5E1",
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const border = { style: BorderStyle.SINGLE, size: 1, color: C.bordure };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const cell = (text, opts = {}) => new TableCell({
  borders: opts.noBorder ? noBorders : borders,
  width: { size: opts.w || 2340, type: WidthType.DXA },
  shading: { fill: opts.fill || C.blanc, type: ShadingType.CLEAR },
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({
      text,
      bold: opts.bold || false,
      size: opts.size || 20,
      color: opts.color || C.gris1,
      font: "Arial",
    })],
  })],
});

const titre1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text, bold: true, size: 36, color: C.bleuProfond, font: "Arial" })],
});

const titre2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 160 },
  children: [new TextRun({ text, bold: true, size: 28, color: C.bleuPrimaire, font: "Arial" })],
});

const titre3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 120 },
  children: [new TextRun({ text, bold: true, size: 24, color: C.bleuClair, font: "Arial" })],
});

const para = (text, opts = {}) => new Paragraph({
  alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
  spacing: { before: 80, after: 80, line: 276 },
  children: [new TextRun({
    text,
    size: opts.size || 22,
    color: opts.color || C.gris1,
    bold: opts.bold || false,
    italics: opts.italic || false,
    font: "Arial",
  })],
});

const bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level },
  spacing: { before: 60, after: 60 },
  children: [new TextRun({ text, size: 22, color: C.gris1, font: "Arial" })],
});

const spacer = (n = 1) => Array(n).fill(new Paragraph({
  spacing: { before: 0, after: 0 },
  children: [new TextRun({ text: "" })],
}));

const ligne = () => new Paragraph({
  spacing: { before: 160, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.bleuClair, space: 1 } },
  children: [new TextRun({ text: "" })],
});

const badge = (text, fillColor) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 60, after: 60 },
  children: [new TextRun({
    text: `  ${text}  `,
    bold: true, size: 20,
    color: fillColor === C.bleuPrimaire ? C.blanc : C.bleuProfond,
    highlight: "cyan",
    font: "Arial",
  })],
});

// â”€â”€ Tableau de fonctionnalitÃ©s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tableauFonctionnalites = (lignes) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3120, 3120, 3120],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        cell("FonctionnalitÃ©", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3120, center: true }),
        cell("Description",    { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3120, center: true }),
        cell("PrioritÃ©",       { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3120, center: true }),
      ],
    }),
    ...lignes.map((l, i) => new TableRow({
      children: [
        cell(l[0], { w: 3120, bold: true, fill: i % 2 === 0 ? C.fondTableau : C.blanc }),
        cell(l[1], { w: 3120, fill: i % 2 === 0 ? C.fondTableau : C.blanc }),
        cell(l[2], { w: 3120, center: true, fill: i % 2 === 0 ? C.fondTableau : C.blanc,
          color: l[2] === "P1 â€” Critique" ? "991B1B" : l[2] === "P2 â€” Haute" ? "92400E" : C.vertSucces,
          bold: true }),
      ],
    })),
  ],
});

// â”€â”€ Tableau prioritÃ©s â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tableauPriorites = (lignes) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1560, 3900, 1560, 2340],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        cell("PrioritÃ©", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 1560, center: true }),
        cell("FonctionnalitÃ©", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 3900 }),
        cell("Module", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 1560, center: true }),
        cell("Statut", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 2340, center: true }),
      ],
    }),
    ...lignes.map((l, i) => new TableRow({
      children: [
        cell(l[0], { w: 1560, center: true, bold: true, fill: i % 2 === 0 ? C.fondTableau : C.blanc,
          color: l[0].includes("P1") ? "991B1B" : l[0].includes("P2") ? "92400E" : C.vertSucces }),
        cell(l[1], { w: 3900, fill: i % 2 === 0 ? C.fondTableau : C.blanc }),
        cell(l[2], { w: 1560, center: true, fill: i % 2 === 0 ? C.fondTableau : C.blanc, color: C.bleuClair }),
        cell(l[3], { w: 2340, center: true, fill: i % 2 === 0 ? C.fondTableau : C.blanc,
          color: l[3] === "OpÃ©rationnel" ? C.vertSucces : l[3] === "En cours" ? "92400E" : C.gris3 }),
      ],
    })),
  ],
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DOCUMENT PRINCIPAL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "â€¢",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }, {
          level: 1, format: LevelFormat.BULLET, text: "â—¦",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: C.bleuProfond },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: C.bleuPrimaire },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: C.bleuClair },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.cyanElec, space: 1 } },
          spacing: { after: 160 },
          children: [
            new TextRun({ text: "Kandjou FINTECH â€” ", bold: true, size: 18, color: C.bleuPrimaire, font: "Arial" }),
            new TextRun({ text: "SpÃ©cifications Fonctionnelles v1.0", size: 18, color: C.gris3, font: "Arial" }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.bordure, space: 1 } },
          spacing: { before: 120 },
          children: [
            new TextRun({ text: "Confidentiel â€” Kandjou Fintech â€” Conakry, GuinÃ©e 2026  |  Page ", size: 18, color: C.gris4, font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.gris4, font: "Arial" }),
            new TextRun({ text: " / ", size: 18, color: C.gris4, font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: C.gris4, font: "Arial" }),
          ],
        })],
      }),
    },
    children: [

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // PAGE DE TITRE
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 0 },
        children: [new TextRun({ text: "â—ˆ Kandjou", bold: true, size: 72, color: C.bleuProfond, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 0 },
        children: [new TextRun({ text: "Intelligence de CrÃ©dit", size: 32, color: C.cyanElec, font: "Arial", italics: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 640, after: 80 },
        children: [new TextRun({ text: "SpÃ©cifications Fonctionnelles", bold: true, size: 48, color: C.bleuPrimaire, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "FonctionnalitÃ©s Ã  DÃ©velopper avant l'IntÃ©gration IA", size: 28, color: C.gris3, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 320, after: 0 },
        children: [new TextRun({ text: "Version 1.0  â€”  Avril 2026", size: 22, color: C.gris4, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 0 },
        children: [new TextRun({ text: "UniversitÃ© Gamal Abdel Nasser de Conakry", size: 22, color: C.gris4, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 8, color: C.cyanElec, space: 1 } },
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 0 },
        children: [new TextRun({
          text: "Document confidentiel â€” Usage interne uniquement",
          size: 18, color: C.gris4, italics: true, font: "Arial",
        })],
      }),

      // Saut de page
      new Paragraph({ children: [new PageBreak()] }),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // 1. INTRODUCTION
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("1. Introduction et Contexte"),
      ligne(),
      ...spacer(1),

      titulo3_section("1.1 Vision du Produit"),
      para("Kandjou est une plateforme d'agrÃ©gation Mobile Money conÃ§ue pour le marchÃ© guinÃ©en. Elle permet aux agents de crÃ©dit des institutions financiÃ¨res d'obtenir en moins de 3 secondes un score de solvabilitÃ© consolidÃ© Ã  partir des donnÃ©es Orange Money et MTN MoMo d'un client."),
      ...spacer(1),
      para("Le prÃ©sent document dÃ©crit l'ensemble des fonctionnalitÃ©s devant Ãªtre dÃ©veloppÃ©es et validÃ©es AVANT l'intÃ©gration du moteur d'intelligence artificielle prÃ©vu en version 2.0. Ces fonctionnalitÃ©s constituent la fondation technique et fonctionnelle sur laquelle l'IA sera construite."),
      ...spacer(1),

      titulo3_section("1.2 Architecture Technique Actuelle"),
      para("Le systÃ¨me Kandjou repose sur une architecture monolithique modulaire :"),
      ...spacer(1),
      bullet("Module M1 â€” Core Aggregator (Python/FastAPI, port 8000/m1) : calcul du score, normalisation des donnÃ©es"),
      bullet("Module M2 â€” Simulateurs OpÃ©rateurs (Python/FastAPI, port 8000/m2) : simulation Orange Money et MTN MoMo"),
      bullet("Module M3 â€” Security Vault (Python/FastAPI, port 8000/m3) : OTP, tokens JWT, audit trail"),
      bullet("Module M4 â€” Frontend (React/Vite, port 5173) : interfaces Agent, Admin, Analyste Risque, Landing Page"),
      ...spacer(2),

      titulo3_section("1.3 NumÃ©ros de Test Disponibles (Mode DÃ©veloppement)"),
      para("En l'absence de vraies clÃ©s API Orange/MTN, les donnÃ©es simulÃ©es dans mock_data.py permettent de tester tous les flux :"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 2000, 2360, 2400],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell("MSISDN", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2600, center: true }),
            cell("OpÃ©rateur(s)", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2000, center: true }),
            cell("Solde simulÃ©", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2360, center: true }),
            cell("ScÃ©nario de test", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2400, center: true }),
          ]}),
          ...[
            ["224622123456", "Orange + MTN", "2 500 000 + 780 000 GNF", "Double opÃ©rateur â€” score Ã©levÃ©"],
            ["224623456789", "Orange + MTN", "850 000 + 1 500 000 GNF", "Double opÃ©rateur â€” score moyen"],
            ["224625999888", "Orange seul",  "4 200 000 GNF",            "Orange-only â€” mode dÃ©gradÃ© MTN"],
            ["224664789012", "MTN seul",     "3 750 000 GNF",            "MTN-only â€” mode dÃ©gradÃ© Orange"],
            ["224624111222", "Orange seul",  "120 000 GNF (SUSPENDU)",   "Compte suspendu â€” malus score"],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 2600, fill: i%2===0 ? C.fondTableau : C.blanc, bold: true }),
            cell(l[1], { w: 2000, fill: i%2===0 ? C.fondTableau : C.blanc, center: true }),
            cell(l[2], { w: 2360, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[3], { w: 2400, fill: i%2===0 ? C.fondTableau : C.blanc, color: C.gris3 }),
          ]})),
        ],
      }),
      ...spacer(1),
      para("Le code OTP est affichÃ© dans le terminal du module M3 en mode dÃ©veloppement. En production, il serait envoyÃ© par SMS via l'API de l'opÃ©rateur.", { italic: true, color: C.gris3 }),

      new Paragraph({ children: [new PageBreak()] }),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // 2. FONCTIONNALITÃ‰S BACKEND
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("2. FonctionnalitÃ©s Backend Ã  DÃ©velopper"),
      ligne(),
      ...spacer(1),

      titre2("2.1 Module M1 â€” Core Aggregator"),
      ...spacer(1),

      titulo3_section("2.1.1 Flux d'AgrÃ©gation Asynchrone"),
      para("L'agrÃ©gation est le cÅ“ur du systÃ¨me. Lorsqu'un agent soumet un MSISDN, M1 doit :"),
      ...spacer(1),
      bullet("Valider le MSISDN guinÃ©en (regex : 224 + 62[2-5]XXXXXX pour Orange, 224 + 664XXXXXX pour MTN)"),
      bullet("Appeler Orange et MTN en parallÃ¨le via asyncio.gather(return_exceptions=True)"),
      bullet("Normaliser les rÃ©ponses hÃ©tÃ©rogÃ¨nes (available_balance vs current_balance, status vs account_state)"),
      bullet("Appliquer le moteur de scoring V1 (score 0-100)"),
      bullet("Retourner l'objet AggregatedResponse en moins de 3 secondes"),
      ...spacer(1),
      para("CritÃ¨re d'acceptation : avec les deux simulateurs M2 actifs, un appel GET /m1/aggregate/224622123456 avec un token valide retourne un score dans les 3 secondes.", { bold: true }),
      ...spacer(1),

      titulo3_section("2.1.2 Gestion du Mode DÃ©gradÃ©"),
      para("Si un seul opÃ©rateur rÃ©pond, M1 doit continuer l'agrÃ©gation avec les donnÃ©es disponibles. Le score est calculÃ© sur la base des sources actives uniquement. Une rÃ©ponse 504 est retournÃ©e seulement si AUCUN opÃ©rateur ne rÃ©pond."),
      ...spacer(1),
      tableauFonctionnalites([
        ["Mode dÃ©gradÃ© Orange", "Calcul du score avec MTN uniquement si Orange timeout", "P1 â€” Critique"],
        ["Mode dÃ©gradÃ© MTN",    "Calcul du score avec Orange uniquement si MTN timeout", "P1 â€” Critique"],
        ["504 Gateway Timeout", "RÃ©ponse 504 si les deux opÃ©rateurs sont indisponibles",  "P1 â€” Critique"],
        ["Logging dÃ©gradÃ©",     "Log explicite en cas de mode dÃ©gradÃ© pour audit",       "P2 â€” Haute"],
      ]),
      ...spacer(2),

      titulo3_section("2.1.3 Moteur de Scoring V1 (Pattern Strategy)"),
      para("L'algorithme de scoring V1 est intentionnellement simple pour permettre l'extension future (V2 avec IA). Les rÃ¨gles actuelles :"),
      ...spacer(1),
      bullet("Base : 50 points"),
      bullet("Bonus solde : +10 si total > 1 000 000 GNF"),
      bullet("Bonus activitÃ© : +20 si derniÃ¨re activitÃ© dans les 24 heures"),
      bullet("Malus compte vide : -10 par compte Ã  solde nul"),
      bullet("Score bornÃ© entre 0 et 100"),
      ...spacer(1),
      para("Seuils de dÃ©cision : ELIGIBLE (71-100), RISQUE_MOYEN (41-70), REFUSE (0-40)."),
      ...spacer(2),

      titulo3_section("2.1.4 Double MSISDN (Orange + MTN sÃ©parÃ©s)"),
      para("Un client peut avoir deux numÃ©ros distincts chez Orange et MTN. M1 doit recevoir msisdn_orange et msisdn_mtn sÃ©parÃ©ment depuis le token M3 et appeler le bon opÃ©rateur avec le bon numÃ©ro."),
      ...spacer(1),
      para("CritÃ¨re d'acceptation : Orange 224622123456 + MTN 224664100001 retourne les deux soldes consolidÃ©s.", { bold: true }),
      ...spacer(2),

      titre2("2.2 Module M2 â€” Simulateurs OpÃ©rateurs"),
      ...spacer(1),

      titulo3_section("2.2.1 Routes Health Check"),
      para("Les endpoints /provider/orange/health et /provider/mtn/health doivent exister sÃ©parÃ©ment pour permettre au healthcheck de M1 de distinguer l'Ã©tat de chaque opÃ©rateur."),
      ...spacer(1),

      titulo3_section("2.2.2 ScÃ©narios de Test Enrichis"),
      tableauFonctionnalites([
        ["Compte double opÃ©rateur", "224622123456 rÃ©pond chez Orange ET MTN",          "P1 â€” Critique"],
        ["Orange-only",             "224625999888 rÃ©pond chez Orange, 404 chez MTN",   "P1 â€” Critique"],
        ["MTN-only",                "224664789012 rÃ©pond chez MTN, 404 chez Orange",   "P1 â€” Critique"],
        ["Compte suspendu",         "224624111222 retourne status SUSPENDED",          "P2 â€” Haute"],
        ["Panne Orange simulÃ©e",    "224622999999 retourne 503 chez Orange",           "P2 â€” Haute"],
        ["Panne MTN simulÃ©e",       "224664999999 retourne 503 chez MTN",              "P2 â€” Haute"],
        ["Timeout Orange",          "/provider/orange/simulate-timeout retourne 504",  "P2 â€” Haute"],
      ]),
      ...spacer(2),

      titre2("2.3 Module M3 â€” Security Vault"),
      ...spacer(1),

      titulo3_section("2.3.1 Gestion du Consentement Double MSISDN"),
      para("OTPRequest doit accepter msisdn_orange ET msisdn_mtn en paramÃ¨tres optionnels. Au moins un doit Ãªtre fourni. Les deux MSISDNs sont stockÃ©s dans le token_store et retournÃ©s par /auth/validate-token."),
      ...spacer(1),

      titulo3_section("2.3.2 Anti-Brute Force"),
      para("AprÃ¨s 3 tentatives OTP Ã©chouÃ©es pour une mÃªme session, la session doit Ãªtre rÃ©voquÃ©e et un HTTP 429 retournÃ©. Ce comportement doit Ãªtre testÃ© et documentÃ©."),
      ...spacer(1),

      titulo3_section("2.3.3 Expiration des Sessions"),
      para("Les OTP expirent en 3 minutes (180 secondes). Les tokens JWT expirent en 5 minutes (300 secondes). Ces valeurs doivent Ãªtre configurables via le fichier .env et documentÃ©es."),
      ...spacer(1),

      titulo3_section("2.3.4 Audit Trail"),
      tableauFonctionnalites([
        ["Log OTP Request",   "Enregistrer chaque demande d'OTP avec MSISDN et timestamp",        "P1 â€” Critique"],
        ["Log OTP Success",   "Enregistrer chaque validation rÃ©ussie avec session_id",             "P1 â€” Critique"],
        ["Log OTP Failure",   "Enregistrer chaque Ã©chec avec tentative numÃ©ro et raison",         "P1 â€” Critique"],
        ["Log Rate Limit",    "Enregistrer les blocages anti-brute force avec IP",                "P2 â€” Haute"],
        ["Export CSV",        "API GET /admin/audit/export pour export CSV des logs",             "P3 â€” Normale"],
      ]),
      ...spacer(2),

      titulo3_section("2.3.5 Endpoint Validation Token"),
      para("GET /m3/auth/validate-token doit retourner msisdn_orange, msisdn_mtn, et primary (le MSISDN principal) pour permettre Ã  M1 d'appeler le bon opÃ©rateur avec le bon numÃ©ro."),

      new Paragraph({ children: [new PageBreak()] }),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // 3. FONCTIONNALITÃ‰S FRONTEND
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("3. FonctionnalitÃ©s Frontend Ã  DÃ©velopper"),
      ligne(),
      ...spacer(1),

      titre2("3.1 Page Publique â€” Landing Page"),
      ...spacer(1),

      titulo3_section("3.1.1 Contenu de la Vitrine"),
      para("La landing page est la vitrine commerciale de Kandjou. Elle doit convaincre une banque ou une IMF en 30 secondes. Les sections obligatoires :"),
      ...spacer(1),
      bullet("Hero : titre accrocheur + visuels Orange/MTN + jauge 85/100 animÃ©e + CTA 'Demander une dÃ©mo'"),
      bullet("Comment Ã§a marche : 3 Ã©tapes (Consentement OTP â†’ AgrÃ©gation â†’ Score)"),
      bullet("SÃ©curitÃ© : badges conformitÃ© BCRG, flux de chiffrement AES-256/TLS, anti-brute force"),
      bullet("Pour les banques : statistiques (< 3s, 99.9% uptime, 2 opÃ©rateurs, 100% audit)"),
      bullet("DÃ©mo publique : saisie de numÃ©ro test avec rate limiting 3 essais/minute, score fictif"),
      bullet("FAQ : 4 questions sur la confidentialitÃ©, l'OTP, la conformitÃ© BCRG, les opÃ©rateurs"),
      bullet("Footer : liens, badges sÃ©curitÃ©, copyright"),
      ...spacer(1),

      titulo3_section("3.1.2 SÃ©curitÃ© de la Partie Publique"),
      tableauFonctionnalites([
        ["Rate Limiting Client",  "Maximum 3 essais de dÃ©mo par minute par session",           "P1 â€” Critique"],
        ["Score Fictif DÃ©mo",     "Aucun appel rÃ©seau rÃ©el en mode dÃ©mo â€” donnÃ©es simulÃ©es",   "P1 â€” Critique"],
        ["Disclaimer LÃ©gal",      "Mention explicite 'score indicatif â€” donnÃ©es simulÃ©es'",    "P1 â€” Critique"],
        ["Navbar Sticky",         "Navigation fixe avec effet scroll (backdrop-filter)",        "P2 â€” Haute"],
        ["Responsive Mobile",     "Adaptation pour tablettes et tÃ©lÃ©phones",                   "P2 â€” Haute"],
      ]),
      ...spacer(2),

      titre2("3.2 Dashboard Agent â€” AgentDashboard.jsx"),
      ...spacer(1),

      titulo3_section("3.2.1 Saisie Intelligente avec DÃ©tection d'OpÃ©rateur"),
      para("Le champ de saisie est le point d'entrÃ©e principal. Il doit Ãªtre intuitif pour un agent en GuinÃ©e :"),
      ...spacer(1),
      bullet("DÃ©tection automatique en temps rÃ©el : Orange (62[2-5]XXXXXX) ou MTN (664XXXXXX)"),
      bullet("Les logos Orange et MTN s'illuminent dynamiquement selon le numÃ©ro saisi"),
      bullet("Accepte les formats : avec indicatif 224, sans indicatif, avec espaces, avec tirets"),
      bullet("Masquage automatique dans l'audit : 224622***456 (protection des donnÃ©es)"),
      bullet("Guide de numÃ©ros de test accessible depuis le header (bouton ðŸ“‹)"),
      bullet("Saisie de deux numÃ©ros possibles : Orange ET MTN sÃ©parÃ©ment"),
      ...spacer(1),

      titulo3_section("3.2.2 Flux OTP â€” Ce qui s'affiche"),
      para("AprÃ¨s la saisie d'un numÃ©ro valide et le clic sur 'Lancer l'Analyse', le flux complet est :"),
      ...spacer(1),
      bullet("Ã‰tape 1 â€” Validation : chips de confirmation avec MSISDN masquÃ© + case consentement"),
      bullet("Ã‰tape 2 â€” OTP Modal : code Ã  6 chiffres avec indicateur de remplissage (6 points)"),
      bullet("Ã‰tape 3 â€” RÃ©sultats : grille complÃ¨te 3 colonnes avec toutes les donnÃ©es"),
      ...spacer(1),

      titulo3_section("3.2.3 Affichage des RÃ©sultats aprÃ¨s AgrÃ©gation"),
      para("C'est la partie la plus importante pour la soutenance. Voici exactement ce qui doit s'afficher aprÃ¨s qu'un agent entre un numÃ©ro et valide le consentement :"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3500, 3520],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell("Zone", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2340 }),
            cell("Contenu affichÃ©", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3500 }),
            cell("Source des donnÃ©es", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3520 }),
          ]}),
          ...[
            ["Jauge Score", "Score 0-100 animÃ©, couleur verte/orange/rouge selon seuil", "M1 â†’ credit_analysis.score"],
            ["Statut Risque", "ELIGIBLE / RISQUE MOYEN / REFUSÃ‰ avec badge colorÃ©", "M1 â†’ credit_analysis.status"],
            ["Recommandation", "Texte explicatif (ex: 'CapacitÃ© 750 000 GNF')", "M1 â†’ credit_analysis.recommendation"],
            ["Solde Orange", "Montant en GNF + logo Orange + statut ACTIF/NON TROUVÃ‰", "M1 â†’ consolidation.orange_balance"],
            ["Solde MTN", "Montant en GNF + logo MTN + statut ACTIF/NON DÃ‰TECTÃ‰", "M1 â†’ consolidation.mtn_balance"],
            ["Total ConsolidÃ©", "Somme des deux soldes en bleu, sources actives", "M1 â†’ consolidation.total_balance"],
            ["Historique", "3 derniÃ¨res analyses avec sparklines colorÃ©es", "DonnÃ©es locales mock"],
            ["Audit RÃ©cent", "4 derniers Ã©vÃ©nements avec heure, action, cible masquÃ©e", "Mis Ã  jour en temps rÃ©el"],
            ["Profil de Risque", "Graphique radar (5 critÃ¨res : Solde, ActivitÃ©, etc.)", "CalculÃ© depuis le score"],
            ["Tendances", "Graphique area (Solde Moyen 6M) + bar (Ã‰pargne)", "DonnÃ©es mock enrichies"],
            ["Rapport PDF", "Bouton blanc pour impression/export", "window.print()"],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 2340, bold: true, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[1], { w: 3500, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[2], { w: 3520, fill: i%2===0 ? C.fondTableau : C.blanc, color: C.gris3 }),
          ]})),
        ],
      }),
      ...spacer(2),

      titulo3_section("3.2.4 Comportement Sans Vraies ClÃ©s API"),
      para("Le systÃ¨me fonctionne entiÃ¨rement avec les simulateurs M2. Aucune vraie clÃ© API Orange ou MTN n'est nÃ©cessaire. Le flux complet est identique Ã  la production :"),
      ...spacer(1),
      bullet("224622123456 â†’ Orange : 2 500 000 GNF + MTN : 780 000 GNF â†’ Total : 3 280 000 GNF â†’ Score : ~80"),
      bullet("224625999888 â†’ Orange seul : 4 200 000 GNF â†’ MTN : NON TROUVÃ‰ â†’ Score : ~70 (mode dÃ©gradÃ©)"),
      bullet("224664789012 â†’ Orange : NON TROUVÃ‰ â†’ MTN seul : 3 750 000 GNF â†’ Score : ~68 (mode dÃ©gradÃ©)"),
      ...spacer(2),

      titre2("3.3 Dashboard Admin â€” AdminDashboard.jsx"),
      ...spacer(1),

      titulo3_section("3.3.1 Monitoring des Modules"),
      para("L'admin doit voir en temps rÃ©el l'Ã©tat des 3 modules backend. Un healthcheck est effectuÃ© toutes les 15 secondes vers GET /health. Les indicateurs affichÃ©s :"),
      bullet("M1 Aggregator : ONLINE/OFFLINE + latence mesurÃ©e"),
      bullet("M2 Simulators : ONLINE/OFFLINE + latence mesurÃ©e"),
      bullet("M3 Security : ONLINE/OFFLINE + latence mesurÃ©e"),
      ...spacer(1),

      titulo3_section("3.3.2 Gestion des Utilisateurs"),
      tableauFonctionnalites([
        ["Liste utilisateurs",    "Tableau avec nom, email, rÃ´le, derniÃ¨re activitÃ©, statut",  "P1 â€” Critique"],
        ["Suspendre un compte",   "Bouton toggle ACTIVE â†’ SUSPENDED avec confirmation",        "P1 â€” Critique"],
        ["Badge rÃ´les",           "Violet (Admin), Bleu (Agent), Ambre (Risk Manager)",        "P2 â€” Haute"],
        ["Ajouter utilisateur",   "Bouton + Nouvel utilisateur (modal ou page dÃ©diÃ©e)",        "P3 â€” Normale"],
        ["RÃ©initialiser MDP",     "Envoi email de rÃ©initialisation (en V2)",                   "P3 â€” Normale"],
      ]),
      ...spacer(1),

      titulo3_section("3.3.3 IPs BloquÃ©es"),
      para("La section 'SÃ©curitÃ© : IPs BloquÃ©es' affiche les adresses IP bannies par l'anti-brute force avec la raison du blocage, la date, et deux actions : DÃ©bloquer (vert) ou Maintenir le blocage (rouge)."),
      ...spacer(2),

      titre2("3.4 Dashboard Risque â€” RiskDashboard.jsx"),
      ...spacer(1),

      titulo3_section("3.4.1 Indicateurs ClÃ©s de Performance (KPIs)"),
      bullet("Total Scorings : nombre cumulÃ© d'analyses effectuÃ©es"),
      bullet("Taux d'Approbation : pourcentage de scores >= seuil actuel"),
      bullet("Volume CrÃ©dit EstimÃ© : somme des capacitÃ©s d'emprunt des profils ELIGIBLE"),
      ...spacer(1),

      titulo3_section("3.4.2 Graphique d'Ã‰volution de SolvabilitÃ©"),
      para("Courbe linÃ©aire SVG native (sans dÃ©pendance recharts) reprÃ©sentant l'Ã©volution du score moyen sur la semaine. Axes Lun-Dim, graduation 0-80, aire dÃ©gradÃ©e bleue."),
      ...spacer(1),

      titulo3_section("3.4.3 Gestionnaire de Seuils (Slider)"),
      para("Le slider permet Ã  l'analyste risque de dÃ©finir le seuil de scoring minimal pour l'Ã©ligibilitÃ©. Fonctionnement attendu :"),
      ...spacer(1),
      bullet("Valeur par dÃ©faut : 65"),
      bullet("DÃ©gradÃ© colorÃ© : vert (0-50) â†’ orange (50-75) â†’ rouge (75-100)"),
      bullet("Mise Ã  jour en temps rÃ©el du pourcentage estimÃ© de profils Ã©ligibles"),
      bullet("Tooltip contextuel : 'Profils au-dessus sont FAVORABLES'"),
      bullet("Note MVP : le seuil est stockÃ© en Ã©tat local React (pas persistÃ© en base de donnÃ©es)"),
      ...spacer(2),

      titre2("3.5 Page Audit & SÃ©curitÃ© â€” AuditPage.jsx"),
      ...spacer(1),

      titulo3_section("3.5.1 MÃ©triques de SÃ©curitÃ© Temps RÃ©el"),
      para("Six cartes de mÃ©triques mises Ã  jour en temps rÃ©el :"),
      bullet("Chiffrement : AES-256 (toujours vert)"),
      bullet("Transport : HTTPS/TLS 1.3 (toujours vert)"),
      bullet("Tokens actifs : nombre de JWT valides en mÃ©moire M3"),
      bullet("IPs bloquÃ©es : nombre d'adresses bannies (orange si > 0)"),
      bullet("OTP derniÃ¨re heure : nombre de codes gÃ©nÃ©rÃ©s"),
      bullet("Tentatives Ã©chouÃ©es : nombre d'Ã©checs OTP (orange si > 0)"),
      ...spacer(1),

      titulo3_section("3.5.2 Flux de Chiffrement"),
      para("Diagramme horizontal en 5 Ã©tapes reprÃ©sentant le flux sÃ©curisÃ© : Client â†’ HTTPS TLS â†’ OTP M3 â†’ M1 AgrÃ©gateur â†’ OpÃ©rateurs M2. Le nÅ“ud M3 est mis en Ã©vidence (bord cyan, fond teintÃ©)."),
      ...spacer(1),

      titulo3_section("3.5.3 Registre d'Audit"),
      tableauFonctionnalites([
        ["Affichage des logs",  "Tableau avec ID, horodatage, acteur, action, cible masquÃ©e, statut", "P1 â€” Critique"],
        ["Filtre par statut",   "Boutons ALL / SuccÃ¨s / BloquÃ©s",                                    "P2 â€” Haute"],
        ["Recherche textuelle", "Filtrage par utilisateur, action ou cible",                         "P2 â€” Haute"],
        ["Export CSV",          "TÃ©lÃ©chargement du journal filtrÃ© au format CSV",                    "P2 â€” Haute"],
        ["Note lÃ©gale BCRG",   "Mention : logs immuables conservÃ©s 12 mois",                        "P1 â€” Critique"],
        ["Horodatage prÃ©cis",  "Format YYYY-MM-DD HH:MM:SS en police monospace",                    "P2 â€” Haute"],
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // 4. SÃ‰CURITÃ‰ & CONFORMITÃ‰
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("4. SÃ©curitÃ© et ConformitÃ©"),
      ligne(),
      ...spacer(1),

      titre2("4.1 Stack de SÃ©curitÃ©"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell("Couche", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 2340, center: true }),
            cell("Technologie", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 2340, center: true }),
            cell("Usage", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 2340, center: true }),
            cell("Statut MVP", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 2340, center: true }),
          ]}),
          ...[
            ["Transport",         "HTTPS / TLS 1.3",    "Chiffrement des communications", "SimulÃ© (HTTP local)"],
            ["DonnÃ©es au repos",  "AES-256",            "Chiffrement des donnÃ©es stockÃ©es","Ã€ implÃ©menter en V2"],
            ["Authentification",  "JWT HS256",          "Tokens 5min TTL via M3",          "OpÃ©rationnel"],
            ["Consentement",      "OTP 6 chiffres",     "Validation client 3min TTL",       "OpÃ©rationnel"],
            ["Anti-brute force",  "Max 3 tentatives",   "Blocage session aprÃ¨s 3 Ã©checs",   "OpÃ©rationnel"],
            ["Rate limiting",     "5 req/min par IP",   "Protection API publique",          "Partiel"],
            ["Audit trail",       "Logs en mÃ©moire",    "TraÃ§abilitÃ© complÃ¨te Ã©vÃ©nements",  "OpÃ©rationnel"],
            ["BCRG ConformitÃ©",   "Audit 12 mois",      "Conservation des logs rÃ©glementaire","Ã€ implÃ©menter"],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 2340, bold: true, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[1], { w: 2340, fill: i%2===0 ? C.fondTableau : C.blanc, color: C.bleuClair }),
            cell(l[2], { w: 2340, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[3], { w: 2340, fill: i%2===0 ? C.fondTableau : C.blanc,
              color: l[3] === "OpÃ©rationnel" ? C.vertSucces : l[3].includes("V2") ? C.gris3 : "92400E" }),
          ]})),
        ],
      }),
      ...spacer(2),

      titre2("4.2 Validation des MSISDNs GuinÃ©ens"),
      para("La regex de validation est le premier rempart contre les injections. Elle est implÃ©mentÃ©e Ã  deux niveaux (frontend et backend) et doit Ãªtre strictement synchronisÃ©e :"),
      ...spacer(1),
      para("Regex validÃ©e : ^(?:\\+?224)?(6(?:2[2-5]|64))\\d{6}$", { bold: true }),
      ...spacer(1),
      bullet("Orange Money GuinÃ©e : prÃ©fixes 622, 623, 624, 625 (9 chiffres locaux)"),
      bullet("MTN MoMo GuinÃ©e : prÃ©fixe 664 (9 chiffres locaux)"),
      bullet("Formats acceptÃ©s : 622123456, 224622123456, +224622123456 (avec nettoyage espaces/tirets)"),
      bullet("Formats rejetÃ©s : 0622123456, 610000000, 650000000, 660000000 (prÃ©fixes inexistants)"),

      new Paragraph({ children: [new PageBreak()] }),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // 5. PLAN DE PRIORITÃ‰S
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("5. Plan de DÃ©veloppement et PrioritÃ©s"),
      ligne(),
      ...spacer(1),

      titre2("5.1 Tableau de PrioritÃ©s Global"),
      ...spacer(1),
      tableauPriorites([
        ["P1 â€” Critique", "Flux OTP complet : saisie â†’ OTP â†’ token â†’ score",              "M1/M3",    "OpÃ©rationnel"],
        ["P1 â€” Critique", "Affichage rÃ©sultats avec double MSISDN Orange + MTN",           "M4 Agent", "OpÃ©rationnel"],
        ["P1 â€” Critique", "Mode dÃ©gradÃ© : un seul opÃ©rateur disponible",                  "M1",       "OpÃ©rationnel"],
        ["P1 â€” Critique", "Routes health /provider/orange/health + /provider/mtn/health",  "M2",       "Ã€ corriger"],
        ["P1 â€” Critique", "Regex MSISDN synchronisÃ©e frontend/backend",                    "M1/M4",    "OpÃ©rationnel"],
        ["P1 â€” Critique", "Disclaimer lÃ©gal dÃ©mo publique",                               "M4 Land.", "OpÃ©rationnel"],
        ["P2 â€” Haute",    "Rate limiting dÃ©mo publique (3 essais/minute)",                "M4 Land.", "OpÃ©rationnel"],
        ["P2 â€” Haute",    "Guide numÃ©ros de test dans le dashboard agent",                "M4 Agent", "OpÃ©rationnel"],
        ["P2 â€” Haute",    "Export CSV audit trail",                                        "M4 Audit", "OpÃ©rationnel"],
        ["P2 â€” Haute",    "Monitoring M1/M2/M3 toutes les 15 secondes",                  "M4 Admin", "OpÃ©rationnel"],
        ["P2 â€” Haute",    "Suspension de compte utilisateur",                             "M4 Admin", "OpÃ©rationnel"],
        ["P3 â€” Normale",  "Slider seuil risque persistÃ© en base (SQLite)",               "M4 Risk",  "En cours"],
        ["P3 â€” Normale",  "Authentification agent avec session persistante",              "M3/M4",    "En cours"],
        ["P3 â€” Normale",  "Chiffrement AES-256 des donnÃ©es au repos",                    "M3",       "Backlog"],
        ["P3 â€” Normale",  "HTTPS/TLS en production (certificat SSL)",                    "Infra",    "Backlog"],
      ]),
      ...spacer(2),

      titre2("5.2 Ce qui est TerminÃ© vs En Cours"),
      ...spacer(1),
      bullet("âœ… TERMINÃ‰ : Flux M2 â†’ M3 â†’ M1 complet avec mock data"),
      bullet("âœ… TERMINÃ‰ : Dashboard Agent avec dÃ©tection MSISDN temps rÃ©el"),
      bullet("âœ… TERMINÃ‰ : Dashboard Admin avec monitoring et gestion utilisateurs"),
      bullet("âœ… TERMINÃ‰ : Dashboard Risque avec slider de seuil"),
      bullet("âœ… TERMINÃ‰ : Page Audit avec logs et export CSV"),
      bullet("âœ… TERMINÃ‰ : Landing Page publique avec dÃ©mo sÃ©curisÃ©e"),
      bullet("âœ… TERMINÃ‰ : MainLayout avec navigation par rÃ´le"),
      bullet("âš ï¸ EN COURS : Double MSISDN Orange + MTN sÃ©parÃ©s dans M3"),
      bullet("âš ï¸ EN COURS : Routes health sÃ©parÃ©es M2"),
      bullet("âš ï¸ EN COURS : Authentification agent avec rÃ´les persistants"),
      bullet("ðŸ”² BACKLOG : HTTPS/TLS production, chiffrement AES-256, base de donnÃ©es"),
      ...spacer(2),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // 6. PRÃ‰PARATION SOUTENANCE
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("6. PrÃ©paration Ã  la Soutenance"),
      ligne(),
      ...spacer(1),

      titre2("6.1 ScÃ©narios de DÃ©monstration RecommandÃ©s"),
      ...spacer(1),

      titulo3_section("ScÃ©nario 1 â€” Client Double OpÃ©rateur (Impression maximale)"),
      bullet("Connexion agent@Kandjou.gn / agent123"),
      bullet("Saisir 224622123456 dans le champ de recherche"),
      bullet("Observer : logos Orange ET MTN s'illuminent simultanÃ©ment"),
      bullet("Cliquer 'Lancer l'Analyse' â†’ modal OTP"),
      bullet("RÃ©cupÃ©rer le code dans le terminal M3 â†’ saisir dans le modal"),
      bullet("RÃ©sultats : Orange 2 500 000 GNF + MTN 780 000 GNF = Total 3 280 000 GNF"),
      bullet("Score attendu : ~80/100 â€” ELIGIBLE â€” Risque FAIBLE"),
      ...spacer(1),

      titulo3_section("ScÃ©nario 2 â€” Mode DÃ©gradÃ© (Robustesse)"),
      bullet("Saisir 224625999888 (Orange-only)"),
      bullet("RÃ©sultats : Orange 4 200 000 GNF â€” MTN : NON DÃ‰TECTÃ‰"),
      bullet("Montrer que le score est quand mÃªme calculÃ© avec une seule source"),
      bullet("Argument soutenance : 'Le systÃ¨me est rÃ©silient Ã  la panne d'un opÃ©rateur'"),
      ...spacer(1),

      titulo3_section("ScÃ©nario 3 â€” Slider de Seuil (Dashboard Risque)"),
      bullet("Connexion risk@Kandjou.gn / risk123"),
      bullet("Naviguer vers 'Risques'"),
      bullet("DÃ©placer le slider de 65 Ã  80"),
      bullet("Montrer que le % d'Ã©ligibles diminue dynamiquement"),
      bullet("Argument soutenance : 'Politique de crÃ©dit ajustable en temps rÃ©el sans redÃ©marrage'"),
      ...spacer(2),

      titre2("6.2 Questions du Jury â€” RÃ©ponses PrÃ©parÃ©es"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4200, 5160],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell("Question probable", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 4200 }),
            cell("RÃ©ponse prÃ©parÃ©e", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 5160 }),
          ]}),
          ...[
            ["Pourquoi l'OTP est simulÃ© ?", "Mode dÃ©veloppement MVP. En production, M3 appellerait l'API SMS d'Orange GuinÃ©e (SMPP/HTTP Gateway). La logique est la mÃªme, seul le transport change."],
            ["Qu'est-ce qui diffÃ©rencie Kandjou d'une simple API ?", "Kandjou normalise des donnÃ©es hÃ©tÃ©rogÃ¨nes (champs diffÃ©rents entre opÃ©rateurs), applique un algorithme de scoring extensible (Pattern Strategy), et garantit la traÃ§abilitÃ© BCRG."],
            ["Pourquoi pas de base de donnÃ©es ?", "Choix architectural MVP : stockage en mÃ©moire pour la dÃ©monstration. La V2 utilisera Redis pour les sessions et PostgreSQL pour les politiques de risque."],
            ["Orange et MTN ont vraiment des champs diffÃ©rents ?", "Oui. Orange retourne 'available_balance', MTN retourne 'current_balance'. Orange a 'status', MTN a 'account_state'. C'est exactement ce que M1 normalise via Pydantic."],
            ["Comment fonctionne le Pattern Strategy ?", "V1ScoringStrategy implÃ©mente ScoringStrategy. Pour ajouter des critÃ¨res EDG, on crÃ©e V2ScoringStrategy sans modifier M1. ScoringEngine sÃ©lectionne la stratÃ©gie active."],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 4200, bold: true, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[1], { w: 5160, fill: i%2===0 ? C.fondTableau : C.blanc }),
          ]})),
        ],
      }),
      ...spacer(2),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // 7. ROADMAP VERS L'IA
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("7. Roadmap : De la V1 MVP vers l'IntÃ©gration IA (V2)"),
      ligne(),
      ...spacer(1),

      para("Les fonctionnalitÃ©s dÃ©crites dans ce document constituent la fondation sur laquelle l'intelligence artificielle sera intÃ©grÃ©e en version 2.0. L'architecture a Ã©tÃ© conÃ§ue pour cette extension dÃ¨s le dÃ©part."),
      ...spacer(1),

      titre2("7.1 Ce qui est PrÃªt pour l'IA"),
      bullet("Pattern Strategy dans ScoringEngine : ajout de V2ScoringStrategy sans modifier le code existant"),
      bullet("DonnÃ©es normalisÃ©es dans OperatorSource : format unifiÃ© prÃªt pour l'entraÃ®nement ML"),
      bullet("Audit trail immuable : historique d'Ã©vÃ©nements pour l'entraÃ®nement supervisÃ©"),
      bullet("Architecture modulaire : M1 peut appeler un service IA externe sans impacter M2/M3/M4"),
      ...spacer(1),

      titre2("7.2 FonctionnalitÃ©s IA PrÃ©vues en V2"),
      tableauFonctionnalites([
        ["Scoring ML",              "Remplacement de V1ScoringStrategy par un modÃ¨le Random Forest/XGBoost entraÃ®nÃ© sur l'historique", "V2"],
        ["DÃ©tection de fraude",     "Analyse comportementale : frÃ©quence des demandes, patterns suspects, anomalies de solde", "V2"],
        ["Recommandations crÃ©dit",  "Montant et durÃ©e de prÃªt optimaux calculÃ©s par ML selon le profil complet", "V2"],
        ["Scoring multi-sources",   "IntÃ©gration des donnÃ©es EDG (Ã©lectricitÃ©), factures tÃ©lÃ©com, historique bancaire", "V2"],
        ["NLP Rapport",             "GÃ©nÃ©ration automatique de commentaires en langage naturel sur le profil client", "V2"],
        ["PrÃ©diction de risque",    "ProbabilitÃ© de dÃ©faut de paiement calculÃ©e sur 3/6/12 mois", "V2"],
      ]),
      ...spacer(2),

      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // CONCLUSION
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      titre1("Conclusion"),
      ligne(),
      ...spacer(1),
      para("Kandjou Fintech est une plateforme d'agrÃ©gation Mobile Money complÃ¨te, fonctionnelle en mode simulation, et architecturÃ©e pour l'extension vers l'intelligence artificielle. Les 46 tests unitaires passent, le flux M2 â†’ M3 â†’ M1 â†’ M4 est opÃ©rationnel, et les trois dashboards (Agent, Admin, Risque) sont dÃ©ployÃ©s."),
      ...spacer(1),
      para("Les fonctionnalitÃ©s dÃ©crites dans ce document reprÃ©sentent la version MVP acadÃ©mique. Elles couvrent l'intÃ©gralitÃ© du pipeline de scoring, la sÃ©curitÃ© de niveau fintech (OTP, JWT, anti-brute force, audit trail), et une interface utilisateur professionnelle adaptÃ©e au contexte guinÃ©en."),
      ...spacer(1),
      para("L'intÃ©gration de l'intelligence artificielle en V2 sera facilitÃ©e par les choix architecturaux de la V1 : Pattern Strategy, donnÃ©es normalisÃ©es, audit trail, et sÃ©paration claire des responsabilitÃ©s entre modules.", { italic: true, color: C.bleuPrimaire }),
    ],
  }],
});

// Helpers supplÃ©mentaires dÃ©finis aprÃ¨s la dÃ©claration du document
function titulo3_section(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: C.bleuClair, font: "Arial" })],
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Kandjou_specifications_v1.docx", buffer);
  console.log("OK - File generated: Kandjou_specifications_v1.docx");
});
