import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Mock authentication — accepts email + password, returns user + token
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Sila masukkan e-mel dan kata laluan." },
        { status: 400 }
      );
    }
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "E-mel atau kata laluan tidak sah." },
        { status: 401 }
      );
    }
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Akaun anda telah dinonaktifkan. Hubungi admin." },
        { status: 403 }
      );
    }
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    const token = `mock-${user.id}-${Date.now()}`;
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "Admin" | "Staff",
        department: user.department,
        branch: user.branch,
        position: user.position,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "RALAT: " + (e as Error).message },
      { status: 500 }
    );
  }
}
