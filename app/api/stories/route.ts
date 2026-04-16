import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const storySchema = z.object({
  titel: z.string().min(1),
  beschrijving: z.string().optional(),
  acceptatiecriteria: z.string().optional(),
  prioriteit: z.enum(["must", "should", "could", "wont"]).optional(),
  punten: z.number().optional().nullable(),
  status: z.enum(["backlog", "sprint", "gereed"]).optional(),
  epicId: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const epicId = searchParams.get("epicId");
  const prioriteit = searchParams.get("prioriteit");
  const status = searchParams.get("status");

  const stories = await prisma.userStory.findMany({
    where: {
      ...(epicId ? { epicId } : {}),
      ...(prioriteit ? { prioriteit } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { volgorde: "asc" },
    include: { epic: { select: { id: true, titel: true, kleur: true } } },
  });
  return NextResponse.json(stories);
}

export async function POST(request: Request) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const data = storySchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const aantalStories = await prisma.userStory.count();
  const story = await prisma.userStory.create({
    data: { ...data.data, volgorde: aantalStories + 1 },
    include: { epic: { select: { id: true, titel: true, kleur: true } } },
  });
  return NextResponse.json(story, { status: 201 });
}
