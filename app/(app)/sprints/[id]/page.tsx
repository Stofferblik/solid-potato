import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SprintBoardClient } from "@/components/sprint/SprintBoardClient";

export const dynamic = "force-dynamic";

export default async function SprintDetailPagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [sprint, backlogStories] = await Promise.all([
    prisma.sprint.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { volgorde: "asc" },
          include: {
            story: {
              include: { epic: { select: { id: true, titel: true, kleur: true } } },
            },
          },
        },
      },
    }),
    prisma.userStory.findMany({
      where: { status: "backlog" },
      orderBy: { volgorde: "asc" },
      include: { epic: { select: { id: true, titel: true, kleur: true } } },
    }),
  ]);

  if (!sprint) notFound();

  return <SprintBoardClient sprint={sprint} backlogStories={backlogStories} />;
}
