import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-Mail und Passwort erforderlich" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Ungültige Anmeldedaten" },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Ungültige Anmeldedaten" },
      { status: 401 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const session = await getSession();
  session.userId = user.id;
  session.userName = user.name;
  session.userRole = user.role;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
