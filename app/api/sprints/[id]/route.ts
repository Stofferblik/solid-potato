import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const sprintUpdateSchema = z.object({
  naam: z.string().min(1).optional(),
  doel: z.string().optional(),
  startDatum: z.string().optional(),
  eindDatum: z.string().optional(),
  status: z.enum(["gepland", "actief", "voltooid"]).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { volgorde: "asc" },
        include: {
          story: {
            include: { epic: { select: { id: true, titel: true, kleur: true } } },
          },
        },
      },
    },
  });
  if (!sprint) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(sprint);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data = sprintUpdateSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const updateData: Record<string, unknown> = { ...data.data };
  if (data.data.startDatum) updateData.startDatum = new Date(data.data.startDatum);
  if (data.data.eindDatum) updateData.eindDatum = new Date(data.data.eindDatum);

  const sprint = await prisma.sprint.update({ where: { id }, data: updateData });
  return NextResponse.json(sprint);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  await prisma.sprint.delete({ where: { id } });
  return NextResponse.json({ succes: true });
}
