import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const itemSchema = z.object({
  storyId: z.string(),
});

const itemUpdateSchema = z.object({
  status: z.enum(["todo", "bezig", "klaar"]),
  storyId: z.string(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: sprintId } = await params;
  const body = await request.json();
  const data = itemSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const aantalItems = await prisma.sprintItem.count({ where: { sprintId } });
  const item = await prisma.sprintItem.create({
    data: { sprintId, storyId: data.data.storyId, volgorde: aantalItems + 1 },
    include: { story: { include: { epic: true } } },
  });

  // Update story status naar 'sprint'
  await prisma.userStory.update({
    where: { id: data.data.storyId },
    data: { status: "sprint" },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: sprintId } = await params;
  const body = await request.json();
  const data = itemUpdateSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const item = await prisma.sprintItem.update({
    where: { sprintId_storyId: { sprintId, storyId: data.data.storyId } },
    data: { status: data.data.status },
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessie = await getSession();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: sprintId } = await params;
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("storyId");
  if (!storyId) return NextResponse.json({ error: "storyId vereist" }, { status: 400 });

  await prisma.sprintItem.delete({
    where: { sprintId_storyId: { sprintId, storyId } },
  });

  // Zet story terug naar backlog
  await prisma.userStory.update({
    where: { id: storyId },
    data: { status: "backlog" },
  });

  return NextResponse.json({ succes: true });
}
