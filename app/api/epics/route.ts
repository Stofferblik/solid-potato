import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const epicSchema = z.object({
  titel: z.string().min(1),
  beschrijving: z.string().optional(),
  status: z.enum(["open", "actief", "gereed"]).optional(),
  kleur: z.string().optional(),
  productId: z.string(),
});

export async function GET() {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const epics = await prisma.epic.findMany({
    orderBy: { volgorde: "asc" },
    include: { _count: { select: { stories: true } } },
  });
  return NextResponse.json(epics);
}

export async function POST(request: Request) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const data = epicSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const aantalEpics = await prisma.epic.count({ where: { productId: data.data.productId } });
  const epic = await prisma.epic.create({
    data: { ...data.data, volgorde: aantalEpics + 1 },
  });
  return NextResponse.json(epic, { status: 201 });
}
