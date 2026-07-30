import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard-stats — returns aggregate stats for dashboard widgets
export async function GET() {
  try {
    const [
      announcements,
      acts,
      asips,
      sops,
      circulars,
      faqs,
      recentAnnouncements,
      recentCirculars,
      mandatoryCirculars,
    ] = await Promise.all([
      db.announcement.count(),
      db.act.count(),
      db.asip.count(),
      db.sop.count(),
      db.circular.count(),
      db.faq.count(),
      db.announcement.findMany({
        take: 5,
        orderBy: [{ isPinned: "desc" }, { datePublished: "desc" }],
      }),
      db.circular.findMany({
        take: 5,
        orderBy: { dateIssued: "desc" },
      }),
      db.circular.count({ where: { isMandatory: true } }),
    ]);

    // Per-module breakdown for charts
    const announcementsByCategoryRaw = await db.announcement.groupBy({
      by: ["category"],
      _count: { _all: true },
    });
    const circularsByCategoryRaw = await db.circular.groupBy({
      by: ["category"],
      _count: { _all: true },
    });
    const sopsByDepartmentRaw = await db.sop.groupBy({
      by: ["department"],
      _count: { _all: true },
    });
    const actsByCategoryRaw = await db.act.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    // Monthly trend (last 6 months announcements)
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await db.announcement.count({
        where: { datePublished: { gte: start, lt: end } },
      });
      months.push({
        label: start.toLocaleDateString("en-US", { month: "short" }),
        count,
      });
    }

    return NextResponse.json({
      counts: {
        announcements,
        acts,
        asips,
        sops,
        circulars,
        faqs,
        mandatoryCirculars,
      },
      recentAnnouncements: recentAnnouncements.map((a) => ({
        ...a,
        attachments: JSON.parse(a.attachments as string),
      })),
      recentCirculars,
      charts: {
        announcementsByCategory: announcementsByCategoryRaw.map((r) => ({
          label: r.category,
          value: r._count._all,
        })),
        circularsByCategory: circularsByCategoryRaw.map((r) => ({
          label: r.category,
          value: r._count._all,
        })),
        sopsByDepartment: sopsByDepartmentRaw.map((r) => ({
          label: r.department,
          value: r._count._all,
        })),
        actsByCategory: actsByCategoryRaw.map((r) => ({
          label: r.category,
          value: r._count._all,
        })),
        monthlyAnnouncements: months,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
