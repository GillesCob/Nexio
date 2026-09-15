import "dotenv/config";
import { classifyContactFlux } from "../fluxClassifier";

// Test d'intégration réel (appelle Groq) : rejoue les 4 cas réels documentés dans
// Projets/Nexio/app-lessons.md (11/08) qui ont motivé le resserrement du prompt flux 4.
// Motif corrigé : le prompt sur-déclenchait flux 4 dès qu'un signal ESN/conseil apparaissait
// (nom d'entreprise, mots-clés "transformation numérique"/"conseil"), sans vérifier que le
// titre du contact correspond réellement à une fonction business/account manager.
//
// Nécessite GROQ_API_KEY (chargé via dotenv/config) et un accès réseau.
describe("classifyContactFlux — resserrement flux 4 (cas réels du 11/08)", () => {
  it("Marius Bordier (Responsable Power Platform & Chef de projet Digital, Maïsadour — coopérative agricole, pas une ESN) → jamais flux 4", async () => {
    const result = await classifyContactFlux({
      jobTitle: "Responsable Power Platform & Chef de projet Digital",
      companyName: "Maïsadour",
      companyDescription: "Coopérative agricole et agroalimentaire",
      companySector: "Agriculture / Agroalimentaire",
    });
    expect(result.flux).not.toBe("4");
  });

  it("Robert Bidoz (Responsable Région OCCITANIE, Servicad Sud Ouest — bureau d'études VRD/Topographie, pas une ESN) → jamais flux 4", async () => {
    const result = await classifyContactFlux({
      jobTitle: "Responsable Région OCCITANIE",
      companyName: "Servicad Sud Ouest",
      companyDescription: "Bureau d'études VRD / Topographie",
      companySector: "BTP / Ingénierie",
    });
    expect(result.flux).not.toBe("4");
  });

  it("Hugo Eribon (Tech Lead - Responsable technique - Ingénieur Étude et Développement, Sopra Steria — ESN réelle mais titre technique) → jamais flux 4", async () => {
    const result = await classifyContactFlux({
      jobTitle: "Tech Lead - Responsable technique - Ingénieur Étude et Développement",
      companyName: "Sopra Steria",
      companyDescription: "ESN, conseil et services numériques",
      companySector: "Conseil / Services numériques (ESN)",
    });
    expect(result.flux).not.toBe("4");
  });

  it("Christopher Heintz (Account Executive & Team Lead, Numericoach — ESN confirmée, titre réellement commercial) → reste flux 4 (contrôle positif, non-régression)", async () => {
    const result = await classifyContactFlux({
      jobTitle: "Account Executive & Team Lead",
      companyName: "Numericoach",
      companyDescription: "ESN, conseil et services numériques",
      companySector: "Conseil / Services numériques (ESN)",
    });
    expect(result.flux).toBe("4");
  });
});
