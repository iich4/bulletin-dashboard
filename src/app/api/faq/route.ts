import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search")?.toLowerCase();

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;
    if (search) {
      where.OR = [
        { question: { contains: search } },
        { answer: { contains: search } },
      ];
    }
    const items = await db.faq.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const parsed = items.map((f) => ({
      ...f,
      tags: JSON.parse(f.tags as string),
    }));
    return NextResponse.json({ items: parsed });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.question || !body.answer) {
      return NextResponse.json(
        { error: "Soalan dan jawapan diperlukan." },
        { status: 400 }
      );
    }
    const created = await db.faq.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category ?? "Lain-lain",
        tags: JSON.stringify(body.tags ?? []),
      },
    });
    return NextResponse.json({ ...created, tags: JSON.parse(created.tags as string) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    const body = await req.json();
    delete body.id;
    if (body.tags) body.tags = JSON.stringify(body.tags);
    const updated = await db.faq.update({ where: { id }, data: body as never });
    return NextResponse.json({ ...updated, tags: JSON.parse(updated.tags as string) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    await db.faq.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
