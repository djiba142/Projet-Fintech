const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, Header, VerticalAlign, PageBreak
} = require('docx');
const fs = require('fs');

const GREEN_DARK = "1A3A2A"; // Kandjou Dark Green
const GREEN_MED = "2D6A4F";  // Kandjou Brand Green
const GREEN_LIGHT = "F0FFF4";
const GREEN_ACCENT = "A7DFC0";
const ORANGE = "F37021";     // Kandjou Orange
const YELLOW_LIGHT = "FFF8E1";
const BLUE_LIGHT = "F8FAFC";
const GRAY_LIGHT = "F1F5F9";
const GRAY_MED = "94A3B8";
const BLACK = "0F172A";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: WHITE, size: 32, font: "Plus Jakarta Sans" })],
    shading: { fill: GREEN_DARK, type: ShadingType.CLEAR },
    spacing: { before: 360, after: 200 },
    indent: { left: 200, right: 200 }
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: GREEN_DARK, size: 26, font: "Plus Jakarta Sans" })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREEN_MED } },
    spacing: { before: 280, after: 140 }
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, color: GREEN_MED, size: 24, font: "Plus Jakarta Sans" })],
    spacing: { before: 200, after: 100 }
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Plus Jakarta Sans", color: BLACK, ...opts })],
    spacing: { before: 80, after: 80 },
    alignment: AlignmentType.JUSTIFIED
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22, font: "Plus Jakarta Sans", color: BLACK, bold })],
    spacing: { before: 60, after: 60 }
  });
}

function subbullet(text) {
  return new Paragraph({
    numbering: { reference: "subbullets", level: 1 },
    children: [new TextRun({ text, size: 20, font: "Plus Jakarta Sans", color: "475569" })],
    spacing: { before: 40, after: 40 }
  });
}

function headerRow(cells, colWidths) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: GREEN_DARK, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: WHITE, size: 20, font: "Plus Jakarta Sans" })]
      })]
    }))
  });
}

function dataRow(cells, colWidths, shade = WHITE) {
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: shade, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        children: [new TextRun({ text, size: 20, font: "Plus Jakarta Sans", color: BLACK })]
      })]
    }))
  });
}

function colorBox(text, fill = GREEN_LIGHT) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({
                children: [new TextRun({ text, size: 22, font: "Plus Jakarta Sans", color: BLACK, italics: true })],
                alignment: AlignmentType.JUSTIFIED
              })
            ]
          })
        ]
      })
    ]
  });
}

function pageBreakP() {
  return new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } });
}

function emptyLine() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 60, after: 60 } });
}

// --- Title Page ---
const titlePage = [
  new Paragraph({ spacing: { before: 1440, after: 0 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "KANDJOU FINTECH", bold: true, size: 72, font: "Plus Jakarta Sans", color: GREEN_DARK })],
    spacing: { before: 0, after: 120 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Plateforme d'Agrégation Mobile Money & Scoring IA en Guinée", size: 36, font: "Plus Jakarta Sans", color: GREEN_MED })],
    spacing: { before: 0, after: 80 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "─────────────────────────────────────────────", color: GREEN_ACCENT, size: 24 })],
    spacing: { before: 0, after: 200 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CAHIER DES CHARGES FONCTIONNEL (V2 DYNAMIQUE)", bold: true, size: 32, font: "Plus Jakarta Sans", color: ORANGE })],
    spacing: { before: 0, after: 80 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Architecture temps réel et intégration multiservices", size: 24, font: "Plus Jakarta Sans", color: "64748B" })],
    spacing: { before: 0, after: 400 }
  }),
  new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [2800, 3200],
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({ children: [
        new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, shading: { fill: GREEN_LIGHT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "Version", bold: true, size: 20, font: "Plus Jakarta Sans" })] })] }),
        new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "2.0 – Mai 2026", size: 20, font: "Plus Jakarta Sans" })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, shading: { fill: GREEN_LIGHT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "État", bold: true, size: 20, font: "Plus Jakarta Sans" })] })] }),
        new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "Implémentation Dynamique OK", size: 20, font: "Plus Jakarta Sans" })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, shading: { fill: GREEN_LIGHT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "Régulateur", bold: true, size: 20, font: "Plus Jakarta Sans" })] })] }),
        new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, children: [new Paragraph({ children: [new TextRun({ text: "BCRG – Banque Centrale de la République de Guinée", size: 20, font: "Plus Jakarta Sans" })] })] }),
      ]}),
    ]
  }),
  emptyLine(),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Orange Money Guinée  ●  MTN Mobile Money Guinée  ●  Credit Scoring AI", size: 22, font: "Plus Jakarta Sans", color: "94A3B8" })],
    spacing: { before: 0, after: 80 }
  }),
  pageBreakP()
];

// --- Section 1 ---
const section1 = [
  h1("1. PRÉSENTATION DU SYSTÈME KANDJOU"),
  emptyLine(),
  h2("1.1 Contexte et Vision"),
  para("Kandjou Fintech est le premier agrégateur Open Banking agréé de Guinée. Le système résout la fragmentation des services financiers en unifiant les comptes Orange Money et MTN MoMo au sein d'une interface unique, intelligente et sécurisée."),
  bullet("Consolidation temps réel des soldes et transactions"),
  bullet("Scoring de solvabilité prédictif basé sur le comportement financier"),
  bullet("Interopérabilité inter-opérateurs fluide"),
  bullet("Audit réglementaire natif pour la BCRG"),
  emptyLine(),
  h2("1.2 Architecture Data-Driven"),
  para("Contrairement aux versions statiques, Kandjou V2 utilise une architecture pilotée par les données :"),
  bullet("Backend : FastAPI (Python) avec injection de MSISDN dynamique dans les sessions"),
  bullet("Frontend : React.js avec appels axios authentifiés par JWT"),
  bullet("Agrégation : Module M1 capable de requêter les MSISDN Orange/MTN associés à chaque profil utilisateur"),
  emptyLine(),
  pageBreakP()
];

// --- Section 2 : Dashboards Dynamiques ---
const section2 = [
  h1("2. DASHBOARDS DYNAMIQUES ET FONCTIONNALITÉS"),
  emptyLine(),

  h2("2.1 Tableau de bord Client (Vue 360°)"),
  para("Affichage automatique des soldes et transactions liés à l'utilisateur connecté."),
  h3("Détails dynamiques :"),
  bullet("Appel automatique vers /m1/aggregate/{client_id} au chargement"),
  bullet("Affichage des soldes réels Orange et MTN récupérés en base de données"),
  bullet("Calcul du score de solvabilité par l'IA en fonction des flux détectés"),
  bullet("Graphique d'évolution des dépenses consolidées"),
  emptyLine(),

  h2("2.2 Portail Institution (Microfinance)"),
  para("Interface permettant aux conseillers crédit d'analyser les dossiers clients en temps réel."),
  h3("Détails dynamiques :"),
  bullet("Recherche réelle dans la base de données utilisateurs"),
  bullet("Accès aux MSISDN liés (Orange/MTN) pour validation KYC"),
  bullet("Génération de rapports d'analyse crédit automatisés"),
  bullet("Workflow d'approbation/rejet synchronisé avec le backend"),
  emptyLine(),

  h2("2.3 Supervision Administrateur"),
  para("Vue globale de la santé du système Kandjou."),
  h3("Détails dynamiques :"),
  bullet("Compteur temps réel des utilisateurs actifs et sessions ouvertes"),
  bullet("Monitoring des appels API vers les simulateurs Orange/MTN"),
  bullet("Journal d'audit de sécurité (Logs M3) consultable dynamiquement"),
  emptyLine(),

  h2("2.4 Portail Audit BCRG (Régulateur)"),
  para("Console de supervision de la conformité."),
  h3("Détails dynamiques :"),
  bullet("Flux d'événements anonymisés pour la surveillance des transactions"),
  bullet("Génération de rapports de conformité périodiques"),
  bullet("Alertes automatiques en cas de comportements atypiques"),
  emptyLine(),

  pageBreakP()
];

// --- Section 3 : Acteurs ---
const section3 = [
  h1("3. ACTEURS ET DROITS d'ACCÈS (RBAC)"),
  emptyLine(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 2100, 2100, 3360],
    rows: [
      headerRow(["Acteur", "Rôle principal", "Interface", "Droits dynamiques"], [1800, 2100, 2100, 3360]),
      dataRow(["Client", "Utilisateur final", "Kandjou Client App", "Voir ses comptes, Score, Transferts"], [1800, 2100, 2100, 3360], GRAY_LIGHT),
      dataRow(["Agent/IMF", "Conseiller Crédit", "Kandjou Agent", "Analyser dossiers clients, Approuver crédits"], [1800, 2100, 2100, 3360]),
      dataRow(["Admin", "Superviseur", "Kandjou Admin", "Gérer users, configurer APIs, Logs"], [1800, 2100, 2100, 3360], GRAY_LIGHT),
      dataRow(["Régulateur", "Audit BCRG", "Portail BCRG", "Surveillance, Rapports d'audit"], [1800, 2100, 2100, 3360]),
    ]
  }),
  emptyLine(),
  pageBreakP()
];

// --- Section 4 : API ---
const section4 = [
  h1("4. SPÉCIFICATIONS API DYNAMIQUE"),
  emptyLine(),
  h2("4.1 Endpoints unifiés (Kandjou Core)"),
  emptyLine(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1440, 2880, 2040, 3000],
    rows: [
      headerRow(["Méthode", "Endpoint", "Paramètre", "Donnée retournée"], [1440, 2880, 2040, 3000]),
      dataRow(["GET", "/m1/aggregate/{cid}", "Client ID", "Solde Consolidé + Score AI"], [1440, 2880, 2040, 3000], GRAY_LIGHT),
      dataRow(["GET", "/m3/overview", "Aucun", "KPIs système temps réel"], [1440, 2880, 2040, 3000]),
      dataRow(["GET", "/m3/users", "Filtre", "Liste dynamique des profils"], [1440, 2880, 2040, 3000], GRAY_LIGHT),
      dataRow(["POST", "/m3/login", "Identifiants", "Token JWT + Session MSISDN"], [1440, 2880, 2040, 3000]),
    ]
  }),
  emptyLine(),
  h2("4.2 Exemple d'objet Client dynamique"),
  colorBox('{ "client_id": "client@kandjou.gn", "kyc": { "fullname": "Kadiatou Bah", "id_card": "CNI-8023" }, "msisdns": { "orange": "+224 622 12...", "mtn": "+224 622 98..." }, "credit_score": 72 }', BLUE_LIGHT),
  emptyLine(),
  pageBreakP()
];

// --- Section 5 : Conclusion ---
const section5 = [
  h1("5. CONFORMITÉ ET SÉCURITÉ"),
  emptyLine(),
  para("Kandjou Fintech implémente les standards de sécurité bancaire les plus élevés pour garantir l'intégrité des données financières en Guinée."),
  bullet("Authentification forte via JWT"),
  bullet("Chiffrement AES-256 des identifiants Mobile Money"),
  bullet("Traçabilité BCRG : Chaque consultation de données par une IMF est enregistrée dans les registres d'audit"),
  emptyLine(),
  emptyLine(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "— Document certifié Kandjou Core v2.0 —", size: 20, font: "Plus Jakarta Sans", color: "94A3B8", italics: true })],
    spacing: { before: 400, after: 100 }
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Kandjou © 2026 | L'excellence financière pour chaque Guinéen", size: 18, font: "Plus Jakarta Sans", color: GREEN_MED })],
    spacing: { before: 0, after: 0 }
  }),
];

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 300 } } }
        }]
      },
      {
        reference: "subbullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: " ", alignment: AlignmentType.LEFT },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 900, hanging: 300 } } }
          }
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Plus Jakarta Sans", size: 22, color: BLACK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Plus Jakarta Sans", color: WHITE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Plus Jakarta Sans", color: GREEN_DARK },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Plus Jakarta Sans", color: GREEN_MED },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Kandjou Fintech – Cahier des charges fonctionnel | Page ", size: 18, font: "Plus Jakarta Sans", color: "94A3B8" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Plus Jakarta Sans", color: "94A3B8" }),
          ]
        })]
      })
    },
    children: [
      ...titlePage,
      ...section1,
      ...section2,
      ...section3,
      ...section4,
      ...section5,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Kandjou_Cahier_des_charges_V2.docx", buffer);
  console.log("Cahier des charges Kandjou V2 créé avec succès !");
});
