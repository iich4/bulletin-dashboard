/* eslint-disable */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding PERKESO Bulletin Dashboard database...");

  // ---- Users ----
  const users = [
    {
      email: "admin@perkeso.gov.my",
      name: "Aisyah Binti Rahman",
      password: "admin123",
      role: "Admin",
      department: "Bahagian Komunikasi Korporat",
      branch: "Ibu Pejabat Kuala Lumpur",
      position: "Pegawai Komunikasi Korporat",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      isActive: true,
    },
    {
      email: "staff@perkeso.gov.my",
      name: "Mohammad Faizal Bin Osman",
      password: "staff123",
      role: "Staff",
      department: "Bahagian Pampasan",
      branch: "Cawangan Pulau Pinang",
      position: "Pegawai Pampasan",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      isActive: true,
    },
    {
      email: "siti.noor@perkeso.gov.my",
      name: "Siti Noor Aishah",
      password: "staff123",
      role: "Staff",
      department: "Bahagian Perubatan",
      branch: "Cawangan Johor Bahru",
      position: "Pegawai Perubatan",
      avatarUrl: "https://i.pravatar.cc/150?img=45",
      isActive: true,
    },
    {
      email: "tan.wei@perkeso.gov.my",
      name: "Tan Wei Ming",
      password: "staff123",
      role: "Staff",
      department: "Bahagian Kewangan",
      branch: "Cawangan Ipoh",
      position: "Pegawai Kewangan",
      avatarUrl: "https://i.pravatar.cc/150?img=15",
      isActive: true,
    },
    {
      email: "ravi.kumar@perkeso.gov.my",
      name: "Ravi Kumar a/l Subramaniam",
      password: "staff123",
      role: "Staff",
      department: "Bahagian Teknologi Maklumat",
      branch: "Ibu Pejabat Kuala Lumpur",
      position: "Jurutera Sistem",
      avatarUrl: "https://i.pravatar.cc/150?img=33",
      isActive: true,
    },
    {
      email: "nurul.huda@perkeso.gov.my",
      name: "Nurul Huda Binti Aziz",
      password: "admin123",
      role: "Admin",
      department: "Bahagian Operasi",
      branch: "Ibu Pejabat Kuala Lumpur",
      position: "Pengurus Operasi",
      avatarUrl: "https://i.pravatar.cc/150?img=49",
      isActive: true,
    },
  ];
  for (const u of users) {
    await db.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }

  // ---- Announcements ----
  const announcements = [
    {
      title: "Pengumuman Hari Kebangsaan PERKESO 2026",
      category: "Korporat",
      summary: "Sambutan Hari Kebangsaan akan diadakan di semua cawangan PERKESO seluruh negara pada 31 Ogos 2026.",
      content: "Bersempena sambutan Hari Kebangsaan ke-59, PERKESO akan mengadakan pelbagai aktiviti korporat di semua cawangan. Semua kakitangan dijemput menyertai perhimpunan dan acara budaya. Sila hadir berpakaian tradisional atau pakaian bertema 'Merdeka'. Majlis akan bermula jam 8:00 pagi.",
      authorName: "Aisyah Binti Rahman",
      isPinned: true,
      isNew: true,
      isUrgent: false,
      attachments: JSON.stringify([
        { name: "Program_Merdeka_2026.pdf", type: "PDF", size: "1.2 MB" },
        { name: "Senarai_Activiti.docx", type: "DOCX", size: "680 KB" },
      ]),
      coverColor: "#ED1C24",
      datePublished: new Date("2026-07-25T09:00:00Z"),
    },
    {
      title: "Kemas Kini Sistem Caruman Bulanan PERKESO",
      category: "ICT",
      summary: "Sistem caruman bulanan telah dinaik taraf dengan ciri e-pengesahan dan laporan pantas.",
      content: "Sistem Pengurusan Caruman Bulanan (SPCB) versi 3.2 telah dilancarkan secara rasmi. Ciri baharu termasuk e-pengesahan dokumen, janaan laporan masa nyata, dan integrasi pejabat pos cawangan. Latihan pengguna akan diadakan setiap Khamis jam 2:00 petang secara dalam talian.",
      authorName: "Nurul Huda Binti Aziz",
      isPinned: false,
      isNew: true,
      isUrgent: false,
      attachments: JSON.stringify([{ name: "Manual_SPCB_v3.2.pdf", type: "PDF", size: "3.4 MB" }]),
      coverColor: "#007DC5",
      datePublished: new Date("2026-07-22T14:30:00Z"),
    },
    {
      title: "Cutian Umum Hari Buruh — Klinik Tutup",
      category: "HR",
      summary: "Klinik PERKESO akan ditutup pada 1 Mei 2026 bersempena Hari Buruh.",
      content: "Dimaklumkan bahawa semua klinik PERKESO di seluruh negara akan tutup pada 1 Mei 2026 (Hari Buruh). Rawatan kecemasan boleh dirujuk ke panel klinik berdekatan. Operasi akan kembali normal pada 2 Mei 2026.",
      authorName: "Aisyah Binti Rahman",
      isPinned: false,
      isNew: true,
      isUrgent: false,
      attachments: JSON.stringify([]),
      coverColor: "#8DC63E",
      datePublished: new Date("2026-07-20T08:00:00Z"),
    },
    {
      title: "AMARAN: Phishing E-mel Berpura-pura PERKESO",
      category: "Kesihatan & Keselamatan",
      summary: "Dimaklumkan terdapat e-mel phishing yang berpura-pura dari PERKESO. Jangan klik pautan.",
      content: "Pihak ICT telah menerima laporan bahawa terdapat e-mel phishing yang berpura-pura daripada PERKESO meminta maklumat log masuk. JANGAN klik sebarang pautan atau berikan maklumat peribadi. Laporkan segera ke soc@perkeso.gov.my. PERKESO tidak akan meminta kata laluan melalui e-mel.",
      authorName: "Ravi Kumar a/l Subramaniam",
      isPinned: true,
      isNew: true,
      isUrgent: true,
      attachments: JSON.stringify([{ name: "Panduan_Keselamatan.pdf", type: "PDF", size: "920 KB" }]),
      coverColor: "#ED1C24",
      datePublished: new Date("2026-07-19T10:15:00Z"),
    },
    {
      title: "Pertandingan Inovasi Kakitangan 2026",
      category: "Korporat",
      summary: "Pendaftaran pertandingan inovasi kakitangan telah dibuka. Hadiah RM10,000.",
      content: "PERKESO mengumumkan pertandingan inovasi kakitangan 2026 dengan tema 'Inovasi Untuk Rakyat'. Pendaftaran dibuka sehingga 15 Ogos 2026. Hadiah utama RM10,000 dan trofi. Penilaian berdasarkan kebolehgunaan, keberkesanan, dan impak operasi.",
      authorName: "Nurul Huda Binti Aziz",
      isPinned: false,
      isNew: false,
      isUrgent: false,
      attachments: JSON.stringify([{ name: "Borang_Penyertaan.docx", type: "DOCX", size: "420 KB" }]),
      coverColor: "#F9BF10",
      datePublished: new Date("2026-07-10T09:00:00Z"),
    },
    {
      title: "Kemas Kini Prosedur Tuntutan Pampasan Pekerja",
      category: "Operasi",
      summary: "Prosedur tuntutan pampasan pekerja dikemas kini bagi mempercepat proses pengesahan.",
      content: "Bermula 1 Ogos 2026, prosedur tuntutan pampasan pekerja akan dikemas kini dengan pengurangan masa pengesahan daripada 14 hari kepada 7 hari kerja. Borang baharu boleh dimuat turun dari modul SOP.",
      authorName: "Mohammad Faizal Bin Osman",
      isPinned: false,
      isNew: false,
      isUrgent: false,
      attachments: JSON.stringify([{ name: "Borang_Pampasan_v2.pdf", type: "PDF", size: "1.8 MB" }]),
      coverColor: "#00C5AB",
      datePublished: new Date("2026-07-05T11:00:00Z"),
    },
    {
      title: "Latihan Kesedaran Siber Keselamatan Wajib",
      category: "Kesihatan & Keselamatan",
      summary: "Semua kakitangan diwajibkan hadir latihan kesedaran siber keselamatan.",
      content: "Pihak pengurusan menetapkan bahawa semua kakitangan PERKESO wajib menghadiri latihan kesedaran siber keselamatan yang akan diadakan secara dalam talian. Slot boleh dipilih melalui portal latihan dalaman.",
      authorName: "Ravi Kumar a/l Subramaniam",
      isPinned: false,
      isNew: false,
      isUrgent: false,
      attachments: JSON.stringify([]),
      coverColor: "#F27130",
      datePublished: new Date("2026-06-28T08:00:00Z"),
    },
    {
      title: "Program Pensijiran ISO 27001 — Fasa 2",
      category: "Korporat",
      summary: "PERKESO meneruskan program pensijiran ISO 27001 dengan audit fasa 2 pada September 2026.",
      content: "Bahagian Kualiti & Keselamatan Maklumat akan menjalankan audit ISO 27001 fasa 2 pada September 2026. Semua jabatan diminta menyemak dan mengemaskini SOP berkaitan keselamatan maklumat sebelum 15 Ogos 2026.",
      authorName: "Aisyah Binti Rahman",
      isPinned: false,
      isNew: false,
      isUrgent: false,
      attachments: JSON.stringify([{ name: "Senarai_Semak_ISO27001.xlsx", type: "XLSX", size: "240 KB" }]),
      coverColor: "#004E7A",
      datePublished: new Date("2026-06-20T09:30:00Z"),
    },
  ];
  for (const a of announcements) {
    await db.announcement.create({ data: a });
  }

  // ---- Acts ----
  const acts = [
    {
      actNumber: "Akta 428",
      title: "Akta Keselamatan Sosial Pekerja 1969",
      category: "Akta Sosial",
      description: "Akta utama yang menetapkan skim perlindungan sosial bagi pekerja Malaysia termasuk pampasan kemalangan, pension, dan invaliditi.",
      fileName: "Akta_428_1969.pdf",
      fileSize: "4.8 MB",
      version: "Edisi 2026",
      status: "Aktif",
      lastUpdated: new Date("2026-06-15T10:00:00Z"),
    },
    {
      actNumber: "Akta 799",
      title: "Akta Sistem Insurans Pekerjaan 2017",
      category: "Akta Insurans",
      description: "Mewujudkan skim insurans pekerjaan bagi menganugerahkan faedah kepada pekerja yang mengalami kemalangan kerja atau penyakit pekerjaan.",
      fileName: "Akta_799_2017.pdf",
      fileSize: "3.2 MB",
      version: "Edisi 2025",
      status: "Aktif",
      lastUpdated: new Date("2026-05-20T12:00:00Z"),
    },
    {
      actNumber: "Akta 800",
      title: "Akta Sistem Insurans Pekerjaan (Peraturan) 2017",
      category: "Akta Insurans",
      description: "Peraturan pelaksanaan Akta Sistem Insurans Pekerjaan 2017 mengenai tatacara pengurusan tuntutan dan pembayaran faedah.",
      fileName: "Akta_800_2017.pdf",
      fileSize: "1.6 MB",
      version: "Edisi 2025",
      status: "Aktif",
      lastUpdated: new Date("2026-04-12T09:00:00Z"),
    },
    {
      actNumber: "Akta 514",
      title: "Akta Keselamatan dan Kesihatan Pekerjaan 1994",
      category: "Akta Sosial",
      description: "Mewujudkan rangka kerja perundangan bagi memastikan keselamatan, kesihatan, dan kebajikan pekerja di tempat kerja.",
      fileName: "Akta_514_1994.pdf",
      fileSize: "2.4 MB",
      version: "Edisi 2024",
      status: "Digantungan",
      lastUpdated: new Date("2025-11-10T10:00:00Z"),
    },
    {
      actNumber: "Akta 265",
      title: "Akta Kilang dan Jentera 1967",
      category: "Peraturan",
      description: "Mengawal selia keselamatan kilang, jentera, dan pekerja industri.",
      fileName: "Akta_265_1967.pdf",
      fileSize: "1.9 MB",
      version: "Edisi 2023",
      status: "Digantikan",
      lastUpdated: new Date("2025-08-15T11:30:00Z"),
    },
    {
      actNumber: "Akta 139",
      title: "Akta Kerja 1955",
      category: "Peraturan",
      description: "Akta yang mengawal selia hubungan majikan-pekerja, termasuk waktu kerja, cuti, dan upah.",
      fileName: "Akta_139_1955.pdf",
      fileSize: "3.8 MB",
      version: "Edisi 2026 (Pindaan)",
      status: "Aktif",
      lastUpdated: new Date("2026-01-25T08:00:00Z"),
    },
    {
      actNumber: "Akta 827",
      title: "Akta Perlindungan Data Peribadi 2010",
      category: "Peraturan",
      description: "Mengawal pemprosesan data peribadi individu dan hak individu terhadap data peribadinya.",
      fileName: "Akta_827_2010.pdf",
      fileSize: "1.4 MB",
      version: "Edisi 2024",
      status: "Aktif",
      lastUpdated: new Date("2025-12-10T09:00:00Z"),
    },
    {
      actNumber: "Akta 759",
      title: "Akta Imigresen 1959/1963",
      category: "Peraturan",
      description: "Mengawal kemasukan dan pergerakan warga asing di Malaysia.",
      fileName: "Akta_759_1959.pdf",
      fileSize: "2.1 MB",
      version: "Edisi 2024",
      status: "Dalam Semakan",
      lastUpdated: new Date("2026-02-18T14:00:00Z"),
    },
  ];
  for (const a of acts) {
    await db.act.create({ data: a });
  }

  // ---- ASIP ----
  const asips = [
    {
      title: "Skim Insurans Pekerjaan — Pampasan Kemalangan",
      referenceNo: "ASIP/PK/001/2026",
      description: "Skim pampasan kemalangan kerja bagi pekerja yang mengalami kecederaan dalam masa dan di tempat kerja.",
      effectiveDate: new Date("2026-01-01T00:00:00Z"),
      fileName: "ASIP_Pampasan_Kemalangan.pdf",
      fileSize: "1.6 MB",
      status: "Aktif",
      category: "Pampasan",
    },
    {
      title: "Skim Insurans Pekerjaan — Pencen Ilat",
      referenceNo: "ASIP/PI/002/2026",
      description: "Skim pencen ilat bagi pekerja yang mengalami kecacatan kekal akibat kemalangan kerja.",
      effectiveDate: new Date("2026-01-01T00:00:00Z"),
      fileName: "ASIP_Pencen_Ilat.pdf",
      fileSize: "1.4 MB",
      status: "Aktif",
      category: "Pencen",
    },
    {
      title: "Skim Insurans Pekerjaan — Pencematian",
      referenceNo: "ASIP/PM/003/2025",
      description: "Manfaat kematian kepada tanggungan pekerja yang meninggal dunia akibat kemalangan kerja.",
      effectiveDate: new Date("2025-06-01T00:00:00Z"),
      fileName: "ASIP_Pencematian.pdf",
      fileSize: "1.1 MB",
      status: "Aktif",
      category: "Manfaat Kematian",
    },
    {
      title: "Skim Insurans Pekerjaan — Bayaran Perubatan",
      referenceNo: "ASIP/BP/004/2026",
      description: "Pembayaran perubatan bagi rawatan berkaitan kemalangan kerja atau penyakit pekerjaan.",
      effectiveDate: new Date("2026-01-15T00:00:00Z"),
      fileName: "ASIP_Bayaran_Perubatan.pdf",
      fileSize: "2.2 MB",
      status: "Aktif",
      category: "Perubatan",
    },
    {
      title: "Skim Insurans Pekerjaan — Pemulihan Fizio",
      referenceNo: "ASIP/PF/005/2025",
      description: "Program pemulihan fizio dan vokasional bagi pekerja yang mengalami kecederaan kerja.",
      effectiveDate: new Date("2025-03-01T00:00:00Z"),
      fileName: "ASIP_Pemulihan.pdf",
      fileSize: "1.8 MB",
      status: "Digantikan",
      category: "Pemulihan",
    },
    {
      title: "Skim Insurans Pekerjaan — Faedah Hari Tidak Bekerja",
      referenceNo: "ASIP/HTB/006/2026",
      description: "Bayaran ganti bagi hari tidak bekerja akibat cuti sakit berkaitan kemalangan kerja.",
      effectiveDate: new Date("2026-02-01T00:00:00Z"),
      fileName: "ASIP_HTB.pdf",
      fileSize: "950 KB",
      status: "Dalam Semakan",
      category: "Bayaran Ganti",
    },
  ];
  for (const a of asips) {
    await db.asip.create({ data: a });
  }

  // ---- SOPs ----
  const sops = [
    {
      title: "SOP Tuntutan Pampasan Pekerja",
      department: "Pampasan",
      description: "Prosedur standard pengendalian tuntutan pampasan pekerja berkaitan kemalangan kerja.",
      procedureSteps: JSON.stringify([
        "Pekerja melaporkan kemalangan kepada majikan dalam masa 48 jam.",
        "Majikan mengemukakan borang laporan kemalangan (Borang 21) ke cawangan PERKESO.",
        "Pegawai pampasan menyemak dokumen dan mengeluarkan nombor rujukan tuntutan.",
        "Pemeriksaan perubatan dijalankan oleh panel klinik PERKESO.",
        "Pengesahan tahap kecederaan oleh Lembaga Perubatan.",
        "Keputusan tuntutan dikeluarkan dalam masa 7 hari kerja selepas lengkap dokumen.",
        "Bayaran pampasan diproses dan dikredit ke akaun pekerja dalam 14 hari.",
      ]),
      fileName: "SOP_Pampasan_v2.pdf",
      fileSize: "1.2 MB",
      version: "2.0",
      approvedBy: "Timbalan Pengarah Bahagian Pampasan",
      dateApproved: new Date("2026-06-20T10:00:00Z"),
      status: "Aktif",
    },
    {
      title: "SOP Pengurusan Rekod Perubatan",
      department: "Perubatan",
      description: "Pengurusan, penyimpanan, dan pemusnahan rekod perubatan pesakit PERKESO.",
      procedureSteps: JSON.stringify([
        "Semua rekod perubatan direkod dalam Sistem Pengurusan Rekod Perubatan (SPRP).",
        "Rekod fizikal disimpan di ruang arkib berkontrol akses.",
        "Akses kepada rekod terhad kepada pegawai perubatan dan pesakit sahaja.",
        "Rekod disimpan sekurang-kurangnya 7 tahun sebelum dimusnah.",
        "Pemusnahan rekod direkod dalam log pemusnahan dan ditandatangani oleh Pegawai Perubatan Kanan.",
      ]),
      fileName: "SOP_Rekod_Perubatan.pdf",
      fileSize: "880 KB",
      version: "1.5",
      approvedBy: "Pengarah Bahagian Perubatan",
      dateApproved: new Date("2026-05-10T09:00:00Z"),
      status: "Aktif",
    },
    {
      title: "SOP Pengesahan Invois Pembekal",
      department: "Kewangan",
      description: "Proses pengesahan dan bayaran invois pembekal PERKESO.",
      procedureSteps: JSON.stringify([
        "Pembekal menghantar invois melalui portal e-Procurement.",
        "Pegawai kewangan menyemak kesahihan dan ketepatan maklumat.",
        "Pegawai kewangan menyemak LPO / kontrak berkaitan.",
        "Pengesahan oleh Ketua Bahagian Kewangan.",
        "Bayaran diproses melalui sistem Gaji & Bayaran (SGB).",
        "Invois ditandai sebagai 'Dibayar' dalam sistem.",
      ]),
      fileName: "SOP_Invois_Pembekal.pdf",
      fileSize: "640 KB",
      version: "1.8",
      approvedBy: "Pengarah Bahagian Kewangan",
      dateApproved: new Date("2026-04-15T14:00:00Z"),
      status: "Aktif",
    },
    {
      title: "SOP Pengurusan Aset ICT",
      department: "ICT",
      description: "Pengurusan kitar hayat aset teknologi maklumat PERKESO.",
      procedureSteps: JSON.stringify([
        "Pendaftaran aset ICT dalam Sistem Pengurusan Aset (SPA) dengan kod unik.",
        "Pelabelan aset dengan nombor siri dan kod inventori.",
        "Pengedaran aset direkod dengan penerima dan lokasi.",
        "Penyenggaraan berkala mengikut jadual tahunan.",
        "Pelupusan aset melalui lelongan / sumbangan dengan kebenaran Lembaga.",
      ]),
      fileName: "SOP_Aset_ICT.pdf",
      fileSize: "1.1 MB",
      version: "1.2",
      approvedBy: "Pengarah Bahagian ICT",
      dateApproved: new Date("2026-03-08T11:00:00Z"),
      status: "Aktif",
    },
    {
      title: "SOP Pengambilan Kakitangan Baharu",
      department: "HR",
      description: "Proses pengambilan dan orientasi kakitangan baru PERKESO.",
      procedureSteps: JSON.stringify([
        "Pengiklanan jawatan kosong di portal kerjaya PERKESO.",
        "Penapisan permohonan oleh sistem dan pegawai HR.",
        "Temu duga oleh panel (HR + ketua jabatan).",
        "Pengesahan latar belakang dan pemeriksaan perubatan.",
        "Tawaran jawatan dan penerimaan oleh calon.",
        "Orientasi 3 hari di Ibu Pejabat dan penyerahan kad pengguna.",
      ]),
      fileName: "SOP_Pengambilan_HR.pdf",
      fileSize: "780 KB",
      version: "2.1",
      approvedBy: "Pengarah Bahagian HR",
      dateApproved: new Date("2026-02-25T09:30:00Z"),
      status: "Aktif",
    },
    {
      title: "SOP Pengurusan Operasi Cawangan",
      department: "Operasi",
      description: "Prosedur pengurusan operasi harian cawangan PERKESO.",
      procedureSteps: JSON.stringify([
        "Buka cawangan jam 8:00 pagi dan semak sistem POS & LAN.",
        "Pengasingan kaunter mengikut perkhidmatan (Caruman / Pampasan / Perubatan).",
        "Pengurusan barisan dan masa menunggu via sistem QMS.",
        "Pengesahan dokumen pekerja di kaunter.",
        "Penghantaran laporan harian ke Ibu Pejabat sebelum 5:00 petang.",
        "Penutupan cawangan dan backup data pada 5:30 petang.",
      ]),
      fileName: "SOP_Operasi_Cawangan.pdf",
      fileSize: "940 KB",
      version: "1.4",
      approvedBy: "Pengarah Bahagian Operasi",
      dateApproved: new Date("2026-01-30T08:30:00Z"),
      status: "Aktif",
    },
  ];
  for (const s of sops) {
    await db.sop.create({ data: s });
  }

  // ---- Circulars ----
  const circulars = [
    {
      circularNo: "PKSO/CIR/2026/014",
      title: "Pekeliling Kemas Kini Kadar Caruman Bulanan 2026",
      category: "Korporat",
      summary: "Kadar caruman bulanan dikemas kini berkuat kuasa 1 Julai 2026.",
      content: "Berkuat kuasa 1 Julai 2026, kadar caruman bulanan PERKESO dikemas kini mengikut jadual baru (Lampiran A). Semua majikan dikehendaki menggunakan kadar baru bagi semua caruman bulanan Julai 2026 dan seterusnya.",
      fileName: "Pekeliling_014_2026.pdf",
      fileSize: "1.5 MB",
      isMandatory: true,
      dateIssued: new Date("2026-06-25T09:00:00Z"),
    },
    {
      circularNo: "PKSO/CIR/2026/013",
      title: "Pekeliling Penambahbaikan Khidmat Kaunter",
      category: "Operasi",
      summary: "Penambahbaikan SOP khidmat kaunter cawangan dengan masa tindak balas ≤ 15 minit.",
      content: "Pekeliling ini menetapkan penambahbaikan khidmat kaunter PERKESO dengan masa tindak balas maksimum 15 minit dan sistem penilaian pelanggan selepas setiap urusan.",
      fileName: "Pekeliling_013_2026.pdf",
      fileSize: "1.1 MB",
      isMandatory: false,
      dateIssued: new Date("2026-06-18T10:00:00Z"),
    },
    {
      circularNo: "PKSO/CIR/2026/012",
      title: "Pekeliling Tatacara Penyimpanan Dokumen Digital",
      category: "ICT",
      summary: "Tatacara penyimpanan dokumen digital mengikut polisi retention 7 tahun.",
      content: "Pekeliling ini menetapkan tatacara penyimpanan dan pelupusan dokumen digital PERKESO mengikut polisi retention 7 tahun selaras dengan Akta Arkib Negara 2003.",
      fileName: "Pekeliling_012_2026.pdf",
      fileSize: "1.3 MB",
      isMandatory: true,
      dateIssued: new Date("2026-06-10T09:00:00Z"),
    },
    {
      circularNo: "PKSO/CIR/2026/011",
      title: "Pekeliling Penyelarasan Tuntutan Elaun Perjalanan",
      category: "Kewangan",
      summary: "Tuntutan elaun perjalanan mestilah dikemukakan dalam tempoh 30 hari.",
      content: "Mulai 1 Jun 2026, semua tuntutan elaun perjalanan mestilah dikemukakan dalam tempoh 30 hari dari tarikh perjalanan. Tuntutan lewat tidak akan diproses tanpa kelulusan Ketua Bahagian.",
      fileName: "Pekeliling_011_2026.pdf",
      fileSize: "980 KB",
      isMandatory: true,
      dateIssued: new Date("2026-05-20T09:00:00Z"),
    },
    {
      circularNo: "PKSO/CIR/2026/010",
      title: "Pekeliling Hari Bertema Korporat Bulanan",
      category: "HR",
      summary: "Hari bertema korporat akan diadakan setiap hari Jumaat pertama setiap bulan.",
      content: "Mulai Julai 2026, hari bertema korporat akan diadakan setiap hari Jumaat pertama setiap bulan. Tema akan diumumkan sebelum tarikh.",
      fileName: "Pekeliling_010_2026.pdf",
      fileSize: "640 KB",
      isMandatory: false,
      dateIssued: new Date("2026-05-08T09:00:00Z"),
    },
    {
      circularNo: "PKSO/CIR/2026/009",
      title: "Pekeliling Polisi Kerja Dalam Talian / WFH",
      category: "HR",
      summary: "Polisi kerja dalam talian / WFH dikemas kini dengan pengukuhan protokol keselamatan.",
      content: "Polisi kerja dalam talian / WFH dikemas kini meliputi protokol keselamatan siber, log masuk VPN, dan kekerapan pelaporan.",
      fileName: "Pekeliling_009_2026.pdf",
      fileSize: "1.2 MB",
      isMandatory: true,
      dateIssued: new Date("2026-04-15T09:00:00Z"),
    },
    {
      circularNo: "PKSO/CIR/2026/008",
      title: "Pekeliling Audit Dalaman Suku Tahunan",
      category: "Operasi",
      summary: "Audit dalaman suku tahunan akan dijalankan di semua cawangan.",
      content: "Pekeliling ini mengumumkan jadual audit dalaman suku tahunan di semua cawangan PERKESO bermula Q3 2026.",
      fileName: "Pekeliling_008_2026.pdf",
      fileSize: "890 KB",
      isMandatory: false,
      dateIssued: new Date("2026-03-22T09:00:00Z"),
    },
  ];
  for (const c of circulars) {
    await db.circular.create({ data: c });
  }

  // ---- FAQs ----
  const faqs = [
    {
      question: "Berapakah kadar caruman PERKESO untuk pekerja?",
      answer: "Kadar caruman PERKESO ialah 1.75% daripada gaji bulanan pekerja, ditambah dengan 1.75% daripada majikan, menjadikan jumlah 3.5%. Kadar ini berkuat kuasa berkuat kuasa bagi semua pekerja swasta di Malaysia.",
      category: "Caruman",
      tags: JSON.stringify(["kadar", "caruman", "1.75%"]),
    },
    {
      question: "Bagaimana cara saya membuat tuntutan pampasan kemalangan kerja?",
      answer: "Anda boleh membuat tuntutan pampasan kemalangan kerja melalui langkah berikut: (1) Laporkan kemalangan kepada majikan dalam 48 jam, (2) Majikan mengemukakan Borang 21 ke cawangan PERKESO, (3) Pemeriksaan perubatan di klinik panel, (4) Tunggu pengesahan Lembaga Perubatan. Proses lengkap biasanya 7-14 hari kerja.",
      category: "Pampasan",
      tags: JSON.stringify(["kemalangan", "tuntutan", "borang 21"]),
    },
    {
      question: "Bagaimana untuk mendaftar pekerja baharu dalam sistem PERKESO?",
      answer: "Pendaftaran pekerja baharu boleh dilakukan melalui portal e-Perkeso (https://e-portal.perkeso.gov.my). Majikan perlu log masuk, pilih 'Pendaftaran Pekerja', dan lengkapkan borang dengan maklumat pekerja. Proses pengesahan biasanya 3-5 hari kerja.",
      category: "Permohonan",
      tags: JSON.stringify(["pendaftaran", "pekerja baharu", "e-Perkeso"]),
    },
    {
      question: "Apakah yang harus saya lakukan jika terlupa kata laluan portal?",
      answer: "Jika anda terlupa kata laluan, klik pautan 'Terlupa Kata Laluan' pada halaman log masuk. Sistem akan menghantar pautan set semula kata laluan ke e-mel berdaftar anda. Pautan sah selama 24 jam.",
      category: "Sistem",
      tags: JSON.stringify(["kata laluan", "log masuk", "set semula"]),
    },
    {
      question: "Di mana saya boleh dapatkan borang tuntutan dan dokumen rasmi PERKESO?",
      answer: "Semua borang rasmi PERKESO boleh dimuat turun dari modul SOP, modul Pekeliling, atau modul Akta dalam portal ini. Anda juga boleh menggunakan fungsi Carian Global untuk mencari dokumen tertentu.",
      category: "Sistem",
      tags: JSON.stringify(["borang", "dokumen", "muat turun"]),
    },
    {
      question: "Bagaimana saya tahu status tuntutan saya?",
      answer: "Anda boleh menyemak status tuntutan melalui portal e-Perkeso dengan log masuk dan klik 'Status Tuntutan'. Sistem akan memaparkan peringkat pemprosesan terkini, jangkaan masa, dan pegawai yang mengendali.",
      category: "Pampasan",
      tags: JSON.stringify(["status", "tuntutan", "e-Perkeso"]),
    },
    {
      question: "Apakah jenis penyakit yang dilindungi oleh Skim Insurans Pekerjaan?",
      answer: "Skim Insurans Pekerjaan (SIP) melindungi penyakit pekerjaan seperti penyakit kulit akibat bahan kimia, pendengaran terjejas akibat bunyi bising, dan penyakit paru-paru akibat habuk. Senarai penuh 39 penyakit pekerjaan boleh didapati dalam Jadual Akta 799.",
      category: "Pampasan",
      tags: JSON.stringify(["penyakit", "SIP", "pekerjaan"]),
    },
    {
      question: "Bagaimana cara mengemas kini maklumat peribadi dalam rekod PERKESO?",
      answer: "Pekerja boleh mengemas kini maklumat peribadi melalui portal e-Perkeso. Pilih 'Profil Saya', klik 'Kemas Kini', dan hantar permohonan. Kemas kini akan diambil tindakan dalam 3-5 hari kerja oleh cawangan berdekatan.",
      category: "Sistem",
      tags: JSON.stringify(["profil", "kemas kini", "maklumat"]),
    },
    {
      question: "Apakah skim pemulihan vokasional yang disediakan?",
      answer: "PERKESO menyediakan skim pemulihan vokasional bagi pekerja yang mengalami kecacatan akibat kemalangan kerja. Skim ini termasuk latihan semula, bantuan kerja, dan modifikasi tempat kerja. Permohonan melalui pegawai pampasan cawangan berdekatan.",
      category: "Pampasan",
      tags: JSON.stringify(["pemulihan", "vokasional", "kecacatan"]),
    },
    {
      question: "Bagaimana cara mengemukakan aduan mengenai khidmat PERKESO?",
      answer: "Aduan boleh dikemukakan melalui: (1) Borang Aduan di kaunter, (2) E-mel ke aduan@perkeso.gov.my, (3) Sistem Aduan Dalam Talian dalam portal e-Perkeso, atau (4) Hotline 1-300-22-8000. Setiap aduan akan menerima nombor rujukan untuk pengesanan.",
      category: "Sistem",
      tags: JSON.stringify(["aduan", "khidmat", "hotline"]),
    },
    {
      question: "Berapakah had maksimum pampasan kemalangan kerja?",
      answer: "Had maksimum pampasan bergantung pada jenis dan tahap kecederaan. Untuk kecacatan kekal, pampasan boleh mencecah sehingga RM70,000 (pencen ilat) atau bayaran jumlah pukul. Bagi kematian, tanggungan akan menerima pencemaran dan faedah penjagaan anak.",
      category: "Pampasan",
      tags: JSON.stringify(["had", "maksimum", "pampasan"]),
    },
    {
      question: "Apakah syarat kelayakan untuk menerima faedah PERKESO?",
      answer: "Pekerja layak menerima faedah PERKESO jika: (1) Bekerja di bawah kontrak perkhidmatan, (2) Berumur 16-80 tahun, (3) Membayar caruman bulanan secara berkala. Pekerja kontrak, sambilan, dan sementara juga dilindungi.",
      category: "Caruman",
      tags: JSON.stringify(["kelayakan", "syarat", "faedah"]),
    },
  ];
  for (const f of faqs) {
    await db.faq.create({ data: f });
  }

  // ---- Notifications for the staff user (Mohammad Faizal) ----
  const faizal = await db.user.findUnique({ where: { email: "staff@perkeso.gov.my" } });
  if (faizal) {
    const notifs = [
      { userId: faizal.id, title: "Pengumuman Baharu", message: "Pengumuman Hari Kebangsaan PERKESO 2026 telah diumumkan.", type: "info", module: "Announcement", isRead: false, createdAt: new Date("2026-07-25T09:00:00Z") },
      { userId: faizal.id, title: "Pekeliling Wajib", message: "Pekeliling Kemas Kini Kadar Caruman Bulanan 2026 — wajib dibaca.", type: "critical", module: "Circular", isRead: false, createdAt: new Date("2026-07-24T08:00:00Z") },
      { userId: faizal.id, title: "SOP Dikemas Kini", message: "SOP Tuntutan Pampasan Pekerja dikemas kini ke versi 2.0.", type: "info", module: "SOP", isRead: false, createdAt: new Date("2026-07-22T10:00:00Z") },
      { userId: faizal.id, title: "Amaran Keselamatan", message: "E-mel phishing berpura-pura PERKESO — sila ambil perhatian.", type: "warning", module: "Announcement", isRead: true, createdAt: new Date("2026-07-19T10:30:00Z") },
      { userId: faizal.id, title: "Aktiviti Korporat", message: "Pertandingan Inovasi Kakitangan 2026 dibuka untuk pendaftaran.", type: "success", module: "Announcement", isRead: true, createdAt: new Date("2026-07-10T09:30:00Z") },
    ];
    for (const n of notifs) {
      await db.notification.create({ data: n });
    }
  }

  const admin = await db.user.findUnique({ where: { email: "admin@perkeso.gov.my" } });
  if (admin) {
    const adminNotifs = [
      { userId: admin.id, title: "Pengumuman Berjaya Diterbitkan", message: "Pengumuman 'Hari Kebangsaan PERKESO 2026' telah disemat ke dashboard.", type: "success", module: "Announcement", isRead: false, createdAt: new Date("2026-07-25T09:05:00Z") },
      { userId: admin.id, title: "Pengguna Baharu Didaftarkan", message: "Siti Noor Aishah telah didaftarkan ke sistem.", type: "info", module: "User", isRead: false, createdAt: new Date("2026-07-23T08:00:00Z") },
      { userId: admin.id, title: "Pekeliling Wajib", message: "Pekeliling 014/2026 ditandai wajib untuk semua cawangan.", type: "warning", module: "Circular", isRead: true, createdAt: new Date("2026-06-25T09:30:00Z") },
    ];
    for (const n of adminNotifs) {
      await db.notification.create({ data: n });
    }
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
