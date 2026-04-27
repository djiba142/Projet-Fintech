const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, Header, PageBreak, VerticalAlign,
} = require("docx");
const fs = require("fs");

// ── Couleurs Kandjou ───────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── Tableau de fonctionnalités ─────────────────────────────────────────────
const tableauFonctionnalites = (lignes) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3120, 3120, 3120],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        cell("Fonctionnalité", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3120, center: true }),
        cell("Description",    { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3120, center: true }),
        cell("Priorité",       { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3120, center: true }),
      ],
    }),
    ...lignes.map((l, i) => new TableRow({
      children: [
        cell(l[0], { w: 3120, bold: true, fill: i % 2 === 0 ? C.fondTableau : C.blanc }),
        cell(l[1], { w: 3120, fill: i % 2 === 0 ? C.fondTableau : C.blanc }),
        cell(l[2], { w: 3120, center: true, fill: i % 2 === 0 ? C.fondTableau : C.blanc,
          color: l[2] === "P1 — Critique" ? "991B1B" : l[2] === "P2 — Haute" ? "92400E" : C.vertSucces,
          bold: true }),
      ],
    })),
  ],
});

// ── Tableau priorités ──────────────────────────────────────────────────────
const tableauPriorites = (lignes) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [1560, 3900, 1560, 2340],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        cell("Priorité", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 1560, center: true }),
        cell("Fonctionnalité", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 3900 }),
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
          color: l[3] === "Opérationnel" ? C.vertSucces : l[3] === "En cours" ? "92400E" : C.gris3 }),
      ],
    })),
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }, {
          level: 1, format: LevelFormat.BULLET, text: "◦",
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
            new TextRun({ text: "KANDJOU FINTECH — ", bold: true, size: 18, color: C.bleuPrimaire, font: "Arial" }),
            new TextRun({ text: "Spécifications Fonctionnelles v1.0", size: 18, color: C.gris3, font: "Arial" }),
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
            new TextRun({ text: "Confidentiel — Kandjou Fintech — Conakry, Guinée 2026  |  Page ", size: 18, color: C.gris4, font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.gris4, font: "Arial" }),
            new TextRun({ text: " / ", size: 18, color: C.gris4, font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: C.gris4, font: "Arial" }),
          ],
        })],
      }),
    },
    children: [

      // ──────────────────────────────────────────────────────────────────────
      // PAGE DE TITRE
      // ──────────────────────────────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 0 },
        children: [new TextRun({ text: "◈ KANDJOU", bold: true, size: 72, color: C.bleuProfond, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 0 },
        children: [new TextRun({ text: "Intelligence de Crédit", size: 32, color: C.cyanElec, font: "Arial", italics: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 640, after: 80 },
        children: [new TextRun({ text: "Spécifications Fonctionnelles", bold: true, size: 48, color: C.bleuPrimaire, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Fonctionnalités à Développer avant l'Intégration IA", size: 28, color: C.gris3, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 320, after: 0 },
        children: [new TextRun({ text: "Version 1.0  —  Avril 2026", size: 22, color: C.gris4, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 0 },
        children: [new TextRun({ text: "Université Gamal Abdel Nasser de Conakry", size: 22, color: C.gris4, font: "Arial" })],
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
          text: "Document confidentiel — Usage interne uniquement",
          size: 18, color: C.gris4, italics: true, font: "Arial",
        })],
      }),

      // Saut de page
      new Paragraph({ children: [new PageBreak()] }),

      // ──────────────────────────────────────────────────────────────────────
      // 1. INTRODUCTION
      // ──────────────────────────────────────────────────────────────────────
      titre1("1. Introduction et Contexte"),
      ligne(),
      ...spacer(1),

      titulo3_section("1.1 Vision du Produit"),
      para("Kandjou est une plateforme d'agrégation Mobile Money conçue pour le marché guinéen. Elle permet aux agents de crédit des institutions financières d'obtenir en moins de 3 secondes un score de solvabilité consolidé à partir des données Orange Money et MTN MoMo d'un client."),
      ...spacer(1),
      para("Le présent document décrit l'ensemble des fonctionnalités devant être développées et validées AVANT l'intégration du moteur d'intelligence artificielle prévu en version 2.0. Ces fonctionnalités constituent la fondation technique et fonctionnelle sur laquelle l'IA sera construite."),
      ...spacer(1),

      titulo3_section("1.2 Architecture Technique Actuelle"),
      para("Le système Kandjou repose sur une architecture monolithique modulaire :"),
      ...spacer(1),
      bullet("Module M1 — Core Aggregator (Python/FastAPI, port 8000/m1) : calcul du score, normalisation des données"),
      bullet("Module M2 — Simulateurs Opérateurs (Python/FastAPI, port 8000/m2) : simulation Orange Money et MTN MoMo"),
      bullet("Module M3 — Security Vault (Python/FastAPI, port 8000/m3) : OTP, tokens JWT, audit trail"),
      bullet("Module M4 — Frontend (React/Vite, port 5173) : interfaces Agent, Admin, Analyste Risque, Landing Page"),
      ...spacer(2),

      titulo3_section("1.3 Numéros de Test Disponibles (Mode Développement)"),
      para("En l'absence de vraies clés API Orange/MTN, les données simulées dans mock_data.py permettent de tester tous les flux :"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 2000, 2360, 2400],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell("MSISDN", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2600, center: true }),
            cell("Opérateur(s)", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2000, center: true }),
            cell("Solde simulé", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2360, center: true }),
            cell("Scénario de test", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2400, center: true }),
          ]}),
          ...[
            ["224622123456", "Orange + MTN", "2 500 000 + 780 000 GNF", "Double opérateur — score élevé"],
            ["224623456789", "Orange + MTN", "850 000 + 1 500 000 GNF", "Double opérateur — score moyen"],
            ["224625999888", "Orange seul",  "4 200 000 GNF",            "Orange-only — mode dégradé MTN"],
            ["224664789012", "MTN seul",     "3 750 000 GNF",            "MTN-only — mode dégradé Orange"],
            ["224624111222", "Orange seul",  "120 000 GNF (SUSPENDU)",   "Compte suspendu — malus score"],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 2600, fill: i%2===0 ? C.fondTableau : C.blanc, bold: true }),
            cell(l[1], { w: 2000, fill: i%2===0 ? C.fondTableau : C.blanc, center: true }),
            cell(l[2], { w: 2360, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[3], { w: 2400, fill: i%2===0 ? C.fondTableau : C.blanc, color: C.gris3 }),
          ]})),
        ],
      }),
      ...spacer(1),
      para("Le code OTP est affiché dans le terminal du module M3 en mode développement. En production, il serait envoyé par SMS via l'API de l'opérateur.", { italic: true, color: C.gris3 }),

      new Paragraph({ children: [new PageBreak()] }),

      // ──────────────────────────────────────────────────────────────────────
      // 2. FONCTIONNALITÉS BACKEND
      // ──────────────────────────────────────────────────────────────────────
      titre1("2. Fonctionnalités Backend à Développer"),
      ligne(),
      ...spacer(1),

      titre2("2.1 Module M1 — Core Aggregator"),
      ...spacer(1),

      titulo3_section("2.1.1 Flux d'Agrégation Asynchrone"),
      para("L'agrégation est le cœur du système. Lorsqu'un agent soumet un MSISDN, M1 doit :"),
      ...spacer(1),
      bullet("Valider le MSISDN guinéen (regex : 224 + 62[2-5]XXXXXX pour Orange, 224 + 664XXXXXX pour MTN)"),
      bullet("Appeler Orange et MTN en parallèle via asyncio.gather(return_exceptions=True)"),
      bullet("Normaliser les réponses hétérogènes (available_balance vs current_balance, status vs account_state)"),
      bullet("Appliquer le moteur de scoring V1 (score 0-100)"),
      bullet("Retourner l'objet AggregatedResponse en moins de 3 secondes"),
      ...spacer(1),
      para("Critère d'acceptation : avec les deux simulateurs M2 actifs, un appel GET /m1/aggregate/224622123456 avec un token valide retourne un score dans les 3 secondes.", { bold: true }),
      ...spacer(1),

      titulo3_section("2.1.2 Gestion du Mode Dégradé"),
      para("Si un seul opérateur répond, M1 doit continuer l'agrégation avec les données disponibles. Le score est calculé sur la base des sources actives uniquement. Une réponse 504 est retournée seulement si AUCUN opérateur ne répond."),
      ...spacer(1),
      tableauFonctionnalites([
        ["Mode dégradé Orange", "Calcul du score avec MTN uniquement si Orange timeout", "P1 — Critique"],
        ["Mode dégradé MTN",    "Calcul du score avec Orange uniquement si MTN timeout", "P1 — Critique"],
        ["504 Gateway Timeout", "Réponse 504 si les deux opérateurs sont indisponibles",  "P1 — Critique"],
        ["Logging dégradé",     "Log explicite en cas de mode dégradé pour audit",       "P2 — Haute"],
      ]),
      ...spacer(2),

      titulo3_section("2.1.3 Moteur de Scoring V1 (Pattern Strategy)"),
      para("L'algorithme de scoring V1 est intentionnellement simple pour permettre l'extension future (V2 avec IA). Les règles actuelles :"),
      ...spacer(1),
      bullet("Base : 50 points"),
      bullet("Bonus solde : +10 si total > 1 000 000 GNF"),
      bullet("Bonus activité : +20 si dernière activité dans les 24 heures"),
      bullet("Malus compte vide : -10 par compte à solde nul"),
      bullet("Score borné entre 0 et 100"),
      ...spacer(1),
      para("Seuils de décision : ELIGIBLE (71-100), RISQUE_MOYEN (41-70), REFUSE (0-40)."),
      ...spacer(2),

      titulo3_section("2.1.4 Double MSISDN (Orange + MTN séparés)"),
      para("Un client peut avoir deux numéros distincts chez Orange et MTN. M1 doit recevoir msisdn_orange et msisdn_mtn séparément depuis le token M3 et appeler le bon opérateur avec le bon numéro."),
      ...spacer(1),
      para("Critère d'acceptation : Orange 224622123456 + MTN 224664100001 retourne les deux soldes consolidés.", { bold: true }),
      ...spacer(2),

      titre2("2.2 Module M2 — Simulateurs Opérateurs"),
      ...spacer(1),

      titulo3_section("2.2.1 Routes Health Check"),
      para("Les endpoints /provider/orange/health et /provider/mtn/health doivent exister séparément pour permettre au healthcheck de M1 de distinguer l'état de chaque opérateur."),
      ...spacer(1),

      titulo3_section("2.2.2 Scénarios de Test Enrichis"),
      tableauFonctionnalites([
        ["Compte double opérateur", "224622123456 répond chez Orange ET MTN",          "P1 — Critique"],
        ["Orange-only",             "224625999888 répond chez Orange, 404 chez MTN",   "P1 — Critique"],
        ["MTN-only",                "224664789012 répond chez MTN, 404 chez Orange",   "P1 — Critique"],
        ["Compte suspendu",         "224624111222 retourne status SUSPENDED",          "P2 — Haute"],
        ["Panne Orange simulée",    "224622999999 retourne 503 chez Orange",           "P2 — Haute"],
        ["Panne MTN simulée",       "224664999999 retourne 503 chez MTN",              "P2 — Haute"],
        ["Timeout Orange",          "/provider/orange/simulate-timeout retourne 504",  "P2 — Haute"],
      ]),
      ...spacer(2),

      titre2("2.3 Module M3 — Security Vault"),
      ...spacer(1),

      titulo3_section("2.3.1 Gestion du Consentement Double MSISDN"),
      para("OTPRequest doit accepter msisdn_orange ET msisdn_mtn en paramètres optionnels. Au moins un doit être fourni. Les deux MSISDNs sont stockés dans le token_store et retournés par /auth/validate-token."),
      ...spacer(1),

      titulo3_section("2.3.2 Anti-Brute Force"),
      para("Après 3 tentatives OTP échouées pour une même session, la session doit être révoquée et un HTTP 429 retourné. Ce comportement doit être testé et documenté."),
      ...spacer(1),

      titulo3_section("2.3.3 Expiration des Sessions"),
      para("Les OTP expirent en 3 minutes (180 secondes). Les tokens JWT expirent en 5 minutes (300 secondes). Ces valeurs doivent être configurables via le fichier .env et documentées."),
      ...spacer(1),

      titulo3_section("2.3.4 Audit Trail"),
      tableauFonctionnalites([
        ["Log OTP Request",   "Enregistrer chaque demande d'OTP avec MSISDN et timestamp",        "P1 — Critique"],
        ["Log OTP Success",   "Enregistrer chaque validation réussie avec session_id",             "P1 — Critique"],
        ["Log OTP Failure",   "Enregistrer chaque échec avec tentative numéro et raison",         "P1 — Critique"],
        ["Log Rate Limit",    "Enregistrer les blocages anti-brute force avec IP",                "P2 — Haute"],
        ["Export CSV",        "API GET /admin/audit/export pour export CSV des logs",             "P3 — Normale"],
      ]),
      ...spacer(2),

      titulo3_section("2.3.5 Endpoint Validation Token"),
      para("GET /m3/auth/validate-token doit retourner msisdn_orange, msisdn_mtn, et primary (le MSISDN principal) pour permettre à M1 d'appeler le bon opérateur avec le bon numéro."),

      new Paragraph({ children: [new PageBreak()] }),

      // ──────────────────────────────────────────────────────────────────────
      // 3. FONCTIONNALITÉS FRONTEND
      // ──────────────────────────────────────────────────────────────────────
      titre1("3. Fonctionnalités Frontend à Développer"),
      ligne(),
      ...spacer(1),

      titre2("3.1 Page Publique — Landing Page"),
      ...spacer(1),

      titulo3_section("3.1.1 Contenu de la Vitrine"),
      para("La landing page est la vitrine commerciale de Kandjou. Elle doit convaincre une banque ou une IMF en 30 secondes. Les sections obligatoires :"),
      ...spacer(1),
      bullet("Hero : titre accrocheur + visuels Orange/MTN + jauge 85/100 animée + CTA 'Demander une démo'"),
      bullet("Comment ça marche : 3 étapes (Consentement OTP → Agrégation → Score)"),
      bullet("Sécurité : badges conformité BCRG, flux de chiffrement AES-256/TLS, anti-brute force"),
      bullet("Pour les banques : statistiques (< 3s, 99.9% uptime, 2 opérateurs, 100% audit)"),
      bullet("Démo publique : saisie de numéro test avec rate limiting 3 essais/minute, score fictif"),
      bullet("FAQ : 4 questions sur la confidentialité, l'OTP, la conformité BCRG, les opérateurs"),
      bullet("Footer : liens, badges sécurité, copyright"),
      ...spacer(1),

      titulo3_section("3.1.2 Sécurité de la Partie Publique"),
      tableauFonctionnalites([
        ["Rate Limiting Client",  "Maximum 3 essais de démo par minute par session",           "P1 — Critique"],
        ["Score Fictif Démo",     "Aucun appel réseau réel en mode démo — données simulées",   "P1 — Critique"],
        ["Disclaimer Légal",      "Mention explicite 'score indicatif — données simulées'",    "P1 — Critique"],
        ["Navbar Sticky",         "Navigation fixe avec effet scroll (backdrop-filter)",        "P2 — Haute"],
        ["Responsive Mobile",     "Adaptation pour tablettes et téléphones",                   "P2 — Haute"],
      ]),
      ...spacer(2),

      titre2("3.2 Dashboard Agent — AgentDashboard.jsx"),
      ...spacer(1),

      titulo3_section("3.2.1 Saisie Intelligente avec Détection d'Opérateur"),
      para("Le champ de saisie est le point d'entrée principal. Il doit être intuitif pour un agent en Guinée :"),
      ...spacer(1),
      bullet("Détection automatique en temps réel : Orange (62[2-5]XXXXXX) ou MTN (664XXXXXX)"),
      bullet("Les logos Orange et MTN s'illuminent dynamiquement selon le numéro saisi"),
      bullet("Accepte les formats : avec indicatif 224, sans indicatif, avec espaces, avec tirets"),
      bullet("Masquage automatique dans l'audit : 224622***456 (protection des données)"),
      bullet("Guide de numéros de test accessible depuis le header (bouton 📋)"),
      bullet("Saisie de deux numéros possibles : Orange ET MTN séparément"),
      ...spacer(1),

      titulo3_section("3.2.2 Flux OTP — Ce qui s'affiche"),
      para("Après la saisie d'un numéro valide et le clic sur 'Lancer l'Analyse', le flux complet est :"),
      ...spacer(1),
      bullet("Étape 1 — Validation : chips de confirmation avec MSISDN masqué + case consentement"),
      bullet("Étape 2 — OTP Modal : code à 6 chiffres avec indicateur de remplissage (6 points)"),
      bullet("Étape 3 — Résultats : grille complète 3 colonnes avec toutes les données"),
      ...spacer(1),

      titulo3_section("3.2.3 Affichage des Résultats après Agrégation"),
      para("C'est la partie la plus importante pour la soutenance. Voici exactement ce qui doit s'afficher après qu'un agent entre un numéro et valide le consentement :"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3500, 3520],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell("Zone", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 2340 }),
            cell("Contenu affiché", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3500 }),
            cell("Source des données", { bold: true, fill: C.bleuPrimaire, color: C.blanc, w: 3520 }),
          ]}),
          ...[
            ["Jauge Score", "Score 0-100 animé, couleur verte/orange/rouge selon seuil", "M1 → credit_analysis.score"],
            ["Statut Risque", "ELIGIBLE / RISQUE MOYEN / REFUSÉ avec badge coloré", "M1 → credit_analysis.status"],
            ["Recommandation", "Texte explicatif (ex: 'Capacité 750 000 GNF')", "M1 → credit_analysis.recommendation"],
            ["Solde Orange", "Montant en GNF + logo Orange + statut ACTIF/NON TROUVÉ", "M1 → consolidation.orange_balance"],
            ["Solde MTN", "Montant en GNF + logo MTN + statut ACTIF/NON DÉTECTÉ", "M1 → consolidation.mtn_balance"],
            ["Total Consolidé", "Somme des deux soldes en bleu, sources actives", "M1 → consolidation.total_balance"],
            ["Historique", "3 dernières analyses avec sparklines colorées", "Données locales mock"],
            ["Audit Récent", "4 derniers événements avec heure, action, cible masquée", "Mis à jour en temps réel"],
            ["Profil de Risque", "Graphique radar (5 critères : Solde, Activité, etc.)", "Calculé depuis le score"],
            ["Tendances", "Graphique area (Solde Moyen 6M) + bar (Épargne)", "Données mock enrichies"],
            ["Rapport PDF", "Bouton blanc pour impression/export", "window.print()"],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 2340, bold: true, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[1], { w: 3500, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[2], { w: 3520, fill: i%2===0 ? C.fondTableau : C.blanc, color: C.gris3 }),
          ]})),
        ],
      }),
      ...spacer(2),

      titulo3_section("3.2.4 Comportement Sans Vraies Clés API"),
      para("Le système fonctionne entièrement avec les simulateurs M2. Aucune vraie clé API Orange ou MTN n'est nécessaire. Le flux complet est identique à la production :"),
      ...spacer(1),
      bullet("224622123456 → Orange : 2 500 000 GNF + MTN : 780 000 GNF → Total : 3 280 000 GNF → Score : ~80"),
      bullet("224625999888 → Orange seul : 4 200 000 GNF → MTN : NON TROUVÉ → Score : ~70 (mode dégradé)"),
      bullet("224664789012 → Orange : NON TROUVÉ → MTN seul : 3 750 000 GNF → Score : ~68 (mode dégradé)"),
      ...spacer(2),

      titre2("3.3 Dashboard Admin — AdminDashboard.jsx"),
      ...spacer(1),

      titulo3_section("3.3.1 Monitoring des Modules"),
      para("L'admin doit voir en temps réel l'état des 3 modules backend. Un healthcheck est effectué toutes les 15 secondes vers GET /health. Les indicateurs affichés :"),
      bullet("M1 Aggregator : ONLINE/OFFLINE + latence mesurée"),
      bullet("M2 Simulators : ONLINE/OFFLINE + latence mesurée"),
      bullet("M3 Security : ONLINE/OFFLINE + latence mesurée"),
      ...spacer(1),

      titulo3_section("3.3.2 Gestion des Utilisateurs"),
      tableauFonctionnalites([
        ["Liste utilisateurs",    "Tableau avec nom, email, rôle, dernière activité, statut",  "P1 — Critique"],
        ["Suspendre un compte",   "Bouton toggle ACTIVE → SUSPENDED avec confirmation",        "P1 — Critique"],
        ["Badge rôles",           "Violet (Admin), Bleu (Agent), Ambre (Risk Manager)",        "P2 — Haute"],
        ["Ajouter utilisateur",   "Bouton + Nouvel utilisateur (modal ou page dédiée)",        "P3 — Normale"],
        ["Réinitialiser MDP",     "Envoi email de réinitialisation (en V2)",                   "P3 — Normale"],
      ]),
      ...spacer(1),

      titulo3_section("3.3.3 IPs Bloquées"),
      para("La section 'Sécurité : IPs Bloquées' affiche les adresses IP bannies par l'anti-brute force avec la raison du blocage, la date, et deux actions : Débloquer (vert) ou Maintenir le blocage (rouge)."),
      ...spacer(2),

      titre2("3.4 Dashboard Risque — RiskDashboard.jsx"),
      ...spacer(1),

      titulo3_section("3.4.1 Indicateurs Clés de Performance (KPIs)"),
      bullet("Total Scorings : nombre cumulé d'analyses effectuées"),
      bullet("Taux d'Approbation : pourcentage de scores >= seuil actuel"),
      bullet("Volume Crédit Estimé : somme des capacités d'emprunt des profils ELIGIBLE"),
      ...spacer(1),

      titulo3_section("3.4.2 Graphique d'Évolution de Solvabilité"),
      para("Courbe linéaire SVG native (sans dépendance recharts) représentant l'évolution du score moyen sur la semaine. Axes Lun-Dim, graduation 0-80, aire dégradée bleue."),
      ...spacer(1),

      titulo3_section("3.4.3 Gestionnaire de Seuils (Slider)"),
      para("Le slider permet à l'analyste risque de définir le seuil de scoring minimal pour l'éligibilité. Fonctionnement attendu :"),
      ...spacer(1),
      bullet("Valeur par défaut : 65"),
      bullet("Dégradé coloré : vert (0-50) → orange (50-75) → rouge (75-100)"),
      bullet("Mise à jour en temps réel du pourcentage estimé de profils éligibles"),
      bullet("Tooltip contextuel : 'Profils au-dessus sont FAVORABLES'"),
      bullet("Note MVP : le seuil est stocké en état local React (pas persisté en base de données)"),
      ...spacer(2),

      titre2("3.5 Page Audit & Sécurité — AuditPage.jsx"),
      ...spacer(1),

      titulo3_section("3.5.1 Métriques de Sécurité Temps Réel"),
      para("Six cartes de métriques mises à jour en temps réel :"),
      bullet("Chiffrement : AES-256 (toujours vert)"),
      bullet("Transport : HTTPS/TLS 1.3 (toujours vert)"),
      bullet("Tokens actifs : nombre de JWT valides en mémoire M3"),
      bullet("IPs bloquées : nombre d'adresses bannies (orange si > 0)"),
      bullet("OTP dernière heure : nombre de codes générés"),
      bullet("Tentatives échouées : nombre d'échecs OTP (orange si > 0)"),
      ...spacer(1),

      titulo3_section("3.5.2 Flux de Chiffrement"),
      para("Diagramme horizontal en 5 étapes représentant le flux sécurisé : Client → HTTPS TLS → OTP M3 → M1 Agrégateur → Opérateurs M2. Le nœud M3 est mis en évidence (bord cyan, fond teinté)."),
      ...spacer(1),

      titulo3_section("3.5.3 Registre d'Audit"),
      tableauFonctionnalites([
        ["Affichage des logs",  "Tableau avec ID, horodatage, acteur, action, cible masquée, statut", "P1 — Critique"],
        ["Filtre par statut",   "Boutons ALL / Succès / Bloqués",                                    "P2 — Haute"],
        ["Recherche textuelle", "Filtrage par utilisateur, action ou cible",                         "P2 — Haute"],
        ["Export CSV",          "Téléchargement du journal filtré au format CSV",                    "P2 — Haute"],
        ["Note légale BCRG",   "Mention : logs immuables conservés 12 mois",                        "P1 — Critique"],
        ["Horodatage précis",  "Format YYYY-MM-DD HH:MM:SS en police monospace",                    "P2 — Haute"],
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ──────────────────────────────────────────────────────────────────────
      // 4. SÉCURITÉ & CONFORMITÉ
      // ──────────────────────────────────────────────────────────────────────
      titre1("4. Sécurité et Conformité"),
      ligne(),
      ...spacer(1),

      titre2("4.1 Stack de Sécurité"),
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
            ["Transport",         "HTTPS / TLS 1.3",    "Chiffrement des communications", "Simulé (HTTP local)"],
            ["Données au repos",  "AES-256",            "Chiffrement des données stockées","À implémenter en V2"],
            ["Authentification",  "JWT HS256",          "Tokens 5min TTL via M3",          "Opérationnel"],
            ["Consentement",      "OTP 6 chiffres",     "Validation client 3min TTL",       "Opérationnel"],
            ["Anti-brute force",  "Max 3 tentatives",   "Blocage session après 3 échecs",   "Opérationnel"],
            ["Rate limiting",     "5 req/min par IP",   "Protection API publique",          "Partiel"],
            ["Audit trail",       "Logs en mémoire",    "Traçabilité complète événements",  "Opérationnel"],
            ["BCRG Conformité",   "Audit 12 mois",      "Conservation des logs réglementaire","À implémenter"],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 2340, bold: true, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[1], { w: 2340, fill: i%2===0 ? C.fondTableau : C.blanc, color: C.bleuClair }),
            cell(l[2], { w: 2340, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[3], { w: 2340, fill: i%2===0 ? C.fondTableau : C.blanc,
              color: l[3] === "Opérationnel" ? C.vertSucces : l[3].includes("V2") ? C.gris3 : "92400E" }),
          ]})),
        ],
      }),
      ...spacer(2),

      titre2("4.2 Validation des MSISDNs Guinéens"),
      para("La regex de validation est le premier rempart contre les injections. Elle est implémentée à deux niveaux (frontend et backend) et doit être strictement synchronisée :"),
      ...spacer(1),
      para("Regex validée : ^(?:\\+?224)?(6(?:2[2-5]|64))\\d{6}$", { bold: true }),
      ...spacer(1),
      bullet("Orange Money Guinée : préfixes 622, 623, 624, 625 (9 chiffres locaux)"),
      bullet("MTN MoMo Guinée : préfixe 664 (9 chiffres locaux)"),
      bullet("Formats acceptés : 622123456, 224622123456, +224622123456 (avec nettoyage espaces/tirets)"),
      bullet("Formats rejetés : 0622123456, 610000000, 650000000, 660000000 (préfixes inexistants)"),

      new Paragraph({ children: [new PageBreak()] }),

      // ──────────────────────────────────────────────────────────────────────
      // 5. PLAN DE PRIORITÉS
      // ──────────────────────────────────────────────────────────────────────
      titre1("5. Plan de Développement et Priorités"),
      ligne(),
      ...spacer(1),

      titre2("5.1 Tableau de Priorités Global"),
      ...spacer(1),
      tableauPriorites([
        ["P1 — Critique", "Flux OTP complet : saisie → OTP → token → score",              "M1/M3",    "Opérationnel"],
        ["P1 — Critique", "Affichage résultats avec double MSISDN Orange + MTN",           "M4 Agent", "Opérationnel"],
        ["P1 — Critique", "Mode dégradé : un seul opérateur disponible",                  "M1",       "Opérationnel"],
        ["P1 — Critique", "Routes health /provider/orange/health + /provider/mtn/health",  "M2",       "À corriger"],
        ["P1 — Critique", "Regex MSISDN synchronisée frontend/backend",                    "M1/M4",    "Opérationnel"],
        ["P1 — Critique", "Disclaimer légal démo publique",                               "M4 Land.", "Opérationnel"],
        ["P2 — Haute",    "Rate limiting démo publique (3 essais/minute)",                "M4 Land.", "Opérationnel"],
        ["P2 — Haute",    "Guide numéros de test dans le dashboard agent",                "M4 Agent", "Opérationnel"],
        ["P2 — Haute",    "Export CSV audit trail",                                        "M4 Audit", "Opérationnel"],
        ["P2 — Haute",    "Monitoring M1/M2/M3 toutes les 15 secondes",                  "M4 Admin", "Opérationnel"],
        ["P2 — Haute",    "Suspension de compte utilisateur",                             "M4 Admin", "Opérationnel"],
        ["P3 — Normale",  "Slider seuil risque persisté en base (SQLite)",               "M4 Risk",  "En cours"],
        ["P3 — Normale",  "Authentification agent avec session persistante",              "M3/M4",    "En cours"],
        ["P3 — Normale",  "Chiffrement AES-256 des données au repos",                    "M3",       "Backlog"],
        ["P3 — Normale",  "HTTPS/TLS en production (certificat SSL)",                    "Infra",    "Backlog"],
      ]),
      ...spacer(2),

      titre2("5.2 Ce qui est Terminé vs En Cours"),
      ...spacer(1),
      bullet("✅ TERMINÉ : Flux M2 → M3 → M1 complet avec mock data"),
      bullet("✅ TERMINÉ : Dashboard Agent avec détection MSISDN temps réel"),
      bullet("✅ TERMINÉ : Dashboard Admin avec monitoring et gestion utilisateurs"),
      bullet("✅ TERMINÉ : Dashboard Risque avec slider de seuil"),
      bullet("✅ TERMINÉ : Page Audit avec logs et export CSV"),
      bullet("✅ TERMINÉ : Landing Page publique avec démo sécurisée"),
      bullet("✅ TERMINÉ : MainLayout avec navigation par rôle"),
      bullet("⚠️ EN COURS : Double MSISDN Orange + MTN séparés dans M3"),
      bullet("⚠️ EN COURS : Routes health séparées M2"),
      bullet("⚠️ EN COURS : Authentification agent avec rôles persistants"),
      bullet("🔲 BACKLOG : HTTPS/TLS production, chiffrement AES-256, base de données"),
      ...spacer(2),

      // ──────────────────────────────────────────────────────────────────────
      // 6. PRÉPARATION SOUTENANCE
      // ──────────────────────────────────────────────────────────────────────
      titre1("6. Préparation à la Soutenance"),
      ligne(),
      ...spacer(1),

      titre2("6.1 Scénarios de Démonstration Recommandés"),
      ...spacer(1),

      titulo3_section("Scénario 1 — Client Double Opérateur (Impression maximale)"),
      bullet("Connexion agent@kandjou.gn / agent123"),
      bullet("Saisir 224622123456 dans le champ de recherche"),
      bullet("Observer : logos Orange ET MTN s'illuminent simultanément"),
      bullet("Cliquer 'Lancer l'Analyse' → modal OTP"),
      bullet("Récupérer le code dans le terminal M3 → saisir dans le modal"),
      bullet("Résultats : Orange 2 500 000 GNF + MTN 780 000 GNF = Total 3 280 000 GNF"),
      bullet("Score attendu : ~80/100 — ELIGIBLE — Risque FAIBLE"),
      ...spacer(1),

      titulo3_section("Scénario 2 — Mode Dégradé (Robustesse)"),
      bullet("Saisir 224625999888 (Orange-only)"),
      bullet("Résultats : Orange 4 200 000 GNF — MTN : NON DÉTECTÉ"),
      bullet("Montrer que le score est quand même calculé avec une seule source"),
      bullet("Argument soutenance : 'Le système est résilient à la panne d'un opérateur'"),
      ...spacer(1),

      titulo3_section("Scénario 3 — Slider de Seuil (Dashboard Risque)"),
      bullet("Connexion risk@kandjou.gn / risk123"),
      bullet("Naviguer vers 'Risques'"),
      bullet("Déplacer le slider de 65 à 80"),
      bullet("Montrer que le % d'éligibles diminue dynamiquement"),
      bullet("Argument soutenance : 'Politique de crédit ajustable en temps réel sans redémarrage'"),
      ...spacer(2),

      titre2("6.2 Questions du Jury — Réponses Préparées"),
      ...spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4200, 5160],
        rows: [
          new TableRow({ tableHeader: true, children: [
            cell("Question probable", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 4200 }),
            cell("Réponse préparée", { bold: true, fill: C.bleuProfond, color: C.blanc, w: 5160 }),
          ]}),
          ...[
            ["Pourquoi l'OTP est simulé ?", "Mode développement MVP. En production, M3 appellerait l'API SMS d'Orange Guinée (SMPP/HTTP Gateway). La logique est la même, seul le transport change."],
            ["Qu'est-ce qui différencie Kandjou d'une simple API ?", "Kandjou normalise des données hétérogènes (champs différents entre opérateurs), applique un algorithme de scoring extensible (Pattern Strategy), et garantit la traçabilité BCRG."],
            ["Pourquoi pas de base de données ?", "Choix architectural MVP : stockage en mémoire pour la démonstration. La V2 utilisera Redis pour les sessions et PostgreSQL pour les politiques de risque."],
            ["Orange et MTN ont vraiment des champs différents ?", "Oui. Orange retourne 'available_balance', MTN retourne 'current_balance'. Orange a 'status', MTN a 'account_state'. C'est exactement ce que M1 normalise via Pydantic."],
            ["Comment fonctionne le Pattern Strategy ?", "V1ScoringStrategy implémente ScoringStrategy. Pour ajouter des critères EDG, on crée V2ScoringStrategy sans modifier M1. ScoringEngine sélectionne la stratégie active."],
          ].map((l, i) => new TableRow({ children: [
            cell(l[0], { w: 4200, bold: true, fill: i%2===0 ? C.fondTableau : C.blanc }),
            cell(l[1], { w: 5160, fill: i%2===0 ? C.fondTableau : C.blanc }),
          ]})),
        ],
      }),
      ...spacer(2),

      // ──────────────────────────────────────────────────────────────────────
      // 7. ROADMAP VERS L'IA
      // ──────────────────────────────────────────────────────────────────────
      titre1("7. Roadmap : De la V1 MVP vers l'Intégration IA (V2)"),
      ligne(),
      ...spacer(1),

      para("Les fonctionnalités décrites dans ce document constituent la fondation sur laquelle l'intelligence artificielle sera intégrée en version 2.0. L'architecture a été conçue pour cette extension dès le départ."),
      ...spacer(1),

      titre2("7.1 Ce qui est Prêt pour l'IA"),
      bullet("Pattern Strategy dans ScoringEngine : ajout de V2ScoringStrategy sans modifier le code existant"),
      bullet("Données normalisées dans OperatorSource : format unifié prêt pour l'entraînement ML"),
      bullet("Audit trail immuable : historique d'événements pour l'entraînement supervisé"),
      bullet("Architecture modulaire : M1 peut appeler un service IA externe sans impacter M2/M3/M4"),
      ...spacer(1),

      titre2("7.2 Fonctionnalités IA Prévues en V2"),
      tableauFonctionnalites([
        ["Scoring ML",              "Remplacement de V1ScoringStrategy par un modèle Random Forest/XGBoost entraîné sur l'historique", "V2"],
        ["Détection de fraude",     "Analyse comportementale : fréquence des demandes, patterns suspects, anomalies de solde", "V2"],
        ["Recommandations crédit",  "Montant et durée de prêt optimaux calculés par ML selon le profil complet", "V2"],
        ["Scoring multi-sources",   "Intégration des données EDG (électricité), factures télécom, historique bancaire", "V2"],
        ["NLP Rapport",             "Génération automatique de commentaires en langage naturel sur le profil client", "V2"],
        ["Prédiction de risque",    "Probabilité de défaut de paiement calculée sur 3/6/12 mois", "V2"],
      ]),
      ...spacer(2),

      // ──────────────────────────────────────────────────────────────────────
      // CONCLUSION
      // ──────────────────────────────────────────────────────────────────────
      titre1("Conclusion"),
      ligne(),
      ...spacer(1),
      para("Kandjou Fintech est une plateforme d'agrégation Mobile Money complète, fonctionnelle en mode simulation, et architecturée pour l'extension vers l'intelligence artificielle. Les 46 tests unitaires passent, le flux M2 → M3 → M1 → M4 est opérationnel, et les trois dashboards (Agent, Admin, Risque) sont déployés."),
      ...spacer(1),
      para("Les fonctionnalités décrites dans ce document représentent la version MVP académique. Elles couvrent l'intégralité du pipeline de scoring, la sécurité de niveau fintech (OTP, JWT, anti-brute force, audit trail), et une interface utilisateur professionnelle adaptée au contexte guinéen."),
      ...spacer(1),
      para("L'intégration de l'intelligence artificielle en V2 sera facilitée par les choix architecturaux de la V1 : Pattern Strategy, données normalisées, audit trail, et séparation claire des responsabilités entre modules.", { italic: true, color: C.bleuPrimaire }),
    ],
  }],
});

// Helpers supplémentaires définis après la déclaration du document
function titulo3_section(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: C.bleuClair, font: "Arial" })],
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("kandjou_specifications_v1.docx", buffer);
  console.log("OK - File generated: kandjou_specifications_v1.docx");
});
