import { PrismaClient, ContactStatus } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

const IMPORT_JSON = process.env.NOTION_IMPORT_JSON || "";
const TARGET_EMAIL = process.env.NOTION_IMPORT_EMAIL || "";

interface IImportCompany {
  name: string;
  description: string | null;
  sector: string | null;
  linkedinUrl: string | null;
  companyType: string;
}

interface IImportContact {
  name: string;
  linkedinUrl: string;
  companyName: string;
  jobTitle: string | null;
  status: string;
  notes: string | null;
  contactedAt: string | null;
  location: string | null;
  source: string;
}

async function main() {
  if (!IMPORT_JSON || !TARGET_EMAIL) {
    throw new Error("NOTION_IMPORT_JSON et NOTION_IMPORT_EMAIL doivent être définis.");
  }

  const raw = fs.readFileSync(IMPORT_JSON, "utf-8");
  const data: { companies: IImportCompany[]; contacts: IImportContact[] } = JSON.parse(raw);

  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) throw new Error(`Utilisateur ${TARGET_EMAIL} introuvable.`);

  const companyIdByName = new Map<string, string>();
  let companiesCreated = 0;
  let companiesReused = 0;

  for (const c of data.companies) {
    const existing = await prisma.company.findFirst({ where: { name: c.name } });
    if (existing) {
      companyIdByName.set(c.name, existing.id);
      companiesReused++;
      continue;
    }
    const created = await prisma.company.create({
      data: {
        name: c.name,
        description: c.description,
        sector: c.sector,
        linkedinUrl: c.linkedinUrl,
        companyType: c.companyType,
      },
    });
    companyIdByName.set(c.name, created.id);
    companiesCreated++;
  }

  let contactsCreated = 0;
  let contactsSkippedExisting = 0;
  let contactsSkippedNoCompany = 0;

  for (const c of data.contacts) {
    const companyId = companyIdByName.get(c.companyName);
    if (!companyId) {
      contactsSkippedNoCompany++;
      continue;
    }

    const existing = await prisma.contact.findFirst({
      where: { userId: user.id, linkedinUrl: c.linkedinUrl },
    });
    if (existing) {
      contactsSkippedExisting++;
      continue;
    }

    await prisma.contact.create({
      data: {
        name: c.name,
        company: c.companyName,
        linkedinUrl: c.linkedinUrl,
        jobTitle: c.jobTitle,
        status: c.status as ContactStatus,
        notes: c.notes,
        contactedAt: c.contactedAt ? new Date(c.contactedAt) : null,
        location: c.location,
        userId: user.id,
        companyId,
      },
    });
    contactsCreated++;
  }

  console.log("✓ Import terminé");
  console.log(`  Companies créées : ${companiesCreated}, réutilisées : ${companiesReused}`);
  console.log(
    `  Contacts créés : ${contactsCreated}, déjà présents (skip) : ${contactsSkippedExisting}, sans entreprise (skip) : ${contactsSkippedNoCompany}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
