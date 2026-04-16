import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const productUpdateSchema = z.object({
  naam: z.string().min(1).optional(),
  visie: z.string().optional(),
  beschrijving: z.string().optional(),
});

export async function GET() {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  let product = await prisma.product.findFirst();
  if (!product) {
    product = await prisma.product.create({
      data: { naam: "Mijn Product" },
    });
  }
  return NextResponse.json(product);
}

export async function PUT(request: Request) {
  const sessie = await auth();
  if (!sessie) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const data = productUpdateSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

  let product = await prisma.product.findFirst();
  if (!product) {
    product = await prisma.product.create({ data: { naam: "Mijn Product" } });
  }
  const bijgewerkt = await prisma.product.update({
    where: { id: product.id },
    data: data.data,
  });
  return NextResponse.json(bijgewerkt);
}
