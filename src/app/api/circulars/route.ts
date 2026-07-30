import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search")?.toLowerCase();
    const mandatory = url.searchParams.get("mandatory");
    const sort = url.searchParams.get("sort"); // "newest" | "oldest"

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;
    if (mandatory === "true") where.isMandatory = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { circularNo: { contains: search } },
        { summary: { contains: search } },
      ];
    }
    const items = await db.circular.findMany({
      where,
      orderBy: { dateIssued: sort === "oldest" ? "asc" : "desc" },
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.circularNo || !body.title) {
      return NextResponse.json(
        { error: "Nombor pekeliling dan tajuk diperlukan." },
        { status: 400 }
      );
    }
    const created = await db.circular.create({
      data: {
        circularNo: body.circularNo,
        title: body.title,
        category: body.category ?? "Korporat",
        summary: body.summary ?? "",
        content: body.content ?? "",
        fileName: body.fileName ?? null,
        fileSize: body.fileSize ?? null,
        isMandatory: body.isMandatory ?? false,
        dateIssued: body.dateIssued ? new Date(body.dateIssued) : new Date(),
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
    if (body.dateIssued) body.dateIssued = new Date(body.dateIssued);
    const updated = await db.circular.update({ where: { id }, data: body as never });
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
    await db.circular.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
