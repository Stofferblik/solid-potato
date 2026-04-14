import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const roadmapSchema = z.object({
  titel: z.string().min(1),
  beschrijving: z.string().optional(),
  kwartaal: z.number().min(1).max(4),
  jaar: z.number().min(2020).max(2100),
  status: z.enum(["gepland", "bezig", "gereed"]).optional(),
  productId: z.string(),
  epicId: z.string().optional().nullable(),
});

export async function GET() {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const items = await prisma.roadmapItem.findMany({
    orderBy: [{ jaar: "asc" }, { kwartaal: "asc" }],
    include: { epic: { select: { id: true, titel: true, kleur: true } } },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const data = roadmapSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const item = await prisma.roadmapItem.create({
    data: data.data,
    include: { epic: { select: { id: true, titel: true, kleur: true } } },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const { id, ...rest } = body;
  const item = await prisma.roadmapItem.update({
    where: { id },
    data: rest,
    include: { epic: { select: { id: true, titel: true, kleur: true } } },
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id vereist" }, { status: 400 });

  await prisma.roadmapItem.delete({ where: { id } });
  return NextResponse.json({ succes: true });
}
