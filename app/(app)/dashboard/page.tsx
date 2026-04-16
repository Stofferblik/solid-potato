import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPagina() {
  const [product, storiesData, sprints, stakeholders, okrs] = await Promise.all([
    prisma.product.findFirst(),
    prisma.userStory.findMany({
      select: { prioriteit: true, status: true, punten: true },
    }),
    prisma.sprint.findMany({
      orderBy: { startDatum: "desc" },
      take: 5,
      include: {
        items: {
          include: { story: { select: { punten: true } } },
        },
      },
    }),
    prisma.stakeholder.count(),
    prisma.oKR.count(),
  ]);

  const activeSprint = sprints.find((s) => s.status === "actief");
  const activeSprintItems = activeSprint?.items ?? [];
  const activeSprintPunten = activeSprintItems.reduce((sum, i) => sum + (i.story.punten ?? 0), 0);

  const backlogPunten = storiesData
    .filter((s) => s.status === "backlog")
    .reduce((sum, s) => sum + (s.punten ?? 0), 0);

  const statistieken = {
    totalStories: storiesData.length,
    backlogStories: storiesData.filter((s) => s.status === "backlog").length,
    gereedStories: storiesData.filter((s) => s.status === "gereed").length,
    sprintStories: storiesData.filter((s) => s.status === "sprint").length,
    mustHave: storiesData.filter((s) => s.prioriteit === "must").length,
    shouldHave: storiesData.filter((s) => s.prioriteit === "should").length,
    couldHave: storiesData.filter((s) => s.prioriteit === "could").length,
    wontHave: storiesData.filter((s) => s.prioriteit === "wont").length,
    backlogPunten,
    activeSprint: activeSprint ? {
      naam: activeSprint.naam,
      totalItems: activeSprintItems.length,
      totalPunten: activeSprintPunten,
      startDatum: activeSprint.startDatum,
      eindDatum: activeSprint.eindDatum,
    } : null,
    aantalStakeholders: stakeholders,
    aantalOkrs: okrs,
  };

  return (
    <DashboardClient
      product={product}
      statistieken={statistieken}
    />
  );
}
