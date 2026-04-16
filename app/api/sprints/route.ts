import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const sprintSchema = z.object({
  naam: z.string().min(1),
  doel: z.string().optional(),
  startDatum: z.string(),
  eindDatum: z.string(),
  status: z.enum(["gepland", "actief", "voltooid"]).optional(),
});

export async function GET() {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const sprints = await prisma.sprint.findMany({
    orderBy: { startDatum: "desc" },
    include: {
      _count: { select: { items: true } },
      items: {
        include: {
          story: { select: { punten: true, status: true } },
        },
      },
    },
  });
  return NextResponse.json(sprints);
}

export async function POST(request: Request) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const data = sprintSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const sprint = await prisma.sprint.create({
    data: {
      ...data.data,
      startDatum: new Date(data.data.startDatum),
      eindDatum: new Date(data.data.eindDatum),
    },
  });
  return NextResponse.json(sprint, { status: 201 });
}
