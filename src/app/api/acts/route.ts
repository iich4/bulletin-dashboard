import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search")?.toLowerCase();
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { actNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }
    const items = await db.act.findMany({
      where,
      orderBy: { lastUpdated: "desc" },
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.actNumber || !body.title) {
      return NextResponse.json(
        { error: "Nombor akta dan tajuk diperlukan." },
        { status: 400 }
      );
    }
    const created = await db.act.create({
      data: {
        actNumber: body.actNumber,
        title: body.title,
        category: body.category ?? "Lain-lain",
        description: body.description ?? "",
        fileName: body.fileName ?? null,
        fileSize: body.fileSize ?? null,
        version: body.version ?? "1.0",
        status: body.status ?? "Aktif",
        lastUpdated: new Date(),
      },
    });
    return NextResponse.json(created);
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
    body.lastUpdated = new Date();
    const updated = await db.act.update({ where: { id }, data: body as never });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    await db.act.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
