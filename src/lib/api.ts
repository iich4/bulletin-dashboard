import { db } from "@/lib/db";

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

// Re-export db for convenient server-side use
export { db };

// Format date in Malay locale
export function formatDateMs(dateStr: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatDateShort(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function timeAgoMs(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Baru sahaja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  const month = Math.floor(day / 30);
  return `${month} bulan lalu`;
}

export function highlightKeyword(text: string, query: string): { text: string; match: boolean }[] {
  if (!query) return [{ text, match: false }];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: { text: string; match: boolean }[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lowerText.indexOf(lowerQuery, i);
    if (idx === -1) {
      parts.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) parts.push({ text: text.slice(i, idx), match: false });
    parts.push({ text: text.slice(idx, idx + query.length), match: true });
    i = idx + query.length;
  }
  return parts;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Korporat: "#007DC5",
  HR: "#8DC63E",
  Operasi: "#00C5AB",
  "Kesihatan & Keselamatan": "#ED1C24",
  ICT: "#F27130",
  Kewangan: "#F9BF10",
  "Akta Sosial": "#007DC5",
  "Akta Insurans": "#00C5AB",
  Peraturan: "#597E26",
  "Lain-lain": "#5F6368",
  Pampasan: "#007DC5",
  Perubatan: "#00C5AB",
  Caruman: "#8DC63E",
  Permohonan: "#F9BF10",
  Sistem: "#F27130",
  Pencen: "#597E26",
  "Manfaat Kematian": "#ED1C24",
  Pemulihan: "#00C5AB",
  "Bayaran Ganti": "#F27130",
  Umum: "#5F6368",
};

export function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || "#5F6368";
}
