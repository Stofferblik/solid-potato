import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const okrUpdateSchema = z.object({
  objective: z.string().min(1).optional(),
  kwartaal: z.number().min(1).max(4).optional(),
  jaar: z.number().optional(),
});

const keyResultUpdateSchema = z.object({
  keyResultId: z.string(),
  huidig: z.string(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Controleer of het een key result update is
  const krUpdate = keyResultUpdateSchema.safeParse(body);
  if (krUpdate.success) {
    const kr = await prisma.keyResult.update({
      where: { id: krUpdate.data.keyResultId },
      data: { huidig: krUpdate.data.huidig },
    });
    return NextResponse.json(kr);
  }

  const data = okrUpdateSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const okr = await prisma.oKR.update({
    where: { id },
    data: data.data,
    include: { keyResults: true },
  });
  return NextResponse.json(okr);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  await prisma.oKR.delete({ where: { id } });
  return NextResponse.json({ succes: true });
}
