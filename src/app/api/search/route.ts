import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/search?q=keyword
// Cross-module search across announcements, acts, asip, sop, circulars, faqs
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.toLowerCase().trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ groups: {} });
    }

    const [ann, acts, asips, sops, circs, faqs] = await Promise.all([
      db.announcement.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { datePublished: "desc" },
      }),
      db.act.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { actNumber: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { lastUpdated: "desc" },
      }),
      db.asip.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { referenceNo: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { effectiveDate: "desc" },
      }),
      db.sop.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { approvedBy: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { dateApproved: "desc" },
      }),
      db.circular.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { circularNo: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { dateIssued: "desc" },
      }),
      db.faq.findMany({
        where: {
          OR: [
            { question: { contains: q, mode: "insensitive" } },
            { answer: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const groups = {
      announcements: ann.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.summary,
        meta: a.category,
        date: a.datePublished,
      })),
      acts: acts.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.actNumber,
        meta: a.category,
        date: a.lastUpdated,
      })),
      asip: asips.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.referenceNo,
        meta: a.status,
        date: a.effectiveDate,
      })),
      sop: sops.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.department,
        meta: a.approvedBy,
        date: a.dateApproved,
      })),
      circulars: circs.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.circularNo,
        meta: a.category + (a.isMandatory ? " • Wajib" : ""),
        date: a.dateIssued,
      })),
      faq: faqs.map((a) => ({
        id: a.id,
        title: a.question,
        subtitle: a.answer,
        meta: a.category,
        date: a.createdAt,
      })),
    };

    const total =
      groups.announcements.length +
      groups.acts.length +
      groups.asip.length +
      groups.sop.length +
      groups.circulars.length +
      groups.faq.length;

    return NextResponse.json({ groups, total, query: q });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
