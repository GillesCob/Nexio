import { PrismaClient } from "@prisma/client";
import { searchAndImportJobOffers } from "../src/services/jobSearchService";

const prisma = new PrismaClient();

const TARGET_EMAIL = process.env.SEARCH_JOBS_EMAIL || "";
const MOTS_CLES = process.env.SEARCH_JOBS_KEYWORDS || "développeur fullstack";

async function main() {
  if (!TARGET_EMAIL) {
    throw new Error("SEARCH_JOBS_EMAIL doit être défini.");
  }

  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) throw new Error(`Utilisateur ${TARGET_EMAIL} introuvable.`);

  const result = await searchAndImportJobOffers(user.id, MOTS_CLES);

  console.log("✓ Recherche terminée");
  console.log(`  Créées : ${result.created}`);
  console.log(`  Déjà présentes (skip) : ${result.skippedExisting}`);
  console.log(`  Extraction échouée (skip) : ${result.skippedInvalid}`);
  if (result.sourceErrors.length > 0) {
    console.log("  Erreurs par source :");
    result.sourceErrors.forEach((e) => console.log("   -", e));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
