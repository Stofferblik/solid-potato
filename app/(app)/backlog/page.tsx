import { prisma } from "@/lib/prisma";
import { BacklogClient } from "@/components/backlog/BacklogClient";

export const dynamic = "force-dynamic";

export default async function BacklogPagina() {
  const [stories, epics, product] = await Promise.all([
    prisma.userStory.findMany({
      orderBy: { volgorde: "asc" },
      include: { epic: { select: { id: true, titel: true, kleur: true } } },
    }),
    prisma.epic.findMany({ orderBy: { volgorde: "asc" } }),
    prisma.product.findFirst(),
  ]);

  const productId = product?.id ?? "product-1";

  return <BacklogClient initialStories={stories} epics={epics} productId={productId} />;
}
