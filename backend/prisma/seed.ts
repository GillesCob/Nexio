import { PrismaClient, Role, ContactStatus, JobOfferStatus } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function main() {
  const adminPassword = await argon2.hash("admin1234");
  const guestPassword = await argon2.hash("guest123");

  await prisma.user.upsert({
    where: { email: "admin@nexio.dev" },
    update: {},
    create: {
      email: "admin@nexio.dev",
      password: adminPassword,
      role: Role.admin,
    },
  });

  const guestUser = await prisma.user.upsert({
    where: { email: "guest@nexio.dev" },
    update: { password: guestPassword },
    create: {
      email: "guest@nexio.dev",
      password: guestPassword,
      role: Role.guest,
    },
  });

  // Réinitialisation des données demo avant recréation (idempotence)
  await prisma.contact.deleteMany({ where: { userId: guestUser.id } });
  await prisma.jobOffer.deleteMany({ where: { userId: guestUser.id } });
  await prisma.linkedInSnapshot.deleteMany({ where: { userId: guestUser.id } });

  // Companies — findFirst + create car name n'est pas @unique dans le schema
  const findOrCreateCompany = async (name: string, data: { sector?: string; size?: string; description?: string }) => {
    const existing = await prisma.company.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.company.create({ data: { name, ...data } });
  };

  const sopraSteriaCompany = await findOrCreateCompany("Sopra Steria", {
    sector: "ESN",
    size: "50 000+ salariés",
    description: "Groupe européen de services numériques et de conseil.",
  });

  const capgeminiCompany = await findOrCreateCompany("Capgemini", {
    sector: "ESN",
    size: "300 000+ salariés",
    description: "Leader mondial du conseil, des services informatiques et de la transformation numérique.",
  });

  const axiansCompany = await findOrCreateCompany("Axians", {
    sector: "ESN / Infra",
    size: "10 000+ salariés",
    description: "Marque ICT de VINCI Energies, spécialisée dans les infrastructures digitales.",
  });

  const zenikaCompany = await findOrCreateCompany("Zenika", {
    sector: "Conseil tech",
    size: "800+ salariés",
    description: "Cabinet de conseil et de formation en technologies innovantes.",
  });

  // Contacts avec messages imbriqués
  await prisma.contact.create({
    data: {
      name: "Sophie Arnaud",
      jobTitle: "Recruteuse IT",
      company: "Sopra Steria",
      status: ContactStatus.to_contact,
      notes: "Recruteuse Sopra Steria Bordeaux — spécialisée profils frontend.",
      updatedAt: daysAgo(5),
      userId: guestUser.id,
      companyId: sopraSteriaCompany.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: "Thomas Leclerc",
      jobTitle: "Lead Developer Frontend",
      company: "Capgemini",
      status: ContactStatus.to_contact,
      notes: "Lead dev JS/TS chez Capgemini Bordeaux. Suit les sujets React.",
      updatedAt: daysAgo(3),
      userId: guestUser.id,
      companyId: capgeminiCompany.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: "Marie Fontaine",
      jobTitle: "CTO",
      company: "TechGironde",
      status: ContactStatus.to_contact,
      notes: "Startup locale en croissance — stack React/Node. Pas encore de poste ouvert visible.",
      updatedAt: daysAgo(1),
      userId: guestUser.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: "Julien Martin",
      jobTitle: "Recruteur Tech",
      company: "Axians",
      status: ContactStatus.contacted,
      updatedAt: daysAgo(8),
      userId: guestUser.id,
      companyId: axiansCompany.id,
      messages: {
        create: [
          {
            content:
              "Bonjour Julien, je me permets de vous contacter suite à la consultation de votre profil LinkedIn. Je suis actuellement en recherche d'un poste de développeur frontend (React/TypeScript) dans la région de Bayonne. Votre activité chez Axians m'a particulièrement intéressé. Seriez-vous disponible pour un échange de quelques minutes ?",
            createdAt: daysAgo(8),
          },
        ],
      },
    },
  });

  await prisma.contact.create({
    data: {
      name: "Claire Bernard",
      jobTitle: "Lead Developer React",
      company: "Zenika",
      status: ContactStatus.contacted,
      updatedAt: daysAgo(6),
      userId: guestUser.id,
      companyId: zenikaCompany.id,
      messages: {
        create: [
          {
            content:
              "Bonjour Claire, j'ai lu avec intérêt votre article sur l'architecture frontend et les patterns React avancés — cela rejoint tout à fait mes pratiques actuelles. Je suis en recherche active d'un poste de lead dev ou senior frontend à Bordeaux. Zenika serait un environnement idéal pour la suite. Auriez-vous un moment pour en discuter ?",
            createdAt: daysAgo(6),
          },
        ],
      },
    },
  });

  await prisma.contact.create({
    data: {
      name: "Antoine Roux",
      jobTitle: "CTO",
      company: "DataSud",
      status: ContactStatus.replied,
      updatedAt: daysAgo(2),
      userId: guestUser.id,
      messages: {
        create: [
          {
            content:
              "Bonjour Antoine, je cherche à rejoindre une équipe technique à taille humaine dans le Sud-Ouest. Votre parcours CTO chez DataSud est inspirant et votre approche produit me parle. Je suis développeur TypeScript avec une sensibilité architecture — auriez-vous des opportunités à venir ?",
            createdAt: daysAgo(9),
          },
          {
            content:
              "Merci pour votre retour positif ! Je serais disponible pour un appel la semaine prochaine, aux créneaux qui vous conviennent. Je prépare un portfolio de projets récents que je pourrai partager en amont si vous le souhaitez.",
            createdAt: daysAgo(2),
          },
        ],
      },
    },
  });

  await prisma.contact.create({
    data: {
      name: "Nathalie Simon",
      jobTitle: "Recruteuse IT",
      company: "Accenture",
      status: ContactStatus.replied,
      updatedAt: daysAgo(4),
      userId: guestUser.id,
      messages: {
        create: [
          {
            content:
              "Bonjour Nathalie, suite à la publication de votre offre pour un poste de développeur senior à Bordeaux, je souhaitais vous faire part de ma candidature. Mon profil React/TypeScript correspond au cahier des charges. Je reste disponible pour tout échange.",
            createdAt: daysAgo(10),
          },
        ],
      },
    },
  });

  await prisma.contact.create({
    data: {
      name: "Pierre Lefebvre",
      jobTitle: "Engineering Manager",
      company: "Sopra Steria",
      status: ContactStatus.meeting_scheduled,
      notes: "Entretien prévu jeudi matin. Préparer les questions sur le contexte projet.",
      updatedAt: daysAgo(1),
      userId: guestUser.id,
      companyId: sopraSteriaCompany.id,
      messages: {
        create: [
          {
            content:
              "Bonjour Pierre, je serais très intéressé par un échange concernant les opportunités de Tech Lead chez Sopra Steria. Mon profil est orienté frontend avec une expérience en architecture et en accompagnement d'équipes. Ma disponibilité est immédiate. Seriez-vous disponible pour un appel cette semaine ?",
            createdAt: daysAgo(7),
          },
        ],
      },
    },
  });

  await prisma.contact.create({
    data: {
      name: "Camille Moreau",
      jobTitle: "Recruteuse Tech",
      company: "Capgemini",
      status: ContactStatus.follow_up,
      notes: "Pas de réponse depuis 2 semaines. Relancer avec une nouvelle accroche.",
      updatedAt: daysAgo(14),
      userId: guestUser.id,
      companyId: capgeminiCompany.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: "Lucas Girard",
      jobTitle: "Lead Developer JS",
      company: "WebAgency64",
      status: ContactStatus.follow_up,
      notes: "Agence locale Pau/Bayonne. Premier message sans réponse.",
      updatedAt: daysAgo(12),
      userId: guestUser.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: "Emma Robert",
      jobTitle: "CTO",
      company: "InfoSud",
      status: ContactStatus.closed,
      notes: "Poste pourvu. A recontacter dans 6 mois si la boîte est en croissance.",
      updatedAt: daysAgo(30),
      userId: guestUser.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: "Baptiste Durand",
      jobTitle: "Tech Lead",
      company: "Axians",
      status: ContactStatus.closed,
      notes: "Pas de budget ouverture de poste avant Q1 prochain.",
      updatedAt: daysAgo(25),
      userId: guestUser.id,
      companyId: axiansCompany.id,
    },
  });

  // JobOffers
  await prisma.jobOffer.create({
    data: {
      title: "Développeur Frontend React/TypeScript",
      company: "Sopra Steria",
      status: JobOfferStatus.wishlist,
      score: 7,
      scoreMatches: ["React 18", "TypeScript", "Agile / Scrum", "Tests unitaires"],
      scoreGaps: ["Angular"],
      scoreComment: "Bon match sur le stack principal. Angular demandé mais non bloquant.",
      stack: ["React", "TypeScript", "Angular", "Jest"],
      location: "Bordeaux",
      remote: true,
      salary: "45-52k€",
      userId: guestUser.id,
    },
  });

  await prisma.jobOffer.create({
    data: {
      title: "Tech Lead Frontend",
      company: "Zenika",
      status: JobOfferStatus.wishlist,
      score: 8,
      scoreMatches: ["React", "TypeScript", "Architecture frontend", "Mentoring"],
      scoreGaps: [],
      scoreComment: "Excellent alignement. Poste de référence à prioriser.",
      stack: ["React", "TypeScript", "GraphQL", "Vite"],
      location: "Bordeaux",
      remote: true,
      salary: "52-62k€",
      userId: guestUser.id,
    },
  });

  await prisma.jobOffer.create({
    data: {
      title: "Senior Developer JS/TS",
      company: "Capgemini",
      status: JobOfferStatus.applied,
      score: 6,
      scoreMatches: ["TypeScript", "Node.js", "REST API"],
      scoreGaps: ["Java", "Spring Boot"],
      scoreComment: "La partie Java est hors périmètre mais le projet semble hybride.",
      stack: ["TypeScript", "Node.js", "Java", "Spring Boot"],
      location: "Bordeaux",
      remote: false,
      salary: "44-50k€",
      userId: guestUser.id,
    },
  });

  await prisma.jobOffer.create({
    data: {
      title: "Lead Dev React",
      company: "Axians",
      status: JobOfferStatus.interview,
      score: 7,
      scoreMatches: ["React", "TypeScript", "REST API", "CI/CD"],
      scoreGaps: ["DevOps / Kubernetes"],
      scoreComment: "Entretien technique prévu. Revoir les bases Kubernetes.",
      stack: ["React", "TypeScript", "Node.js", "Docker", "Kubernetes"],
      location: "Bayonne",
      remote: true,
      salary: "48-56k€",
      userId: guestUser.id,
    },
  });

  await prisma.jobOffer.create({
    data: {
      title: "Développeur Full Stack",
      company: "Accenture",
      status: JobOfferStatus.rejected,
      score: 5,
      scoreMatches: ["JavaScript"],
      scoreGaps: ["Java EE", "Angular", "SAP"],
      scoreComment: "Trop orienté Java/SAP. Non adapté au profil actuel.",
      stack: ["Java EE", "Angular", "SAP", "JavaScript"],
      location: "Bordeaux",
      remote: false,
      salary: "42-48k€",
      userId: guestUser.id,
    },
  });

  // LinkedIn Snapshot — semaine du 16 juin 2026
  await prisma.linkedInSnapshot.create({
    data: {
      weekLabel: "16 juin 2026",
      impressions: 1240,
      impressionsVariation: 15,
      followers: 387,
      followersVariation: 4,
      profileViews: 52,
      profileViewsVariation: 8,
      searchAppearances: 23,
      searchAppearancesVariation: 3,
      postsCount: 2,
      commentsCount: 5,
      createdAt: new Date("2026-06-16"),
      userId: guestUser.id,
    },
  });

  console.log("✓ Seed terminé — 12 contacts, 5 job offers, 1 LinkedIn snapshot pour guest@nexio.dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
