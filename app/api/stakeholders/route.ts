import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const stakeholderSchema = z.object({
  naam: z.string().min(1),
  rol: z.string().optional(),
  organisatie: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefoon: z.string().optional(),
  invloed: z.number().min(1).max(5),
  belang: z.number().min(1).max(5),
  notities: z.string().optional(),
  categorie: z.enum(["sponsor", "gebruiker", "expert", "management"]).optional(),
});

export async function GET() {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const stakeholders = await prisma.stakeholder.findMany({
    orderBy: { naam: "asc" },
  });
  return NextResponse.json(stakeholders);
}

export async function POST(request: Request) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const data = stakeholderSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const stakeholder = await prisma.stakeholder.create({ data: data.data });
  return NextResponse.json(stakeholder, { status: 201 });
}
