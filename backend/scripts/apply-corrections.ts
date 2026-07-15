import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

const CORRECTIONS_JSON = process.env.CORRECTIONS_JSON || "";
const TARGET_EMAIL = process.env.NOTION_IMPORT_EMAIL || "";

interface ICorrectionEntry {
  linkedinUrl: string;
  date: string | null;
  dateSource: "contact" | "company" | null;
  cleanCity: string | null;
}

function normUrl(u: string): string {
  return u.trim().replace(/\/$/, "").toLowerCase().split("?")[0];
}

async function main() {
  if (!CORRECTIONS_JSON || !TARGET_EMAIL) {
    throw new Error("CORRECTIONS_JSON et NOTION_IMPORT_EMAIL doivent être définis.");
  }

  const raw = fs.readFileSync(CORRECTIONS_JSON, "utf-8");
  const data: { contactDates: ICorrectionEntry[] } = JSON.parse(raw);

  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) throw new Error(`Utilisateur ${TARGET_EMAIL} introuvable.`);

  const contacts = await prisma.contact.findMany({ where: { userId: user.id } });
  const byUrl = new Map(contacts.map((c) => [normUrl(c.linkedinUrl ?? ""), c]));

  let cityUpdated = 0;
  let dateUpdated = 0;
  let notFound = 0;

  for (const entry of data.contactDates) {
    const contact = byUrl.get(normUrl(entry.linkedinUrl));
    if (!contact) {
      notFound++;
      continue;
    }

    const updateData: { location?: string; createdAt?: Date; updatedAt?: Date } = {};
    if (entry.cleanCity && entry.cleanCity !== contact.location) {
      updateData.location = entry.cleanCity;
      cityUpdated++;
    }
    if (entry.date) {
      updateData.createdAt = new Date(entry.date);
      updateData.updatedAt = new Date(entry.date);
      dateUpdated++;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.contact.update({ where: { id: contact.id }, data: updateData });
    }
  }

  console.log("✓ Corrections appliquées");
  console.log(`  Villes nettoyées : ${cityUpdated}`);
  console.log(`  Dates corrigées : ${dateUpdated}`);
  console.log(`  Non trouvés (skip) : ${notFound}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
