import { prisma } from "@/lib/prisma";
import { StrategieClient } from "@/components/strategie/StrategieClient";

export const dynamic = "force-dynamic";

export default async function StrategiePagina() {
  const [product, okrs, roadmapItems, epics] = await Promise.all([
    prisma.product.findFirst(),
    prisma.oKR.findMany({
      orderBy: [{ jaar: "desc" }, { kwartaal: "desc" }],
      include: { keyResults: true },
    }),
    prisma.roadmapItem.findMany({
      orderBy: [{ jaar: "asc" }, { kwartaal: "asc" }],
      include: { epic: { select: { id: true, titel: true, kleur: true } } },
    }),
    prisma.epic.findMany({ orderBy: { volgorde: "asc" } }),
  ]);

  return (
    <StrategieClient
      product={product}
      okrs={okrs}
      roadmapItems={roadmapItems}
      epics={epics}
    />
  );
}
