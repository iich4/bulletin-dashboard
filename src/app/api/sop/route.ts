import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const department = url.searchParams.get("department");
    const search = url.searchParams.get("search")?.toLowerCase();

    const where: Record<string, unknown> = {};
    if (department && department !== "all") where.department = department;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { approvedBy: { contains: search, mode: "insensitive" } },
      ];
    }
    const items = await db.sop.findMany({
      where,
      orderBy: { dateApproved: "desc" },
    });
    const parsed = items.map((s) => ({
      ...s,
      procedureSteps: JSON.parse(s.procedureSteps as string),
    }));
    return NextResponse.json({ items: parsed });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.department) {
      return NextResponse.json(
        { error: "Tajuk dan jabatan diperlukan." },
        { status: 400 }
      );
    }
    const created = await db.sop.create({
      data: {
        title: body.title,
        department: body.department,
        description: body.description ?? "",
        procedureSteps: JSON.stringify(body.procedureSteps ?? []),
        fileName: body.fileName ?? null,
        fileSize: body.fileSize ?? null,
        version: body.version ?? "1.0",
        approvedBy: body.approvedBy ?? "",
        dateApproved: body.dateApproved ? new Date(body.dateApproved) : new Date(),
        status: body.status ?? "Aktif",
      },
    });
    return NextResponse.json({
      ...created,
      procedureSteps: JSON.parse(created.procedureSteps as string),
    });
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
    if (body.procedureSteps) body.procedureSteps = JSON.stringify(body.procedureSteps);
    if (body.dateApproved) body.dateApproved = new Date(body.dateApproved);
    const updated = await db.sop.update({ where: { id }, data: body as never });
    return NextResponse.json({
      ...updated,
      procedureSteps: JSON.parse(updated.procedureSteps as string),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    await db.sop.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
