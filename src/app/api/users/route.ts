import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    const safe = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      department: u.department,
      branch: u.branch,
      position: u.position,
      avatarUrl: u.avatarUrl,
      isActive: u.isActive,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    }));
    return NextResponse.json({ items: safe });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/users — create a new user (admin-only convenience endpoint)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role } = body;
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Nama, e-mel, dan peranan diperlukan." },
        { status: 400 }
      );
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "E-mel telah wujud dalam sistem." },
        { status: 400 }
      );
    }
    const created = await db.user.create({
      data: {
        email: normalizedEmail,
        name: String(name),
        role: String(role),
        password: body.password ?? "perkeso123",
        department: body.department ?? null,
        branch: body.branch ?? null,
        position: body.position ?? null,
        avatarUrl: body.avatarUrl ?? null,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      department: created.department,
      branch: created.branch,
      position: created.position,
      avatarUrl: created.avatarUrl,
      isActive: created.isActive,
      lastLogin: created.lastLogin,
      createdAt: created.createdAt,
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
    delete body.email;
    delete body.createdAt;
    const updated = await db.user.update({ where: { id }, data: body as never });
    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      department: updated.department,
      branch: updated.branch,
      position: updated.position,
      avatarUrl: updated.avatarUrl,
      isActive: updated.isActive,
      lastLogin: updated.lastLogin,
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
    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
