import { prisma } from "@/lib/prisma";
import { SprintsClient } from "@/components/sprint/SprintsClient";

export const dynamic = "force-dynamic";

export default async function SprintsPagina() {
  const sprints = await prisma.sprint.findMany({
    orderBy: { startDatum: "desc" },
    include: {
      items: {
        include: {
          story: { select: { punten: true, status: true } },
        },
      },
    },
  });

  return <SprintsClient initialSprints={sprints} />;
}
