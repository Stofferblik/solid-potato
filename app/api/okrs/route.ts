import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const okrSchema = z.object({
  objective: z.string().min(1),
  kwartaal: z.number().min(1).max(4),
  jaar: z.number().min(2020).max(2100),
  productId: z.string(),
  keyResults: z.array(z.object({
    beschrijving: z.string().min(1),
    target: z.string(),
    huidig: z.string().optional(),
    eenheid: z.string().optional(),
  })).optional(),
});

export async function GET() {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const okrs = await prisma.oKR.findMany({
    orderBy: [{ jaar: "desc" }, { kwartaal: "desc" }],
    include: { keyResults: true },
  });
  return NextResponse.json(okrs);
}

export async function POST(request: Request) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const data = okrSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  const { keyResults, ...okrData } = data.data;
  const okr = await prisma.oKR.create({
    data: {
      ...okrData,
      keyResults: keyResults
        ? { create: keyResults }
        : undefined,
    },
    include: { keyResults: true },
  });
  return NextResponse.json(okr, { status: 201 });
}
