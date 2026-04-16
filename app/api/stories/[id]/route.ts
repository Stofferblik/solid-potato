import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const storyUpdateSchema = z.object({
  titel: z.string().min(1).optional(),
  beschrijving: z.string().optional(),
  acceptatiecriteria: z.string().optional(),
  prioriteit: z.enum(["must", "should", "could", "wont"]).optional(),
  punten: z.number().optional().nullable(),
  status: z.enum(["backlog", "sprint", "gereed"]).optional(),
  epicId: z.string().optional().nullable(),
  volgorde: z.number().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const data = storyUpdateSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const story = await prisma.userStory.update({
    where: { id },
    data: data.data,
    include: { epic: { select: { id: true, titel: true, kleur: true } } },
  });
  return NextResponse.json(story);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  await prisma.userStory.delete({ where: { id } });
  return NextResponse.json({ succes: true });
}
