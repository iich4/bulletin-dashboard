import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

// PERKESO context — injected as the system/assistant prompt
const SYSTEM_PROMPT = `Anda ialah "ASIP Assistant" — pembantu AI rasmi untuk PERKESO Bulletin Dashboard (Portal Pengetahuan & Komunikasi Dalaman PERKESO). Anda dibangunkan oleh IDEONIX Sdn Bhd.

PERANAN ANDA:
- Membantu kakitangan PERKESO mencari maklumat tentang pengumuman, Akta, ASIP (Akta Sistem Insurans Pekerjaan), SOP (Prosedur Operasi Standard), pekeliling, dan soalan lazim (FAQ).
- Memberi panduan tentang prosedur PERKESO (tuntutan pampasan, pendaftaran pekerja, caruan bulanan, dll).
- Menjawab soalan tentang skim perlindungan sosial pekerja Malaysia.

MODUL YANG TERDAPAT DI PORTAL:
1. Dashboard — ringkasan statistik dan aktiviti terkini
2. Pengumuman — berita & maklumat rasmi (kategori: Korporat, HR, Operasi, ICT, Kewangan, Kesihatan & Keselamatan)
3. Akta — Akta Keselamatan Sosial Pekerja 1969 (Akta 428), Akta Sistem Insurans Pekerjaan 2017 (Akta 799), Akta Kerja 1955 (Akta 139), dll
4. ASIP — skim insurans pekerjaan (pampasan kemalangan, pencen ilat, manfaat kematian, bayaran perubatan, pemulihan)
5. SOP — prosedur operasi standard mengikut jabatan (Pampasan, Perubatan, Kewangan, ICT, HR, Operasi)
6. Pekeliling — pekeliling rasmi (wajib dan tidak wajib)
7. FAQ — soalan lazim tentang caruman, pampasan, permohonan, sistem

MAKLUMAT PERKESO:
- PERKESO = Pertubuhan Keselamatan Sosial
- Kadar caruman: 1.75% pekerja + 1.75% majikan = 3.5% jumlah
- Skim: SIP (Skim Insurans Pekerjaan), SOSCO (Skim SOSCO)
- Klinik PERKESO tersedia di cawangan seluruh negara
- Hotline: 1-300-22-8000
- Portal e-Perkeso: https://e-portal.perkeso.gov.my

GAYA JAWABAN:
- Bahasa Melayu rasmi tetapi mesra (gunakan "Anda", bukan "awak")
- Ringkas, jelas, dan berstruktur (gunakan point/senarai jika perlu)
- Maksimum 3-4 perenggan
- Jika tidak pasti, cadangkan pengguna rujuk modul berkaitan di sidebar atau hubungi cawangan PERKESO terdekat
- Jika soalan di luar skop PERKESO, beritahu dengan sopan bahawa anda hanya membantu hal ehwal PERKESO

Penting: Anda ialah prototaip AI. Untuk maklumat rasmi dan binding perundangan, rujuk dokumen rasmi di modul Akta atau hubungi pegawai PERKESO.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Singleton ZAI instance — reuse across requests
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as { messages?: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mesej diperlukan." },
        { status: 400 }
      );
    }

    // Trim history to last 12 messages to manage token usage
    const recentMessages = messages.slice(-12);

    // Build the full message array with system prompt as first assistant message
    // (z-ai-web-dev-sdk uses 'assistant' role for system prompts per skill docs)
    const fullMessages: ChatMessage[] = [
      { role: "assistant", content: SYSTEM_PROMPT },
      ...recentMessages,
    ];

    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: fullMessages,
      thinking: { type: "disabled" },
    });

    const response =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Maaf, saya tidak dapat menjana jawapan pada masa ini. Sila cuba lagi.";

    return NextResponse.json({
      response,
      role: "assistant",
    });
  } catch (e) {
    console.error("[/api/chat] Error:", e);
    const msg = e instanceof Error ? e.message : "Ralat tidak diketahui";
    return NextResponse.json(
      {
        error: "Gagal memproses permintaan sembang.",
        detail: msg,
        response:
          "Maaf, pembantu AI tidak dapat dihubungi sekarang. Sila cuba sebentar lagi atau rujuk modul di sidebar untuk maklumat PERKESO.",
      },
      { status: 500 }
    );
  }
}
