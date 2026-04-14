import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Product aanmaken
  const product = await prisma.product.upsert({
    where: { id: "product-1" },
    update: {},
    create: {
      id: "product-1",
      naam: "Mijn Product",
      visie:
        "Wij helpen Product Owners om hun werk efficiënter te organiseren door slimme tools voor backlog, strategie en stakeholder management.",
      beschrijving:
        "Een volledig uitgeruste PO-app voor prioritering, planning en communicatie.",
    },
  });

  // Epics aanmaken
  const epic1 = await prisma.epic.create({
    data: {
      titel: "Gebruikersbeheer",
      beschrijving: "Alles rondom inloggen, profielen en rechten",
      status: "actief",
      kleur: "#6366f1",
      volgorde: 1,
      productId: product.id,
    },
  });

  const epic2 = await prisma.epic.create({
    data: {
      titel: "Rapportages & Dashboards",
      beschrijving: "Inzicht in KPIs, voortgang en metrics",
      status: "open",
      kleur: "#10b981",
      volgorde: 2,
      productId: product.id,
    },
  });

  // User Stories aanmaken
  await prisma.userStory.createMany({
    data: [
      {
        titel: "Als PO wil ik kunnen inloggen",
        beschrijving: "Veilig toegang tot de applicatie via gebruikersnaam en wachtwoord",
        acceptatiecriteria:
          "- Inlogformulier aanwezig\n- Foutmelding bij onjuiste gegevens\n- Doorsturen naar dashboard na inloggen",
        prioriteit: "must",
        punten: 3,
        status: "gereed",
        volgorde: 1,
        epicId: epic1.id,
      },
      {
        titel: "Als PO wil ik de backlog kunnen bekijken",
        beschrijving: "Overzicht van alle user stories gesorteerd op prioriteit",
        acceptatiecriteria:
          "- Lijst van stories zichtbaar\n- Filteren op MoSCoW categorie\n- Drag-and-drop volgorde wijzigen",
        prioriteit: "must",
        punten: 5,
        status: "backlog",
        volgorde: 2,
        epicId: epic2.id,
      },
      {
        titel: "Als PO wil ik grafieken zien van sprint voortgang",
        beschrijving: "Visuele weergave van burndown en velocity",
        prioriteit: "should",
        punten: 8,
        status: "backlog",
        volgorde: 3,
        epicId: epic2.id,
      },
      {
        titel: "Als PO wil ik exporteren naar PDF",
        beschrijving: "Backlog en roadmap exporteren als PDF voor presentaties",
        prioriteit: "could",
        punten: 5,
        status: "backlog",
        volgorde: 4,
      },
      {
        titel: "Als PO wil ik integratie met Jira",
        beschrijving: "Synchroniseren van stories met Jira",
        prioriteit: "wont",
        punten: 13,
        status: "backlog",
        volgorde: 5,
      },
    ],
  });

  // Sprint aanmaken
  const nu = new Date();
  const sprint = await prisma.sprint.create({
    data: {
      naam: "Sprint 1",
      doel: "Fundament leggen voor de PO-app",
      startDatum: new Date(nu.getFullYear(), nu.getMonth(), 1),
      eindDatum: new Date(nu.getFullYear(), nu.getMonth(), 14),
      status: "actief",
    },
  });

  console.log("Sprint aangemaakt:", sprint.naam);

  // Stakeholders aanmaken
  await prisma.stakeholder.createMany({
    data: [
      {
        naam: "Anna de Vries",
        rol: "Product Sponsor",
        organisatie: "Bedrijf BV",
        email: "anna@bedrijf.nl",
        invloed: 5,
        belang: 4,
        categorie: "sponsor",
        notities: "Maandelijks overleg. Geïnteresseerd in KPIs en roadmap.",
      },
      {
        naam: "Bas Janssen",
        rol: "Lead Developer",
        organisatie: "Bedrijf BV",
        email: "bas@bedrijf.nl",
        invloed: 3,
        belang: 5,
        categorie: "gebruiker",
        notities: "Dagelijks contact. Technische vragen en dependencies afstemmen.",
      },
      {
        naam: "Carla Smit",
        rol: "UX Designer",
        organisatie: "Bedrijf BV",
        email: "carla@bedrijf.nl",
        invloed: 2,
        belang: 4,
        categorie: "expert",
        notities: "Betrekken bij user story workshops.",
      },
      {
        naam: "Directie",
        rol: "Management",
        organisatie: "Bedrijf BV",
        invloed: 5,
        belang: 2,
        categorie: "management",
        notities: "Kwartaalrapportage sturen. Hoog niveau updates.",
      },
    ],
  });

  // OKR aanmaken
  const okr = await prisma.oKR.create({
    data: {
      objective: "Verhoog gebruikerstevredenheid met onze app",
      kwartaal: 2,
      jaar: 2025,
      productId: product.id,
      keyResults: {
        create: [
          {
            beschrijving: "NPS score verhogen",
            target: "50",
            huidig: "32",
            eenheid: "punten",
          },
          {
            beschrijving: "Dagelijks actieve gebruikers",
            target: "500",
            huidig: "210",
            eenheid: "gebruikers",
          },
          {
            beschrijving: "Gemiddelde sessieduur",
            target: "8",
            huidig: "5.2",
            eenheid: "minuten",
          },
        ],
      },
    },
  });

  // Roadmap items aanmaken
  await prisma.roadmapItem.createMany({
    data: [
      {
        titel: "MVP Lancering",
        beschrijving: "Basisversie met login, backlog en dashboard",
        kwartaal: 1,
        jaar: 2025,
        status: "gereed",
        productId: product.id,
        epicId: epic1.id,
      },
      {
        titel: "Sprint Planning Module",
        beschrijving: "Volledig sprint beheer met kanban board",
        kwartaal: 2,
        jaar: 2025,
        status: "bezig",
        productId: product.id,
      },
      {
        titel: "Stakeholder Portal",
        beschrijving: "Stakeholders kunnen status bekijken via apart portaal",
        kwartaal: 3,
        jaar: 2025,
        status: "gepland",
        productId: product.id,
      },
      {
        titel: "Mobiele App",
        beschrijving: "Native iOS en Android app",
        kwartaal: 4,
        jaar: 2025,
        status: "gepland",
        productId: product.id,
      },
    ],
  });

  console.log("Database succesvol gevuld met demo data!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
