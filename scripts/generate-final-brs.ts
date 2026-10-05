/* eslint-disable */
/**
 * Generate Final BRS Document (v2.0) for PERKESO Bulletin Dashboard
 * Incorporates all changes made during development vs the original BRS v1.0.
 *
 * Run: bun scripts/generate-final-brs.ts
 * Output: download/BRS_PERKESO_Bulletin_Dashboard_FINAL_v2.0.docx
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  TableOfContents,
  LevelFormat,
} from "docx";
import { writeFileSync, mkdirSync } from "fs";

// ============================================================
// Brand colors
// ============================================================
const C = {
  perkesoBlue: "007DC5",
  perkesoBlueDark: "004E7A",
  perkesoGreen: "8DC63E",
  perkesoGreenDark: "597E26",
  perkesoTeal: "00C5AB",
  perkesoGold: "F9BF10",
  perkesoOrange: "F27130",
  perkesoRed: "ED1C24",
  ideonixMidnight: "002147",
  ideonixAmber: "FFBF00",
  n900: "202124",
  n800: "3C4043",
  n600: "5F6368",
  n400: "9AA0A6",
  n200: "BDC1C6",
  white: "FFFFFF",
  lightBlue: "E8F4FA",
  lightGreen: "F0F8E8",
  lightGold: "FFF8E1",
  lightRed: "FDECEC",
  lightGray: "F5F5F5",
};

const FONT = "Inter";
const FONT_MONO = "Consolas";

// ============================================================
// Helpers
// ============================================================
function p(text: string, opts: { bold?: boolean; italic?: boolean; size?: number; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}): Paragraph {
  return new Paragraph({
    alignment: opts.align,
    spacing: { line: 312, after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts.size ?? 22,
        bold: opts.bold,
        italics: opts.italic,
        color: opts.color ?? C.n900,
      }),
    ],
  });
}

function h1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200, line: 312 },
    children: [new TextRun({ text, font: FONT, size: 36, bold: true, color: C.perkesoBlue })],
  });
}
function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160, line: 312 },
    children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: C.perkesoBlueDark })],
  });
}
function h3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 120, line: 312 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: C.perkesoGreenDark })],
  });
}

function bullet(text: string, level = 0): Paragraph {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, font: FONT, size: 22, color: C.n900 })],
  });
}

function numbered(text: string, reference: string): Paragraph {
  return new Paragraph({
    numbering: { reference, level: 0 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, font: FONT, size: 22, color: C.n900 })],
  });
}

function callout(text: string, color = C.perkesoBlue, bg = C.lightBlue): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 312 },
    shading: { type: ShadingType.CLEAR, fill: bg },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color },
      top: { style: BorderStyle.SINGLE, size: 4, color: bg },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: bg },
      right: { style: BorderStyle.SINGLE, size: 4, color: bg },
    },
    children: [new TextRun({ text, font: FONT, size: 21, color: C.n800 })],
  });
}

function spacer(): Paragraph {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun("")] });
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

function tc(text: string, opts: { bold?: boolean; color?: string; bg?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; width?: number } = {}): TableCell {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.bg ? { type: ShadingType.CLEAR, fill: opts.bg } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: opts.align,
        spacing: { line: 276 },
        children: [new TextRun({ text, font: FONT, size: 20, bold: opts.bold, color: opts.color ?? C.n900 })],
      }),
    ],
  });
}

function dataTable(headers: string[], rows: string[][], colWidths?: number[]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => tc(h, { bold: true, color: C.white, bg: C.perkesoBlue, width: colWidths?.[i] })),
  });
  const bodyRows = rows.map((r, idx) =>
    new TableRow({
      cantSplit: true,
      children: r.map((cell, i) => tc(cell, { bg: idx % 2 === 0 ? C.white : C.lightGray, width: colWidths?.[i] })),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
      left: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
      right: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: C.n200 },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: C.n200 },
    },
  });
}

// ============================================================
// COVER PAGE
// ============================================================
function buildCover(): (Paragraph | Table)[] {
  return [
    new Paragraph({
      spacing: { before: 0, after: 0 },
      shading: { type: ShadingType.CLEAR, fill: C.perkesoBlue },
      border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: C.perkesoGreen } },
      children: [new TextRun({ text: "", size: 8 })],
    }),
    spacer(), spacer(), spacer(), spacer(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "IDEONIX", font: FONT, size: 56, bold: true, color: C.ideonixMidnight })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "Penyelesaian Digital & Kejuruteraan Perisian", font: FONT, size: 22, italics: true, color: C.n600 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
      children: [new TextRun({ text: "Digital Solutions & Software Engineering", font: FONT, size: 18, italics: true, color: C.n400 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.ideonixAmber } },
      children: [new TextRun({ text: "", size: 4 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "DOKUMEN KEPERLUAN PERNIAGAAN", font: FONT, size: 24, bold: true, color: C.perkesoBlueDark })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [new TextRun({ text: "(BUSINESS REQUIREMENT SPECIFICATION — BRS)", font: FONT, size: 20, color: C.n600 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "PERKESO", font: FONT, size: 64, bold: true, color: C.perkesoBlue })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [new TextRun({ text: "Bulletin Dashboard", font: FONT, size: 48, bold: true, color: C.perkesoGreen })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({ text: "Portal Pengetahuan & Komunikasi Dalaman", font: FONT, size: 24, italics: true, color: C.n600 }),
        new TextRun({ text: "\n(Internal Knowledge & Communication Portal)", font: FONT, size: 18, italics: true, color: C.n400 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      shading: { type: ShadingType.CLEAR, fill: C.perkesoGold },
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: C.perkesoGold },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: C.perkesoGold },
        left: { style: BorderStyle.SINGLE, size: 4, color: C.perkesoGold },
        right: { style: BorderStyle.SINGLE, size: 4, color: C.perkesoGold },
      },
      children: [new TextRun({ text: "  VERSI 2.0 — FINAL (POST-DEVELOPMENT)  ", font: FONT, size: 24, bold: true, color: C.ideonixMidnight })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: "Dikemaskini dengan semua perubahan selepas pembangunan prototaip", font: FONT, size: 18, italics: true, color: C.n600 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: "Updated with all post-development changes", font: FONT, size: 16, italics: true, color: C.n400 })],
    }),
    new Table({
      width: { size: 80, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({ cantSplit: true, children: [tc("Perkara", { bold: true, color: C.white, bg: C.perkesoBlueDark, width: 35 }), tc("Butiran", { bold: true, color: C.white, bg: C.perkesoBlueDark, width: 65 })] }),
        new TableRow({ cantSplit: true, children: [tc("Klien"), tc("Pertubuhan Keselamatan Sosial (PERKESO)")] }),
        new TableRow({ cantSplit: true, children: [tc("Pembangun Sistem", { bg: C.lightGray }), tc("IDEONIX Sdn Bhd, Malaysia", { bg: C.lightGray })] }),
        new TableRow({ cantSplit: true, children: [tc("Nama Projek"), tc("PERKESO Bulletin Dashboard (Portal Pengetahuan & Komunikasi Dalaman)")] }),
        new TableRow({ cantSplit: true, children: [tc("Platform Teknologi", { bg: C.lightGray }), tc("Next.js 16 (React), TypeScript, Tailwind CSS 4, shadcn/ui, Prisma ORM + Supabase (PostgreSQL), Zustand, Recharts, Framer Motion", { bg: C.lightGray })] }),
        new TableRow({ cantSplit: true, children: [tc("Alat Pembangunan AI"), tc("Z.ai — Model GLM (AI-assisted development & code generation)")] }),
        new TableRow({ cantSplit: true, children: [tc("Versi Dokumen", { bg: C.lightGray }), tc("2.0 (Final — Post-Development)", { bg: C.lightGray, bold: true })] }),
        new TableRow({ cantSplit: true, children: [tc("Tarikh"), tc("30 Julai 2026")] }),
        new TableRow({ cantSplit: true, children: [tc("Status", { bg: C.lightGray }), tc("Selesai & Disahkan (Completed & Verified)", { bg: C.lightGray, bold: true, color: C.perkesoGreenDark })] }),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
        left: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
        right: { style: BorderStyle.SINGLE, size: 4, color: C.n200 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: C.n200 },
        insideVertical: { style: BorderStyle.SINGLE, size: 2, color: C.n200 },
      },
    }),
    pageBreak(),
  ];
}

// ============================================================
// REVISION HISTORY
// ============================================================
function buildRevisionHistory(): (Paragraph | Table)[] {
  return [
    h1("Sejarah Revisi Dokumen"),
    p("Dokumen ini merekodkan perubahan dari BRS v1.0 (asal) ke BRS v2.0 (final) berdasarkan keputusan pembangunan, penambahbaikan teknikal, dan penyesuaian keperluan yang dikenalpasti semasa fasa pembangunan prototaip."),
    spacer(),
    dataTable(
      ["Versi", "Tarikh", "Penerangan Perubahan", "Pengarang"],
      [
        ["1.0", "29 Julai 2026", "Dokumen asal — draf untuk semakan (Draft for Review)", "IDEONIX"],
        ["2.0", "30 Julai 2026", "FINAL — Menggabungkan semua perubahan selepas pembangunan: penghijrahan ke Supabase (PostgreSQL), pembetulan tema gelap/terang, penambahan ASIP Assistant AI Chatbot, penyediaan fail SQL Supabase, dokumentasi lengkap API dan seni bina", "IDEONIX"],
      ],
      [12, 18, 55, 15]
    ),
    spacer(),
    callout("Nota: Versi 2.0 menggantikan versi 1.0 sepenuhnya. Semua rujukan kepada 'data store tiruan (JSON)' dalam v1.0 telah dikemas kini kepada 'pangkalan data sebenar Supabase (PostgreSQL)' dalam v2.0.", C.perkesoGold, C.lightGold),
    pageBreak(),
  ];
}

// ============================================================
// TABLE OF CONTENTS
// ============================================================
function buildTOC(): (Paragraph | Table)[] {
  return [
    h1("Isi Kandungan"),
    p("Sila klik kanan pada senarai di bawah → 'Update Field' dalam Microsoft Word untuk menjana nombor muka surat automatik."),
    spacer(),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({
      spacing: { before: 200, after: 200 },
      children: [new TextRun({ text: "Sila kemaskini medan (Update Field) untuk nombor muka surat terkini.", font: FONT, size: 18, italics: true, color: C.n400 })],
    }),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 1: PENGENALAN
// ============================================================
function buildSection1(): (Paragraph | Table)[] {
  return [
    h1("1. PENGENALAN"),
    h2("1.1 Latar Belakang"),
    p("Pertubuhan Keselamatan Sosial (PERKESO) memerlukan satu platform digital dalaman yang bersepadu bagi memudahkan penyebaran maklumat, pengurusan dokumen operasi, serta komunikasi rasmi antara Ibu Pejabat, cawangan, dan kakitangan di seluruh negara. Buat masa ini, penyebaran maklumat seperti pekeliling, Akta, prosedur operasi standard (SOP), dan pengumuman dilakukan secara berselerak melalui e-mel, WhatsApp, dan portal yang tidak bersepadu, menyebabkan kesukaran capaian, versi dokumen yang tidak konsisten, dan kelewatan penyebaran maklumat penting."),
    p("IDEONIX Sdn Bhd dilantik untuk membangunkan sebuah sistem yang dinamakan \"PERKESO Bulletin Dashboard\", iaitu satu Portal Pengetahuan & Komunikasi Dalaman (Internal Knowledge & Communication Portal) yang menyediakan capaian terpusat kepada Akta, ASIP (Akta Sistem Insurans Pekerjaan), SOP, pekeliling, soalan lazim (FAQ), serta pengumuman rasmi organisasi."),
    h2("1.2 Tujuan Dokumen"),
    p("Dokumen Keperluan Perniagaan (BRS) versi 2.0 ini bertujuan untuk:"),
    bullet("Menerangkan skop, objektif, dan keperluan fungsian serta bukan fungsian bagi sistem PERKESO Bulletin Dashboard selepas siap pembangunan prototaip."),
    bullet("Merekodkan semua perubahan dari BRS v1.0 termasuk penghijrahan pangkalan data dari JSON mock ke Supabase PostgreSQL."),
    bullet("Menjadi rujukan rasmi antara pihak IDEONIX (pembangun) dan PERKESO (pemilik sistem) untuk fasa produksi akan datang."),
    bullet("Menetapkan asas reka bentuk antara muka pengguna (UI/UX) dengan kesan glassmorphism, identiti jenama, dan seni bina teknikal sistem."),
    bullet("Mendokumenkan keupayaan AI terintegrasi (ASIP Assistant) yang ditambah semasa pembangunan."),
    h2("1.3 Skop Projek"),
    p("Skop pembangunan meliputi reka bentuk dan pembangunan prototaip berfungsi (functional prototype) menggunakan Next.js 16 dengan pangkalan data sebenar Supabase (PostgreSQL). Sistem dibangunkan sebagai Single Page Application (SPA) yang responsif merentasi peranti desktop, tablet, dan mudah alih."),
    h3("1.3.1 Dalam Skop (In-Scope)"),
    bullet("Halaman Log Masuk (Mock Login) dengan peranan pengguna (role-based) — Admin dan Pengguna Am, dengan reka bentuk glassmorphism berjenama IDEONIX."),
    bullet("Papan Pemuka (Dashboard) utama dengan ringkasan bulletin, statistik, carta (Recharts), dan widget."),
    bullet("Navigasi Bar Sisi (Sidebar Navigation) responsif dengan menu boleh kolaps dan drawer hamburger pada mobile."),
    bullet("Modul Pengumuman/Berita (Announcement & News Module) dengan CRUD admin penuh."),
    bullet("Modul Akta (Act Module) dengan jadual dan CRUD admin."),
    bullet("Modul ASIP (ASIP Module) dengan kad dan CRUD admin."),
    bullet("Modul SOP (Standard Operating Procedure Module) dengan akordion dan editor langkah prosedur."),
    bullet("Modul Pekeliling (Circulars Module) dengan penanda wajib dan CRUD admin."),
    bullet("Modul Soalan Lazim (FAQ Module) dengan sidebar kategori dan CRUD admin."),
    bullet("Fungsi Carian Global (Global Search) merentasi semua modul dengan autosuggest dan penonjolan kata kunci."),
    bullet("Sistem Notifikasi (Notifications) dalam masa nyata (simulasi) dengan penandaan baca dan kod warna jenis."),
    bullet("Placeholder Pratonton Dokumen (Document Preview Placeholder) untuk PDF/DOCX."),
    bullet("Reka Bentuk Responsif (Responsive Layout) — Desktop, Tablet, Mobile."),
    bullet("Suis Mod Gelap/Terang (Dark Mode Toggle) — berfungsi penuh dengan attribute=class."),
    bullet("Pangkalan Data Sebenar Supabase (PostgreSQL) dengan Prisma ORM dan data seed realistik."),
    bullet("ASIP Assistant — Pembantu AI berintegrasi menggunakan Z.ai GLM untuk membantu kakitangan PERKESO."),
    bullet("Struktur Sedia-Admin (Admin-Ready Structure) untuk pengurusan kandungan (CRUD) dan pengurusan pengguna."),
    bullet("API REST penuh di bawah /api/* untuk semua modul (sedia untuk integrasi back-end sebenar)."),
    h3("1.3.2 Luar Skop (Out-of-Scope)"),
    bullet("Pengesahan pengguna sebenar (real authentication), Single Sign-On (SSO), atau integrasi Active Directory PERKESO."),
    bullet("Integrasi dengan sistem sedia ada PERKESO seperti SIC, e-SPTPTM, atau sistem HR dalaman."),
    bullet("Penghantaran e-mel/SMS sebenar bagi notifikasi."),
    bullet("Keperluan pematuhan MyGovCloud / SPKM secara penuh (akan dinilai pada fasa produksi berasingan)."),
    bullet("Muat naik fail dokumen sebenar (PDF/DOCX) — hanya placeholder pratonton disediakan."),
    h2("1.4 Objektif Projek"),
    numbered("Menyediakan satu platform tunggal (single source of truth) bagi semua maklumat rasmi, Akta, SOP, dan pekeliling PERKESO.", "obj"),
    numbered("Meningkatkan kecekapan capaian maklumat kakitangan melalui fungsi carian global dan kategori berstruktur.", "obj"),
    numbered("Mewujudkan pengalaman pengguna (UX) yang moden dengan kesan glassmorphism, konsisten dengan identiti jenama PERKESO dan IDEONIX.", "obj"),
    numbered("Membina asas seni bina sistem (front-end + back-end architecture) yang mudah dikembangkan (scalable) untuk integrasi penuh pada fasa produksi.", "obj"),
    numbered("Menyokong pembangunan pantas (rapid development) menggunakan bantuan AI generatif (Z.ai GLM) bagi mempercepatkan penghasilan kod.", "obj"),
    numbered("Menyediakan pembantu AI berintegrasi (ASIP Assistant) untuk membantu kakitangan mendapatkan maklumat PERKESO dengan cepat.", "obj"),
    h2("1.5 Perubahan Utama dari BRS v1.0"),
    p("Berikut adalah ringkasan perubahan utama yang dilakukan semasa pembangunan dan direkodkan dalam BRS v2.0 ini:"),
    spacer(),
    dataTable(
      ["Aspek", "BRS v1.0 (Asal)", "BRS v2.0 (Final)"],
      [
        ["Pangkalan Data", "Data store tiruan (JSON/JavaScript object)", "Supabase (PostgreSQL) dengan Prisma ORM — pangkalan data sebenar"],
        ["Back-End", "Mock API (simulasi)", "API REST penuh Next.js Route Handlers di /api/*"],
        ["Front-End Framework", "React.js (SPA dengan React Router)", "Next.js 16 (App Router) + TypeScript 5"],
        ["Styling", "Tailwind CSS / CSS Modules", "Tailwind CSS 4 + shadcn/ui (New York) + glassmorphism"],
        ["State Management", "React Context API / useState", "Zustand (auth + nav stores) dengan persist middleware"],
        ["Carta & Statistik", "Recharts / Chart.js", "Recharts (area chart, pie chart, bar chart)"],
        ["AI Assistant", "Tidak disebut", "ASIP Assistant — chatbot AI berintegrasi (Z.ai GLM)"],
        ["Tema Gelap/Terang", "Disebut (FR-14.x)", "Diperbaiki dengan attribute=class + resolvedTheme"],
        ["Pengurusan Aset", "Tidak disebut", "Prisma ORM + schema.sql + seed.sql Supabase"],
        ["Dokumentasi", "Asas", "README.md komprehensif + worklog.md pembangunan"],
      ],
      [22, 35, 43]
    ),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 2: STAKEHOLDERS
// ============================================================
function buildSection2(): (Paragraph | Table)[] {
  return [
    h1("2. PIHAK BERKEPENTINGAN (STAKEHOLDERS)"),
    p("Berikut adalah pihak-pihak berkepentingan dalam projek PERKESO Bulletin Dashboard:"),
    spacer(),
    dataTable(
      ["Peranan", "Organisasi", "Tanggungjawab"],
      [
        ["Pemilik Projek (Project Owner)", "PERKESO", "Meluluskan keperluan, identiti jenama, dan kandungan portal"],
        ["Pembangun Sistem (System Developer)", "IDEONIX Sdn Bhd", "Reka bentuk, pembangunan, dan penyampaian sistem"],
        ["Pentadbir Sistem (System Admin)", "PERKESO (Bahagian Komunikasi Korporat/ICT)", "Mengurus kandungan bulletin, pengumuman, pekeliling, dan pengguna"],
        ["Pengguna Akhir (End User)", "Kakitangan PERKESO seluruh cawangan", "Melayari, membaca, mencari maklumat rasmi, dan berinteraksi dengan ASIP Assistant"],
        ["Pembekal AI (AI Provider)", "Z.ai (GLM Model)", "Membekalkan keupayaan AI untuk ASIP Assistant chatbot"],
        ["Pembekal Pangkalan Data", "Supabase", "Menghoskan pangkalan data PostgreSQL untuk sistem"],
      ],
      [25, 30, 45]
    ),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 3: BRANDING
// ============================================================
function buildSection3(): (Paragraph | Table)[] {
  return [
    h1("3. IDENTITI VISUAL & PENJENAMAAN (BRANDING)"),
    h2("3.1 Identiti Jenama IDEONIX"),
    p("Logo IDEONIX menggunakan lettermark tersuai berbentuk huruf 'X' yang melambangkan pautan silang idea, sinergi kolaboratif, kekuatan struktur, dan ketangkasan (agility) dalam penyelesaian masalah. Dua warna teras jenama IDEONIX adalah seperti berikut:"),
    dataTable(
      ["Nama Warna", "Kod Warna", "Makna/Rasional"],
      [
        ["Midnight Blue", "#002147", "Kestabilan korporat — profesionalisme, integriti mendalam, kebijaksanaan strategik, dan kestabilan operasi"],
        ["Amber Orange", "#FFBF00", "Percikan Phoenix — tenaga kreatif dinamik, keberanian meneroka inovasi, dan pemikiran luar kotak"],
      ],
      [25, 20, 55]
    ),
    p("Warna jenama IDEONIX (#002147 & #FFBF00) digunakan sebagai warna aksen sekunder pada elemen berjenama IDEONIX sahaja (contoh: footer \"Powered by IDEONIX\", halaman log masuk, atau credit pembangun), manakala keseluruhan tema portal mengguna pakai identiti visual rasmi PERKESO seperti dijelaskan di bawah."),
    h2("3.2 Identiti Visual PERKESO (Tema Portal)"),
    p("Berdasarkan dokumen \"Identiti Visual & Penjenamaan (PERKESO)\" yang dibekalkan, palet warna berikut digunakan sebagai tema rasmi seluruh portal:"),
    h3("3.2.1 Warna Utama"),
    dataTable(
      ["Warna", "Kod HEX", "Kod RGB"],
      [
        ["Biru PERKESO (Primary Blue)", "#007DC5", "RGB(0, 125, 197)"],
        ["Putih (White) — latar belakang", "#FFFFFF", "RGB(255, 255, 255)"],
        ["Hijau PERKESO (Primary Green)", "#8DC63E", "RGB(141, 198, 62)"],
      ],
      [45, 25, 30]
    ),
    h3("3.2.2 Warna Sekunder"),
    dataTable(
      ["Warna Sekunder", "Kod HEX"],
      [
        ["Biru Gelap", "#004E7A"],
        ["Hijau Gelap", "#597E26"],
        ["Kehijauan Kebiruan (Teal)", "#00C5AB"],
        ["Kuning Emas", "#F9BF10"],
        ["Oren", "#F27130"],
        ["Merah", "#ED1C24"],
      ],
      [60, 40]
    ),
    h3("3.2.3 Warna Neutral"),
    dataTable(
      ["Warna Neutral", "Kod HEX"],
      [
        ["Neutral Paling Gelap (Teks Utama)", "#202124"],
        ["Neutral Gelap", "#3C4043"],
        ["Neutral Sederhana", "#5F6368"],
        ["Neutral Cerah", "#9AA0A6"],
        ["Neutral Paling Cerah (Garis/Border)", "#BDC1C6"],
      ],
      [60, 40]
    ),
    h2("3.3 Aplikasi Tema dalam Portal"),
    p("Berikut adalah aplikasi praktikal warna dalam pelbagai elemen antara muka portal:"),
    dataTable(
      ["Elemen Antara Muka", "Warna Digunakan"],
      [
        ["Header / Bar Navigasi Atas", "#007DC5 (Biru Utama PERKESO), teks putih #FFFFFF (mod terang) / #E8EEF2 (mod gelap)"],
        ["Sidebar Navigasi", "Latar glassmorphism (rgba putih/gelap), aksen aktif #007DC5"],
        ["Butang Tindakan Utama (Primary CTA)", "#007DC5 dengan hover #004E7A"],
        ["Lencana/Badge Status Baharu", "#8DC63E (Hijau) untuk 'Baharu'"],
        ["Lencana/Badge Status Segera/Penting", "#ED1C24 (Merah) untuk 'Segera/Penting'"],
        ["Lencana Wajib Dibaca (Mandatory)", "#ED1C24 (Merah) dengan animasi pulse"],
        ["Notifikasi Amaran", "#F9BF10 (Kuning Emas)"],
        ["Teks Badan (Body Text)", "#202124 (mod terang) / #E8EEF2 (mod gelap)"],
        ["Teks Sekunder / Placeholder", "#5F6368 / #9AA0A6"],
        ["Garis Pemisah (Divider/Border)", "#BDC1C6 / rgba(255,255,255,0.08)"],
        ["Latar Belakang Utama Portal", "#FFFFFF (mod terang) / #0A1419 (mod gelap) dengan kesan aurora gradient"],
        ["Footer Kredit Pembangun", "#002147 (Midnight Blue IDEONIX) dengan aksen #FFBF00 (Amber Orange)"],
        ["ASIP Assistant (Chatbot FAB)", "Gradient #007DC5 → #004E7A dengan glow #8DC63E"],
        ["Chatbot Panel", "Glassmorphism dengan gradient header #007DC5/#8DC63E"],
      ],
      [35, 65]
    ),
    h2("3.4 Kesan Glassmorphism"),
    p("Portal menggunakan kesan glassmorphism (kaca berpusar) secara meluas untuk memberikan pengalaman visual yang moden dan elegan. Berikut adalah spesifikasi teknikal kesan glassmorphism:"),
    bullet("Latar belakang: rgba(255, 255, 255, 0.65) (mod terang) / rgba(20, 36, 47, 0.55) (mod gelap)"),
    bullet("Blur: backdrop-filter: blur(16-24px) saturate(160-180%)"),
    bullet("Border: 1px solid rgba(255, 255, 255, 0.85) (terang) / rgba(255, 255, 255, 0.08) (gelap)"),
    bullet("Shadow: 0 8px 32px rgba(0, 78, 122, 0.08) (terang) / rgba(0, 0, 0, 0.4) (gelap)"),
    bullet("Kelas utility: .glass, .glass-strong, .glass-panel, .bg-brand-aurora, .bg-ideonix-gradient"),
    p("Fon (Font) dicadangkan: 'Inter' atau 'Roboto' bagi teks badan (sans-serif, jelas dibaca pada skrin), dan berat fon 'Bold/Semi-Bold' bagi tajuk utama, selaras dengan gaya tipografi moden yang digunakan pada bahan pemasaran IDEONIX."),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 4: SENI BINA TEKNIKAL
// ============================================================
function buildSection4(): (Paragraph | Table)[] {
  return [
    h1("4. SENI BINA TEKNIKAL SISTEM"),
    h2("4.1 Teknologi & Alatan"),
    p("Berikut adalah teknologi dan alatan yang digunakan dalam pembangunan PERKESO Bulletin Dashboard (versi final):"),
    dataTable(
      ["Komponen", "Teknologi/Alatan"],
      [
        ["Front-End Framework", "Next.js 16 (App Router, Turbopack) + React 19"],
        ["Bahasa Pengaturcaraan", "TypeScript 5 (strict typing)"],
        ["Reka Bentuk & Gaya (Styling)", "Tailwind CSS 4 + shadcn/ui (New York style) + CSS glassmorphism utilities"],
        ["Ikon", "Lucide React"],
        ["Carta & Statistik Dashboard", "Recharts (Area, Pie, Bar charts)"],
        ["Pengurusan Status (State Management)", "Zustand (dengan persist middleware untuk auth) + TanStack Query-ready"],
        ["Animasi", "Framer Motion (transisi halaman, hover, modul)"],
        ["Pangkalan Data", "Supabase (PostgreSQL) — pangkalan data sebenar"],
        ["ORM (Object-Relational Mapping)", "Prisma ORM 6.x dengan Prisma Client"],
        ["Back-End API", "Next.js Route Handlers (REST API di bawah /api/*)"],
        ["Pembantu AI (AI Assistant)", "Z.ai Web Dev SDK (GLM model) untuk ASIP Assistant chatbot"],
        ["Toasts & Notifikasi UI", "Sonner"],
        ["Forms & Validation", "React Hook Form + Zod"],
        ["Suis Tema (Dark/Light)", "next-themes (attribute=class, resolvedTheme)"],
        ["Alat Bantuan Pembangunan AI", "Z.ai — Model GLM (penjanaan kod, komponen React, dan logik API)"],
        ["Kawalan Versi", "Git / GitHub (https://github.com/iich4/bulletin-dashboard)"],
        ["Responsive Design", "Mobile-first, breakpoint mengikut standard Tailwind (sm, md, lg, xl)"],
      ],
      [30, 70]
    ),
    h2("4.2 Struktur Pangkalan Data (Supabase PostgreSQL)"),
    p("Pangkalan data menggunakan Supabase (PostgreSQL) yang diakses melalui Prisma ORM. Skema pangkalan data ditakrif dalam prisma/schema.prisma dan fail SQL (supabase/schema.sql + supabase/seed.sql) disediakan untuk permulaan pangkalan data melalui Supabase SQL Editor. Struktur data adalah seperti berikut:"),
    dataTable(
      ["Entiti", "Medan Data (Fields)"],
      [
        ["User", "id, email (unique), name, password, role (Admin/Staff), department, branch, position, avatarUrl, isActive, lastLogin, createdAt, updatedAt"],
        ["Announcement", "id, title, category, summary, content, authorId, authorName, isPinned, isNew, isUrgent, attachments (JSON), coverColor, datePublished, createdAt, updatedAt"],
        ["Act", "id, actNumber, title, category, description, fileUrl, fileName, fileSize, version, status (Aktif/Digantungan/Digantikan/Dalam Semakan), lastUpdated, createdAt, updatedAt"],
        ["Asip", "id, title, referenceNo, description, effectiveDate, fileUrl, fileName, fileSize, status (Aktif/Digantikan/Dalam Semakan), category, createdAt, updatedAt"],
        ["Sop", "id, title, department, description, procedureSteps (JSON array), fileUrl, fileName, fileSize, version, approvedBy, dateApproved, status, createdAt, updatedAt"],
        ["Circular", "id, circularNo, title, category, summary, content, fileUrl, fileName, fileSize, isMandatory, dateIssued, createdAt, updatedAt"],
        ["Faq", "id, question, answer, category, tags (JSON array), createdAt, updatedAt"],
        ["Notification", "id, userId (FK → User), title, message, type (info/warning/success/critical), module, refId, isRead, createdAt"],
      ],
      [18, 82]
    ),
    callout("Perubahan dari v1.0: BRS v1.0 menetapkan penggunaan 'data store tiruan (JSON)' — dalam v2.0, ini telah dinaik taraf kepada pangkalan data sebenar Supabase (PostgreSQL) dengan Prisma ORM. Semua medan JSON (attachments, procedureSteps, tags) disimpan sebagai TEXT dengan JSON.stringify dan diuraikan dengan JSON.parse di sisi aplikasi.", C.perkesoGold, C.lightGold),
    h2("4.3 Struktur Folder Projek"),
    p("Struktur folder projek Next.js 16 adalah seperti berikut:"),
    new Paragraph({
      spacing: { line: 276, after: 80 },
      shading: { type: ShadingType.CLEAR, fill: C.n900 },
      children: [
        new TextRun({ text: "bulletin-dashboard/\n├── prisma/\n│   ├── schema.prisma          # Skema 8 entiti\n│   ├── seed.ts                 # Seed data (untuk SQLite/lokal)\n│   └── generate-seed-sql.ts    # Penjana supabase/seed.sql\n├── supabase/\n│   ├── schema.sql              # DDL untuk Supabase SQL Editor\n│   └── seed.sql                 # INSERT statements untuk seed data\n├── src/\n│   ├── app/\n│   │   ├── api/                # REST API routes\n│   │   │   ├── auth/login/      # POST /api/auth/login\n│   │   │   ├── announcements/   # GET/POST/PATCH/DELETE\n│   │   │   ├── acts/            # GET/POST/PATCH/DELETE\n│   │   │   ├── asip/            # GET/POST/PATCH/DELETE\n│   │   │   ├── sop/             # GET/POST/PATCH/DELETE\n│   │   │   ├── circulars/       # GET/POST/PATCH/DELETE\n│   │   │   ├── faq/             # GET/POST/PATCH/DELETE\n│   │   │   ├── notifications/   # GET/POST/PATCH\n│   │   │   ├── search/          # GET (carian global)\n│   │   │   ├── users/           # GET/POST/PATCH/DELETE\n│   │   │   ├── dashboard-stats/ # GET (statistik agregat)\n│   │   │   └── chat/            # POST (ASIP Assistant AI)\n│   │   ├── globals.css          # Tailwind + glassmorphism utilities\n│   │   ├── layout.tsx           # Root layout dengan ThemeProvider\n│   │   └── page.tsx             # Auth gate + shell dengan semua modul\n│   ├── components/\n│   │   ├── ui/                  # shadcn/ui component library\n│   │   ├── layout/              # Sidebar, Header, Footer, LoginPage\n│   │   ├── dashboard/           # DashboardPage\n│   │   ├── modules/             # 7 halaman modul\n│   │   ├── common/              # GlassCard, FileIcon, DocPreviewProvider\n│   │   └── chat/                # ChatAssistant (AI chatbot widget)\n│   ├── stores/                  # Zustand stores (auth-store, nav-store)\n│   ├── lib/                     # db client, api helpers, types, utils\n│   └── hooks/                   # use-mobile, use-toast\n├── .env.example                 # Template DATABASE_URL Supabase\n├── package.json                 # Dependencies + scripts\n├── README.md                    # Dokumentasi penuh\n└── worklog.md                   # Log pembangunan", font: FONT_MONO, size: 16, color: C.white }),
      ],
    }),
    h2("4.4 Konfigurasi Pangkalan Data (Supabase)"),
    p("Pangkalan data dikonfigurasi menggunakan dua pembolehubah persekitaran (environment variables):"),
    bullet("DATABASE_URL — URL sambungan Supabase (pooled untuk serverless, port 6543) atau langsung (port 5432) untuk dev."),
    bullet("DIRECT_URL — URL sambungan langsung Supabase (port 5432), digunakan oleh Prisma CLI untuk migrasi/push."),
    p("Konfigurasi dalam prisma/schema.prisma:"),
    new Paragraph({
      spacing: { line: 276, after: 80 },
      shading: { type: ShadingType.CLEAR, fill: C.n900 },
      children: [new TextRun({ text: 'datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}', font: FONT_MONO, size: 18, color: C.perkesoGreen })],
    }),
    p("Permulaan pangkalan data boleh dilakukan dengan dua kaedah:"),
    bullet("Kaedah A (CLI): bun run db:push && bun run db:seed — memerlukan akses rangkaian ke port 5432."),
    bullet("Kaedah B (SQL Editor): Tampal supabase/schema.sql kemudian supabase/seed.sql ke Supabase Dashboard SQL Editor — berfungsi di mana-mana."),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 5: FUNCTIONAL REQUIREMENTS
// ============================================================
function buildSection5(): (Paragraph | Table)[] {
  return [
    h1("5. KEPERLUAN FUNGSIAN (FUNCTIONAL REQUIREMENTS)"),
    h2("5.1 Halaman Log Masuk (Mock Login Page)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-1.1", "Sistem mesti memaparkan borang log masuk dengan medan E-mel/ID Pengguna dan Kata Laluan."],
        ["FR-1.2", "Sistem mesti memaparkan logo IDEONIX dan/atau logo PERKESO pada halaman log masuk mengikut identiti jenama yang ditetapkan."],
        ["FR-1.3", "Log masuk disimulasikan (mock authentication) menggunakan data pengguna dari pangkalan data Supabase — pengesahan kata laluan dilakukan di back-end API /api/auth/login."],
        ["FR-1.4", "Sistem mesti menyokong dua peranan pengguna: Admin dan Pengguna Am (Staff), yang menentukan paparan menu dan hak capaian selepas log masuk."],
        ["FR-1.5", "Sistem mesti memaparkan mesej ralat mudah jika medan input tidak diisi (validasi asas borang)."],
        ["FR-1.6", "Latar belakang halaman log masuk menggunakan gradient IDEONIX (#002147) dengan aksen Amber Orange (#FFBF00) dan blob biru/hijau beranimasi."],
        ["FR-1.7 (BARU)", "Kad log masuk menggunakan kesan glassmorphism dengan latar rgba(15,28,42,0.55) dan blur(24px) — tema-bebas (sentiasa gelap pada gradient IDEONIX)."],
        ["FR-1.8 (BARU)", "Butang akaun demo (Admin/Staff) disediakan untuk auto-isi e-mel dan kata laluan — memudahkan ujian."],
      ],
      [12, 88]
    ),
    h2("5.2 Papan Pemuka (Dashboard) Utama"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-2.1", "Papan pemuka memaparkan ringkasan kad statistik (Jumlah Pengumuman Aktif, Akta & Peraturan, SOP Baharu, Pekeliling Wajib)."],
        ["FR-2.2", "Papan pemuka memaparkan senarai 'Pengumuman Terkini' dengan label 'Baharu' menggunakan lencana hijau (#8DC63E)."],
        ["FR-2.3", "Papan pemuka memaparkan carta ringkas menggunakan Recharts: Area Chart (trend pengumuman bulanan 6 bulan) dan Pie Chart (SOP mengikut jabatan)."],
        ["FR-2.4", "Papan pemuka memaparkan pautan pintasan (quick links) kepada modul Akta, ASIP, SOP, Pekeliling, Pengumuman, dan FAQ."],
        ["FR-2.5", "Papan pemuka mesti responsif dan menyusun semula widget mengikut susunan bertindih (stacked) pada paparan mudah alih."],
        ["FR-2.6 (BARU)", "Papan pemuka memaparkan widget 'Pekeliling Terkini' dengan butang 'Lihat Dokumen' yang membuka placeholder pratonton dokumen."],
        ["FR-2.7 (BARU)", "Papan pemuka memaparkan barisan 'Analitik Kandungan' dengan 4 kad statistik tambahan (FAQ, ASIP, Pekeliling, Pengumuman)."],
      ],
      [12, 88]
    ),
    h2("5.3 Navigasi Bar Sisi (Sidebar Navigation)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-3.1", "Sidebar memaparkan menu: Dashboard, Pengumuman, Akta, ASIP, SOP, Pekeliling, FAQ, dan (jika Admin) Panel Pentadbiran."],
        ["FR-3.2", "Sidebar boleh dikolapskan (collapse/expand) untuk memaksimumkan ruang paparan kandungan."],
        ["FR-3.3", "Item menu aktif mesti ditonjolkan menggunakan warna Biru PERKESO (#007DC5) sebagai penanda status aktif dengan animasi Framer Motion."],
        ["FR-3.4", "Pada paparan mudah alih, sidebar bertukar menjadi menu hamburger/drawer yang boleh ditarik keluar (slide-in) dengan overlay backdrop."],
        ["FR-3.5", "Sidebar memaparkan ikon setiap modul bagi memudahkan pengecaman visual pantas."],
      ],
      [12, 88]
    ),
    h2("5.4 Modul Pengumuman/Berita (Announcement & News Module)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-4.1", "Memaparkan senarai pengumuman dalam bentuk kad (card list) dengan tajuk, ringkasan, tarikh, kategori, dan status (Baharu/Segera/Disemat)."],
        ["FR-4.2", "Pengguna boleh menapis (filter) pengumuman mengikut kategori (Korporat, HR, Operasi, Kesihatan & Keselamatan, ICT, Kewangan) dan mencari dengan kata kunci."],
        ["FR-4.3", "Klik pada pengumuman membuka paparan penuh (detail view) atau modal dengan kandungan lengkap dan lampiran (jika ada)."],
        ["FR-4.4", "Pengumuman disemat (pinned) mesti sentiasa terpapar di bahagian teratas senarai."],
        ["FR-4.5", "(Admin) Antara muka membenarkan Tambah/Edit/Padam pengumuman (CRUD terhadap pangkalan data Supabase)."],
        ["FR-4.6 (BARU)", "Borang admin menyokong medan isPinned, isUrgent, coverColor (pemilih warna), dan lampiran dinamik (tambah/buang baris nama/jenis/saiz)."],
      ],
      [12, 88]
    ),
    h2("5.5 Modul Akta (Act Module)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-5.1", "Memaparkan senarai Akta berkaitan PERKESO dalam format jadual berkategori."],
        ["FR-5.2", "Setiap entri Akta memaparkan nombor akta, tajuk, tarikh kemas kini terakhir, dan versi dokumen."],
        ["FR-5.3", "Pengguna boleh mencari Akta menggunakan kata kunci tajuk atau nombor akta (carian tidak peka huruf — mode: insensitive)."],
        ["FR-5.4", "Klik pada Akta membuka placeholder pratonton dokumen."],
        ["FR-5.5", "(Admin) Membenarkan muat naik (simulasi) dan pengurusan metadata Akta baharu."],
        ["FR-5.6 (BARU)", "Penapis status (Aktif/Digantungan/Digantikan/Dalam Semakan) dengan lencana berwarna."],
      ],
      [12, 88]
    ),
    h2("5.6 Modul ASIP (ASIP Module)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-6.1", "Memaparkan senarai dokumen ASIP dengan nombor rujukan, tajuk, tarikh berkuat kuasa, dan status (Aktif/Digantikan/Dalam Semakan)."],
        ["FR-6.2", "Pengguna boleh menapis ASIP mengikut status dan tarikh berkuat kuasa."],
        ["FR-6.3", "Paparan terperinci ASIP memaparkan ringkasan kandungan dan pautan pratonton dokumen."],
        ["FR-6.4", "(Admin) Membenarkan pengurusan (tambah/kemas kini/nyahaktifkan) entri ASIP."],
      ],
      [12, 88]
    ),
    h2("5.7 Modul SOP (SOP Module)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-7.1", "Memaparkan senarai SOP mengikut jabatan/bahagian."],
        ["FR-7.2", "Setiap SOP memaparkan versi, tarikh diluluskan, pelulus (approved by), dan langkah-langkah prosedur ringkas."],
        ["FR-7.3", "SOP boleh dikembangkan (expand/accordion) untuk memaparkan langkah prosedur penuh dalam format senarai bernombor."],
        ["FR-7.4", "(Admin) Membenarkan pengurusan versi SOP dengan editor langkah dinamik (tambah/buang/gerak atas-bawah)."],
      ],
      [12, 88]
    ),
    h2("5.8 Modul Pekeliling (Circulars Module)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-8.1", "Memaparkan senarai pekeliling rasmi dengan nombor pekeliling, tajuk, tarikh dikeluarkan, dan kategori."],
        ["FR-8.2", "Pekeliling wajib (mandatory) ditandakan dengan lencana 'WAJIB DIBACA' warna merah (#ED1C24) dengan animasi pulse."],
        ["FR-8.3", "Pengguna boleh menapis dan menyusun pekeliling mengikut tarikh terkini/terlama dan menapis hanya yang wajib."],
        ["FR-8.4", "(Admin) Membenarkan penerbitan pekeliling baharu dengan suis isMandatory."],
      ],
      [12, 88]
    ),
    h2("5.9 Modul Soalan Lazim (FAQ Module)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-9.1", "Memaparkan senarai soalan lazim dalam format accordion (soalan boleh diklik untuk memaparkan jawapan)."],
        ["FR-9.2", "FAQ dikategorikan mengikut topik (Caruman, Pampasan, Permohonan, Sistem, Lain-lain) dengan sidebar kategori."],
        ["FR-9.3", "Terdapat fungsi carian dalaman khas untuk modul FAQ."],
        ["FR-9.4", "(Admin) Membenarkan tambah/edit/padam pasangan soalan-jawapan dengan tag."],
      ],
      [12, 88]
    ),
    h2("5.10 Carian Global (Global Search)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-10.1", "Bar carian global terletak pada header, boleh diakses dari mana-mana halaman dalam portal."],
        ["FR-10.2", "Carian mesti merentasi semua modul (Pengumuman, Akta, ASIP, SOP, Pekeliling, FAQ) secara serentak menggunakan API /api/search."],
        ["FR-10.3", "Keputusan carian dipaparkan berkategori mengikut modul asal, dengan penonjolan kata kunci (highlight) menggunakan tag <mark>."],
        ["FR-10.4", "Carian mesti memaparkan cadangan pantas (autosuggest/dropdown) semasa pengguna menaip dengan debounce 250ms."],
        ["FR-10.5 (BARU)", "Carian tidak peka huruf (case-insensitive) — menggunakan mode: 'insensitive' pada PostgreSQL contains filter."],
        ["FR-10.6 (BARU)", "Pintasan papan kekunci Cmd+K / Ctrl+K untuk fokus medan carian."],
      ],
      [12, 88]
    ),
    h2("5.11 Notifikasi (Notifications)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-11.1", "Ikon loceng notifikasi pada header memaparkan bilangan notifikasi belum dibaca (badge counter) dengan animasi pulse."],
        ["FR-11.2", "Panel dropdown notifikasi memaparkan senarai kemas kini terkini (pengumuman baharu, pekeliling baharu, SOP dikemas kini)."],
        ["FR-11.3", "Pengguna boleh menanda notifikasi sebagai 'telah dibaca' (PATCH /api/notifications?id=) atau 'tanda semua dibaca' (PATCH ?action=readAll)."],
        ["FR-11.4", "Notifikasi dikategorikan mengikut jenis (Info, Amaran, Kritikal, Berjaya) dengan kod warna (#007DC5, #F9BF10, #ED1C24, #8DC63E)."],
        ["FR-11.5 (BARU)", "Panel notifikasi auto-refresh setiap 30 saat untuk paparan terkini."],
      ],
      [12, 88]
    ),
    h2("5.12 Placeholder Pratonton Dokumen (Document Preview Placeholder)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-12.1", "Setiap dokumen (Akta, ASIP, SOP, Pekeliling) mesti mempunyai butang 'Lihat Dokumen' yang membuka modal/panel pratonton."],
        ["FR-12.2", "Placeholder pratonton memaparkan ikon jenis fail (PDF/DOCX/XLSX), nama fail, saiz fail, dan mesej 'Pratonton Dokumen Tidak Tersedia dalam Prototaip'."],
        ["FR-12.3", "Placeholder menyediakan butang 'Muat Turun' (disabled) untuk fasa produksi akan datang."],
        ["FR-12.4 (BARU)", "Pratonton disediakan melalui DocPreviewProvider context — boleh dipanggil dari mana-mana komponen dengan useDocPreview().preview()."],
      ],
      [12, 88]
    ),
    h2("5.13 Reka Bentuk Responsif (Responsive Layout)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-13.1", "Portal mesti berfungsi dan kelihatan konsisten pada resolusi Desktop (≥1280px), Tablet (768px–1279px), dan Mudah Alih (≤767px)."],
        ["FR-13.2", "Susun atur grid/card mesti bertukar daripada berbilang lajur (desktop) kepada satu/dua lajur (mudah alih)."],
        ["FR-13.3", "Sidebar bertukar kepada menu hamburger pada paparan mudah alih."],
      ],
      [12, 88]
    ),
    h2("5.14 Suis Mod Gelap/Terang (Dark Mode Toggle)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-14.1", "Terdapat suis (toggle button) pada header untuk menukar antara Mod Terang dan Mod Gelap dengan ikon Sun/Moon beranimasi."],
        ["FR-14.2", "Mod Terang menggunakan latar #FFFFFF dengan teks #202124; Mod Gelap menggunakan latar #0A1419 dengan teks #E8EEF2, dengan warna Biru PERKESO (#007DC5/#1A9FE6) dan Hijau (#8DC63E/#9FD958) kekal sebagai aksen dalam kedua-dua mod."],
        ["FR-14.3", "Pilihan mod pengguna disimpan dalam localStorage melalui next-themes (persist sepanjang sesi pelayaran)."],
        ["FR-14.4 (DIPERBAIKI)", "Tema dikonfigurasi dengan attribute='class', defaultTheme='light', enableSystem=false untuk mengelakkan isu 'theme=system' yang menyebabkan togol tidak berfungsi. Menggunakan resolvedTheme (bukan theme) dengan mounted guard."],
      ],
      [12, 88]
    ),
    h2("5.15 Struktur Sedia-Admin (Admin-Ready Structure)"),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-15.1", "Pengguna berperanan Admin mempunyai akses kepada Panel Pentadbiran berasingan melalui sidebar."],
        ["FR-15.2", "Panel Pentadbiran menyediakan antara muka pengurusan kandungan (Content Management) bagi semua modul: Tambah, Edit, Padam (CRUD) terhadap pangkalan data Supabase."],
        ["FR-15.3", "Panel Pentadbiran memaparkan jadual pengurusan pengguna (User Management) — senarai pengguna, peranan, dan status dengan CRUD penuh."],
        ["FR-15.4", "Struktur kod (folder/komponen) direka supaya mudah disambungkan (plug-and-play) kepada API back-end sebenar pada fasa produksi tanpa perubahan besar."],
      ],
      [12, 88]
    ),
    h2("5.16 ASIP Assistant — Pembantu AI Berintegrasi (BARU)"),
    callout("Modul ini adalah PENAMBAHAN BARU dalam BRS v2.0. Ia tidak terdapat dalam BRS v1.0 asal.", C.perkesoGreen, C.lightGreen),
    dataTable(
      ["ID", "Keperluan"],
      [
        ["FR-16.1", "Sistem menyediakan pembantu AI berintegrasi bernama 'ASIP Assistant' yang boleh diakses melalui butang terapung (Floating Action Button) di bahagian bawah-kanan skrin."],
        ["FR-16.2", "ASIP Assistant dikuasakan oleh Z.ai GLM model melalui API /api/chat menggunakan z-ai-web-dev-sdk (back-end sahaja)."],
        ["FR-16.3", "ASIP Assistant mempunyai konteks pengetahuan PERKESO: modul portal, kadar caruman (1.75%+1.75%=3.5%), Akta rujukan (428, 799, 139), hotline, dan prosedur."],
        ["FR-16.4", "ASIP Assistant menjawab dalam Bahasa Melayu rasmi tetapi mesra, maksimum 3-4 perenggan, berstruktur."],
        ["FR-16.5", "Panel sembang menggunakan kesan glassmorphism dengan sejarah mesej, penunjuk menaip (typing indicator), dan cadangan soalan pantas."],
        ["FR-16.6", "Pengguna boleh menambah, menghantar (Enter), atau membuat baris baru (Shift+Enter) dalam medan input."],
        ["FR-16.7", "ASIP Assistant mengesan rujukan modul dalam jawapan AI dan memaparkan butang navigasi pantas (contoh: 'Buka Pekeliling →') yang menukar halaman SPA."],
        ["FR-16.8", "Sejarah perbualan dihadkan kepada 12 mesej terkini untuk pengurusan token."],
        ["FR-16.9", "Butang 'Padam Perbualan' disediakan untuk memulakan sesi baharu."],
        ["FR-16.10", "ASIP Assistant hanya tersedia selepas log masuk (tidak dipaparkan di halaman log masuk)."],
      ],
      [12, 88]
    ),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 6: NON-FUNCTIONAL REQUIREMENTS
// ============================================================
function buildSection6(): (Paragraph | Table)[] {
  return [
    h1("6. KEPERLUAN BUKAN FUNGSIAN (NON-FUNCTIONAL REQUIREMENTS)"),
    dataTable(
      ["Kategori", "ID", "Keperluan"],
      [
        ["Kebolehgunaan (Usability)", "NFR-1", "Antara muka mesti intuitif, konsisten dengan identiti visual PERKESO, dan boleh dinavigasi tanpa latihan khas."],
        ["Prestasi (Performance)", "NFR-2", "Masa muat setiap halaman (page load) tidak melebihi 2 saat dalam persekitaran prototaip."],
        ["Kebolehskalaan (Scalability)", "NFR-3", "Seni bina komponen React mesti modular dan boleh dikembangkan untuk menampung integrasi API sebenar."],
        ["Keserasian Pelayar (Compatibility)", "NFR-4", "Portal mesti serasi dengan pelayar utama: Google Chrome, Microsoft Edge, Mozilla Firefox, Safari (versi terkini)."],
        ["Responsif (Responsiveness)", "NFR-5", "Reka bentuk mesti mengikut prinsip mobile-first dan responsif sepenuhnya."],
        ["Kebolehcapaian (Accessibility)", "NFR-6", "Kontras warna teks/latar mesti mematuhi garis panduan WCAG AA asas, terutamanya dalam mod gelap."],
        ["Keselamatan (Security)", "NFR-7", "Walaupun log masuk adalah tiruan (mock), struktur kod memisahkan logik pengesahan (auth logic) untuk memudahkan penggantian dengan sistem pengesahan sebenar kelak. Kata laluan disimpan dalam pangkalan data (prototype) — akan dihash dengan bcrypt pada fasa produksi."],
        ["Penyelenggaraan (Maintainability)", "NFR-8", "Kod mesti dikomen dengan baik dan mengikut konvensyen penamaan (naming convention) yang konsisten."],
        ["Kebolehsambungan (Extensibility) — BARU", "NFR-9", "API REST di bawah /api/* direka bentuk untuk mudah disambung ke pangkalan data sebenar atau perkhidmatan luar tanpa perubahan besar pada komponen React."],
        ["Pengoptimuman AI (AI Optimization) — BARU", "NFR-10", "ASIP Assistant menggunakan singleton ZAI instance dan menghadkan sejarah mesej kepada 12 untuk pengurusan token dan prestasi optimum."],
      ],
      [25, 8, 67]
    ),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 7: Z.AI DEVELOPMENT APPROACH
// ============================================================
function buildSection7(): (Paragraph | Table)[] {
  return [
    h1("7. PENDEKATAN PEMBANGUNAN MENGGUNAKAN Z.AI (MODEL GLM)"),
    p("Pasukan pembangunan IDEONIX menggunakan platform Z.ai dengan model GLM sebagai alat bantuan pembangunan pantas (AI-assisted rapid development) bagi mempercepatkan penghasilan kod komponen React, logik API, dan penjanaan struktur styling berasaskan tema warna yang ditetapkan dalam Seksyen 3."),
    h2("7.1 Panduan Prompt Pembangunan"),
    bullet("Setiap prompt kepada GLM mesti menyertakan rujukan kod warna rasmi (#007DC5, #8DC63E, #FFFFFF, dan warna sekunder/neutral) bagi memastikan konsistensi tema."),
    bullet("Prompt komponen mesti menyatakan keperluan responsif (mobile-first) secara eksplisit."),
    bullet("Struktur data (mock data schema) dalam Seksyen 4.2 dijadikan rujukan tetap semasa menjana logik komponen."),
    bullet("Kod yang dijana oleh GLM mesti disemak semula (code review) oleh jurutera IDEONIX sebelum digabungkan (merge) ke repositori utama."),
    h2("7.2 Aliran Kerja Pembangunan (Development Workflow)"),
    numbered("Definisi keperluan modul berdasarkan BRS ini.", "wf"),
    numbered("Penjanaan awal komponen React dan API routes melalui Z.ai (GLM).", "wf"),
    numbered("Semakan dan penambahbaikan kod oleh jurutera perisian IDEONIX.", "wf"),
    numbered("Ujian fungsian (functional testing) merentasi peranti dan mod (gelap/terang).", "wf"),
    numbered("Penghijrahan pangkalan data dari SQLite/JSON mock ke Supabase PostgreSQL.", "wf"),
    numbered("Penambahan ASIP Assistant AI chatbot berintegrasi.", "wf"),
    numbered("Semakan dan kelulusan oleh pihak PERKESO.", "wf"),
    numbered("Penyerahan prototaip berfungsi (deployment ke GitHub + dokumentasi).", "wf"),
    h2("7.3 Penggunaan Subagent Selari (Parallel Subagents)"),
    p("Semasa pembangunan, IDEONIX menggunakan pendekatan subagent selari untuk mempercepatkan penghasilan modul:"),
    bullet("Subagent A: Membina modul Pengumuman, Akta, ASIP (3 modul)."),
    bullet("Subagent B: Membina modul SOP, Pekeliling, FAQ (3 modul)."),
    bullet("Subagent C: Membina Panel Pentadbiran (Admin Panel) dengan pengurusan kandungan dan pengguna."),
    p("Setiap subagent diberikan Task ID, membaca worklog.md untuk konteks, dan menambah entri worklog selepas siap. Pendekatan ini membolehkan 3 modul dibina serentak."),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 8: USE CASES
// ============================================================
function buildSection8(): (Paragraph | Table)[] {
  return [
    h1("8. SENARIO / KES PENGGUNAAN (USE CASES)"),
    dataTable(
      ["ID", "Aktor", "Penerangan Senario"],
      [
        ["UC-01", "Pengguna Am", "Log masuk ke portal dan melihat papan pemuka ringkasan pengumuman terkini."],
        ["UC-02", "Pengguna Am", "Menggunakan carian global untuk mencari SOP berkaitan tuntutan pampasan pekerja."],
        ["UC-03", "Pengguna Am", "Menukar mod paparan kepada mod gelap semasa bekerja waktu malam."],
        ["UC-04", "Pengguna Am", "Melihat notifikasi pekeliling baharu dan menandakannya sebagai telah dibaca."],
        ["UC-05", "Admin", "Menambah pengumuman baharu dan menyematkannya (pin) pada papan pemuka."],
        ["UC-06", "Admin", "Mengemas kini metadata Akta sedia ada melalui Panel Pentadbiran."],
        ["UC-07", "Pengguna Am (Mudah Alih)", "Melayari portal menggunakan telefon pintar dan mengakses menu melalui sidebar hamburger."],
        ["UC-08 (BARU)", "Pengguna Am", "Bertanya ASIP Assistant 'Apakah kadar caruman PERKESO?' dan menerima jawapan dengan cadangan navigasi ke modul Akta/ASIP."],
        ["UC-09 (BARU)", "Admin", "Menambah pengguna baharu melalui Panel Pentadbiran → Pengurusan Pengguna."],
        ["UC-10 (BARU)", "Pengguna Am", "Menggunakan pintasan Cmd+K untuk membuka carian global dan mencari pekeliling wajib."],
      ],
      [10, 22, 68]
    ),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 9: ASSUMPTIONS & CONSTRAINTS
// ============================================================
function buildSection9(): (Paragraph | Table)[] {
  return [
    h1("9. ANDAIAN DAN KEKANGAN"),
    h2("9.1 Andaian"),
    bullet("Semua kandungan (Akta, SOP, pekeliling, FAQ) yang digunakan dalam prototaip adalah data contoh/tiruan (sample/dummy data) dan bukan dokumen rasmi sebenar melainkan dinyatakan sebaliknya oleh PERKESO."),
    bullet("Pihak PERKESO akan membekalkan kandungan sebenar (jika perlu) pada fasa produksi selepas prototaip diluluskan."),
    bullet("Fail logo dan garis panduan identiti visual yang dibekalkan adalah versi muktamad (final) untuk tujuan pembangunan tema."),
    bullet("Pangkalan data Supabase (PostgreSQL) dikonfigurasi dengan plan percuma atau berbayar yang mencukupi untuk prototaip."),
    bullet("ASIP Assistant menggunakan Z.ai GLM model dengan rate limit yang mencukupi untuk penggunaan prototaip."),
    h2("9.2 Kekangan"),
    bullet("Prototaip ini tidak disambungkan kepada sistem pengesahan sebenar PERKESO (SSO/AD)."),
    bullet("Sebarang fail dokumen sebenar (PDF/DOCX) tidak dimuat naik dalam fasa ini; hanya placeholder pratonton disediakan."),
    bullet("Had masa pembangunan tertakluk kepada jadual projek yang dipersetujui bersama antara IDEONIX dan PERKESO."),
    bullet("ASIP Assistant mungkin terhad kepada topik PERKESO sahaja — soalan di luar skop akan ditolak dengan sopan."),
    bullet("Carian global tidak peka huruf (case-insensitive) tetapi tidak menyokong carian fuzzy atau semantic pada fasa prototaip."),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 10: ACCEPTANCE CRITERIA
// ============================================================
function buildSection10(): (Paragraph | Table)[] {
  return [
    h1("10. KRITERIA PENERIMAAN (ACCEPTANCE CRITERIA)"),
    bullet("Semua modul yang disenaraikan dalam Seksyen 1.3.1 (Dalam Skop) berfungsi sepenuhnya menggunakan pangkalan data Supabase."),
    bullet("Tema warna portal mematuhi sepenuhnya palet warna rasmi PERKESO (Seksyen 3.2) dan aksen jenama IDEONIX digunakan secara sesuai (Seksyen 3.1)."),
    bullet("Portal responsif dan berfungsi tanpa isu visual pada resolusi desktop, tablet, dan mudah alih."),
    bullet("Mod gelap dan mod terang kedua-duanya berfungsi dengan kontras warna yang jelas dan boleh dibaca (FR-14.4 diperbaiki)."),
    bullet("Fungsi carian global mengembalikan keputusan yang tepat merentasi enam (6) modul kandungan dengan penonjolan kata kunci."),
    bullet("ASIP Assistant berfungsi dan memberi jawapan berkaitan PERKESO dalam Bahasa Melayu dengan cadangan navigasi modul."),
    bullet("Struktur kod disahkan sedia untuk pengembangan (extension-ready) bagi integrasi API sebenar pada fasa seterusnya."),
    bullet("Fail SQL (supabase/schema.sql + supabase/seed.sql) disediakan dan boleh dimulakan melalui Supabase SQL Editor."),
    bullet("Dokumentasi README.md komprehensif disediakan dengan arahan pemasangan, rujukan API, dan panduan pembangun."),
    bullet("Kod sumber didedahkan di repositori GitHub (https://github.com/iich4/bulletin-dashboard)."),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 11: API REFERENCE
// ============================================================
function buildSection11(): (Paragraph | Table)[] {
  return [
    h1("11. RUJUKAN API (API REFERENCE) — BARU"),
    p("Berikut adalah senarai lengkap endpoint API REST yang disediakan oleh sistem (semua di bawah /api/*):"),
    spacer(),
    dataTable(
      ["Method", "Endpoint", "Description"],
      [
        ["POST", "/api/auth/login", "Log masuk mock — mengembalikan user + token"],
        ["GET", "/api/dashboard-stats", "Statistik agregat + data carta"],
        ["GET", "/api/announcements", "Senarai pengumuman (filter: category, search)"],
        ["POST", "/api/announcements", "Cipta pengumuman (admin)"],
        ["PATCH", "/api/announcements?id=", "Kemas kini pengumuman (admin)"],
        ["DELETE", "/api/announcements?id=", "Padam pengumuman (admin)"],
        ["GET", "/api/acts", "Senarai akta (filter: category, status, search)"],
        ["POST/PATCH/DELETE", "/api/acts", "CRUD akta (admin)"],
        ["GET", "/api/asip", "Senarai ASIP (filter: status, search)"],
        ["POST/PATCH/DELETE", "/api/asip", "CRUD ASIP (admin)"],
        ["GET", "/api/sop", "Senarai SOP (filter: department, search)"],
        ["POST/PATCH/DELETE", "/api/sop", "CRUD SOP (admin)"],
        ["GET", "/api/circulars", "Senarai pekeliling (filter: category, mandatory, sort, search)"],
        ["POST/PATCH/DELETE", "/api/circulars", "CRUD pekeliling (admin)"],
        ["GET", "/api/faq", "Senarai FAQ (filter: category, search)"],
        ["POST/PATCH/DELETE", "/api/faq", "CRUD FAQ (admin)"],
        ["GET", "/api/notifications?userId=", "Senarai notifikasi + unread count"],
        ["PATCH", "/api/notifications?id=", "Tanda telah dibaca"],
        ["PATCH", "/api/notifications?userId=&action=readAll", "Tanda semua dibaca"],
        ["GET", "/api/search?q=", "Carian global merentasi semua modul"],
        ["GET", "/api/users", "Senarai pengguna (admin)"],
        ["POST", "/api/users", "Cipta pengguna (admin)"],
        ["PATCH/DELETE", "/api/users?id=", "Kemas kini/padam pengguna (admin)"],
        ["POST", "/api/chat", "ASIP Assistant AI chatbot (mengembalikan jawapan AI)"],
      ],
      [18, 42, 40]
    ),
    callout("Semua endpoint list (GET) mengembalikan { items: [...] }. Endpoint carian mengembalikan { groups: {...}, total, query }. Endpoint chat mengembalikan { response, role }.", C.perkesoBlue, C.lightBlue),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 12: DEMO ACCOUNTS
// ============================================================
function buildSection12(): (Paragraph | Table)[] {
  return [
    h1("12. AKAUN DEMO (DEMO ACCOUNTS)"),
    p("Untuk tujuan ujian prototaip, akaun demo berikut disediakan (semua kata laluan adalah mock):"),
    spacer(),
    dataTable(
      ["Peranan", "E-mel", "Kata Laluan", "Jabatan", "Cawangan"],
      [
        ["Admin", "admin@perkeso.gov.my", "admin123", "Bahagian Komunikasi Korporat", "Ibu Pejabat Kuala Lumpur"],
        ["Staff", "staff@perkeso.gov.my", "staff123", "Bahagian Pampasan", "Cawangan Pulau Pinang"],
        ["Staff", "siti.noor@perkeso.gov.my", "staff123", "Bahagian Perubatan", "Cawangan Johor Bahru"],
        ["Staff", "tan.wei@perkeso.gov.my", "staff123", "Bahagian Kewangan", "Cawangan Ipoh"],
        ["Staff", "ravi.kumar@perkeso.gov.my", "staff123", "Bahagian Teknologi Maklumat", "Ibu Pejabat Kuala Lumpur"],
        ["Admin", "nurul.huda@perkeso.gov.my", "admin123", "Bahagian Operasi", "Ibu Pejabat Kuala Lumpur"],
      ],
      [10, 28, 15, 27, 20]
    ),
    pageBreak(),
  ];
}

// ============================================================
// SECTION 13: APPENDICES
// ============================================================
function buildSection13(): (Paragraph | Table)[] {
  return [
    h1("13. LAMPIRAN"),
    h2("Lampiran A — Rujukan Identiti Visual"),
    p("A.1 Rajah Identiti & Rasional Visual IDEONIX (Custom Lettermark 'X', Midnight Blue #002147, Amber Orange #FFBF00) — rujuk fail imej yang dibekalkan oleh klien."),
    p("A.2 Dokumen 'Identiti Visual & Penjenamaan (PERKESO)' — rujuk dokumen Word rasmi yang dibekalkan, mengandungi kod warna utama, sekunder, dan neutral seperti dinyatakan dalam Seksyen 3.2."),
    h2("Lampiran B — Senarai Singkatan"),
    dataTable(
      ["Singkatan", "Maksud"],
      [
        ["PERKESO", "Pertubuhan Keselamatan Sosial"],
        ["ASIP", "Akta Sistem Insurans Pekerjaan"],
        ["SOP", "Standard Operating Procedure (Prosedur Operasi Standard)"],
        ["FAQ", "Frequently Asked Questions (Soalan Lazim)"],
        ["BRS", "Business Requirement Specification (Dokumen Keperluan Perniagaan)"],
        ["CRUD", "Create, Read, Update, Delete"],
        ["SPA", "Single Page Application"],
        ["UI/UX", "User Interface / User Experience"],
        ["GLM", "General Language Model (model AI Z.ai)"],
        ["FAB", "Floating Action Button (butang terapung)"],
        ["ORM", "Object-Relational Mapping"],
        ["SDK", "Software Development Kit"],
        ["REST", "Representational State Transfer"],
        ["PAT", "Personal Access Token (GitHub)"],
        ["SSO", "Single Sign-On"],
        ["AD", "Active Directory"],
        ["WCAG", "Web Content Accessibility Guidelines"],
      ],
      [20, 80]
    ),
    h2("Lampiran C — Fail yang Disediakan"),
    dataTable(
      ["Fail", "Penerangan"],
      [
        ["prisma/schema.prisma", "Skema Prisma untuk 8 entiti (provider: postgresql)"],
        ["prisma/seed.ts", "Skrip seed data untuk Pangkalan Data"],
        ["prisma/generate-seed-sql.ts", "Penjana supabase/seed.sql dari seed data"],
        ["supabase/schema.sql", "DDL (CREATE TABLE) untuk Supabase SQL Editor"],
        ["supabase/seed.sql", "INSERT statements untuk data seed PERKESO"],
        [".env.example", "Templat pembolehubah persekitaran (DATABASE_URL, DIRECT_URL)"],
        ["README.md", "Dokumentasi pemasangan, API reference, dan panduan pembangun"],
        ["worklog.md", "Log pembangunan berperingkat (untuk penyeragaman)"],
        ["src/app/api/chat/route.ts", "Endpoint ASIP Assistant AI chatbot"],
        ["src/components/chat/chat-assistant.tsx", "Komponen UI chatbot (FAB + panel glassmorphism)"],
      ],
      [35, 65]
    ),
    h2("Lampiran D — Skrip npm/bun"),
    dataTable(
      ["Skrip", "Arahan", "Penerangan"],
      [
        ["dev", "bun run dev", "Mulakan pelayan dev di http://localhost:3000"],
        ["build", "bun run build", "Build produksi"],
        ["lint", "bun run lint", "Semakan ESLint"],
        ["db:push", "bun run db:push", "Push skema Prisma ke Supabase"],
        ["db:generate", "bun run db:generate", "Jana semula Prisma Client"],
        ["db:seed", "bun run db:seed", "Populate pangkalan data dengan data seed"],
        ["db:seed-sql", "bun run db:seed-sql", "Jana semula supabase/seed.sql"],
        ["db:migrate", "bun run db:migrate", "Cipta migrasi Prisma"],
        ["db:reset", "bun run db:reset", "Reset pangkalan data"],
      ],
      [15, 30, 55]
    ),
    spacer(),
    spacer(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 120 },
      border: { top: { style: BorderStyle.SINGLE, size: 12, color: C.ideonixAmber } },
      children: [new TextRun({ text: "", size: 4 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: "— TAMAT DOKUMEN —", font: FONT, size: 24, bold: true, color: C.ideonixMidnight })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Disediakan oleh IDEONIX Sdn Bhd untuk PERKESO", font: FONT, size: 20, italics: true, color: C.n600 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Versi 2.0 (Final) • 30 Julai 2026", font: FONT, size: 18, italics: true, color: C.n400 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
      children: [
        new TextRun({ text: "Powered by ", font: FONT, size: 16, color: C.n400 }),
        new TextRun({ text: "IDEONIX", font: FONT, size: 16, bold: true, color: C.ideonixMidnight }),
        new TextRun({ text: " × ", font: FONT, size: 16, color: C.n400 }),
        new TextRun({ text: "Z.ai GLM", font: FONT, size: 16, bold: true, color: C.perkesoBlue }),
      ],
    }),
  ];
}

// ============================================================
// BUILD DOCUMENT
// ============================================================
const doc = new Document({
  creator: "IDEONIX Sdn Bhd",
  title: "PERKESO Bulletin Dashboard — BRS v2.0 (Final)",
  description: "Business Requirement Specification — Final version with all post-development changes",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 22, color: C.n900 },
        paragraph: { spacing: { line: 312 } },
      },
    },
  },
  numbering: {
    config: [
      { reference: "obj", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "wf", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    {
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: buildCover(),
    },
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
          pageNumbers: { start: 1 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 0 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.perkesoBlue } },
              children: [
                new TextRun({ text: "PERKESO Bulletin Dashboard", font: FONT, size: 16, color: C.n600 }),
                new TextRun({ text: "  •  ", font: FONT, size: 16, color: C.n400 }),
                new TextRun({ text: "BRS v2.0 (Final)", font: FONT, size: 16, bold: true, color: C.perkesoBlue }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.n200 } },
              spacing: { before: 80 },
              children: [
                new TextRun({ text: "© 2026 PERKESO × IDEONIX  |  Halaman ", font: FONT, size: 16, color: C.n600 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, bold: true, color: C.perkesoBlue }),
                new TextRun({ text: " / ", font: FONT, size: 16, color: C.n600 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: C.n600 }),
                new TextRun({ text: "  |  Disediakan oleh IDEONIX Sdn Bhd", font: FONT, size: 16, color: C.n400 }),
              ],
            }),
          ],
        }),
      },
      children: [
        ...buildRevisionHistory(),
        ...buildTOC(),
        ...buildSection1(),
        ...buildSection2(),
        ...buildSection3(),
        ...buildSection4(),
        ...buildSection5(),
        ...buildSection6(),
        ...buildSection7(),
        ...buildSection8(),
        ...buildSection9(),
        ...buildSection10(),
        ...buildSection11(),
        ...buildSection12(),
        ...buildSection13(),
      ],
    },
  ],
});

mkdirSync("download", { recursive: true });
Packer.toBuffer(doc).then((buffer) => {
  const outPath = "download/BRS_PERKESO_Bulletin_Dashboard_FINAL_v2.0.docx";
  writeFileSync(outPath, buffer);
  console.log(`✓ Generated: ${outPath}`);
  console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
