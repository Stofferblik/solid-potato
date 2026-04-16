import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const stakeholderUpdateSchema = z.object({
  naam: z.string().min(1).optional(),
  rol: z.string().optional(),
  organisatie: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefoon: z.string().optional(),
  invloed: z.number().min(1).max(5).optional(),
  belang: z.number().min(1).max(5).optional(),
  notities: z.string().optional(),
  categorie: z.enum(["sponsor", "gebruiker", "expert", "management"]).optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data = stakeholderUpdateSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const stakeholder = await prisma.stakeholder.update({ where: { id }, data: data.data });
  return NextResponse.json(stakeholder);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  await prisma.stakeholder.delete({ where: { id } });
  return NextResponse.json({ succes: true });
}
