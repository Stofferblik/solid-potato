import { NextResponse } from "next/server";
import { createSession, COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const validUsername = process.env.PO_USERNAME ?? "admin";
  const validPassword = process.env.PO_PASSWORD ?? "admin123";

  if (username !== validUsername || password !== validPassword) {
    return NextResponse.json(
      { error: "Onjuiste gebruikersnaam of wachtwoord" },
      { status: 401 }
    );
  }

  const token = await createSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
