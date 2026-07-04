import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, protocol } = new URL(request.url);
  const token = searchParams.get("token");
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") ? rawNext : "/";

  const invalidUrl = new URL(next, request.url);
  invalidUrl.searchParams.set("error", "link_invalido");

  if (!token) {
    return NextResponse.redirect(invalidUrl);
  }

  const record = await prisma.phoneLoginToken.findUnique({ where: { token } });

  if (!record || record.consumedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(invalidUrl);
  }

  await prisma.phoneLoginToken.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  const user = await prisma.user.upsert({
    where: { phone: record.phone },
    update: { phoneVerified: new Date() },
    create: {
      phone: record.phone,
      phoneVerified: new Date(),
      name: record.name,
      role: "USER",
    },
  });

  const useSecureCookies = protocol === "https:";
  const cookieName = useSecureCookies ? "__Secure-authjs.session-token" : "authjs.session-token";

  const jwt = await encode({
    token: {
      sub: user.id,
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      picture: user.image,
    },
    secret: process.env.NEXTAUTH_SECRET!,
    salt: cookieName,
  });

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(cookieName, jwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: useSecureCookies,
  });

  return response;
}
