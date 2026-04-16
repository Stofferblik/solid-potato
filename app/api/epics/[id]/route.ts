import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const epicUpdateSchema = z.object({
  titel: z.string().min(1).optional(),
  beschrijving: z.string().optional(),
  status: z.enum(["open", "actief", "gereed"]).optional(),
  kleur: z.string().optional(),
  volgorde: z.number().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data = epicUpdateSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const epic = await prisma.epic.update({ where: { id }, data: data.data });
  return NextResponse.json(epic);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  await prisma.epic.delete({ where: { id } });
  return NextResponse.json({ succes: true });
}
