import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase();

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { referenceNo: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    const items = await db.asip.findMany({
      where,
      orderBy: { effectiveDate: "desc" },
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.referenceNo) {
      return NextResponse.json(
        { error: "Tajuk dan nombor rujukan diperlukan." },
        { status: 400 }
      );
    }
    const created = await db.asip.create({
      data: {
        title: body.title,
        referenceNo: body.referenceNo,
        description: body.description ?? "",
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
        fileName: body.fileName ?? null,
        fileSize: body.fileSize ?? null,
        status: body.status ?? "Aktif",
        category: body.category ?? "Umum",
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
    if (body.effectiveDate) body.effectiveDate = new Date(body.effectiveDate);
    const updated = await db.asip.update({ where: { id }, data: body as never });
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
    await db.asip.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
