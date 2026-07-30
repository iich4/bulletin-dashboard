import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/notifications?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan." }, { status: 400 });
    }
    const items = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const unreadCount = items.filter((n) => !n.isRead).length;
    return NextResponse.json({ items, unreadCount });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PATCH /api/notifications?id=xxx — mark as read
export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const userId = url.searchParams.get("userId");
    const action = url.searchParams.get("action"); // "read" | "readAll"

    if (action === "readAll" && userId) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ ok: true });
    }
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });
    }
    const body = (await req.json().catch(() => ({}))) as { isRead?: boolean };
    const updated = await db.notification.update({
      where: { id },
      data: { isRead: body.isRead ?? true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/notifications — create (used by admin pushes)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.userId || !body.message) {
      return NextResponse.json(
        { error: "userId dan message diperlukan." },
        { status: 400 }
      );
    }
    const created = await db.notification.create({
      data: {
        userId: body.userId,
        title: body.title ?? "Notifikasi",
        message: body.message,
        type: body.type ?? "info",
        module: body.module ?? "Umum",
        refId: body.refId ?? null,
        isRead: false,
      },
    });
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
