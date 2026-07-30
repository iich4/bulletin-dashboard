import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/announcements?category=Korporat&search=...
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search")?.toLowerCase();

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const items = await db.announcement.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { datePublished: "desc" }],
    });

    const parsed = items.map((a) => ({
      ...a,
      attachments: JSON.parse(a.attachments as string),
    }));

    return NextResponse.json({ items: parsed });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/announcements
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["title", "category", "summary", "content", "authorName"];
    for (const f of required) {
      if (!body[f]) {
        return NextResponse.json(
          { error: `Medan ${f} diperlukan.` },
          { status: 400 }
        );
      }
    }
    const created = await db.announcement.create({
      data: {
        title: body.title,
        category: body.category,
        summary: body.summary,
        content: body.content,
        authorName: body.authorName,
        authorId: body.authorId ?? null,
        isPinned: body.isPinned ?? false,
        isUrgent: body.isUrgent ?? false,
        isNew: true,
        attachments: JSON.stringify(body.attachments ?? []),
        coverColor: body.coverColor ?? "#007DC5",
        datePublished: body.datePublished ? new Date(body.datePublished) : new Date(),
      },
    });
    return NextResponse.json({
      ...created,
      attachments: JSON.parse(created.attachments as string),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PATCH /api/announcements?id=xxx
export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    }
    const body = await req.json();
    const data: Record<string, unknown> = { ...body };
    if (body.attachments) data.attachments = JSON.stringify(body.attachments);
    if (body.datePublished) data.datePublished = new Date(body.datePublished);
    delete data.id;
    const updated = await db.announcement.update({
      where: { id },
      data: data as never,
    });
    return NextResponse.json({
      ...updated,
      attachments: JSON.parse(updated.attachments as string),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// DELETE /api/announcements?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    }
    await db.announcement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
