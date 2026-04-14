import { prisma } from "@/lib/prisma";
import { StakeholdersClient } from "@/components/stakeholder/StakeholdersClient";

export const dynamic = "force-dynamic";

export default async function StakeholdersPagina() {
  const stakeholders = await prisma.stakeholder.findMany({
    orderBy: { naam: "asc" },
  });

  return <StakeholdersClient initialStakeholders={stakeholders} />;
}
