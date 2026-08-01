import { selectTemplate } from "../templateSelector";

describe("selectTemplate", () => {
  // --- flux null ---
  it("cas 1 : flux null, contactedAt null → null", () => {
    expect(selectTemplate({ flux: null, contactedAt: null, relanceCount: 0 })).toBeNull();
  });

  it("cas 2 : flux null, contactedAt défini → null", () => {
    expect(selectTemplate({ flux: null, contactedAt: new Date("2026-06-01"), relanceCount: 0 })).toBeNull();
  });

  // --- first_contact (contactedAt null) ---
  it("cas 3 : flux 1a, contactedAt null → 1a_first_contact", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: null, relanceCount: 0 })).toBe("1a_first_contact");
  });

  it("cas 4 : flux 1b, contactedAt null → 1b_first_contact", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: null, relanceCount: 0 })).toBe("1b_first_contact");
  });

  it("cas 5 : flux 2, contactedAt null → 2_first_contact", () => {
    expect(selectTemplate({ flux: "2", contactedAt: null, relanceCount: 0 })).toBe("2_first_contact");
  });

  it("cas 6 : flux 3, contactedAt null → 3_first_contact", () => {
    expect(selectTemplate({ flux: "3", contactedAt: null, relanceCount: 0 })).toBe("3_first_contact");
  });

  it("cas 7 : flux 4, contactedAt null → 4_first_contact", () => {
    expect(selectTemplate({ flux: "4", contactedAt: null, relanceCount: 0 })).toBe("4_first_contact");
  });

  // --- flux 1b (cas spécial, pas de variante before/after) ---
  it("cas 8 : flux 1b, avant PROD_DATE, relanceCount 0 → 1b_relance", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: new Date("2026-06-01"), relanceCount: 0 })).toBe("1b_relance");
  });

  it("cas 9 : flux 1b, après PROD_DATE, relanceCount 0 → 1b_relance (pas de variante date)", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: new Date("2026-08-01"), relanceCount: 0 })).toBe("1b_relance");
  });

  it("cas 10 : flux 1b, relanceCount 1, après la pause estivale → 1b_relance_final", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: new Date("2026-06-01"), relanceCount: 1 }, new Date("2026-09-10"))).toBe("1b_relance_final");
  });

  it("cas 11 : flux 1b, relanceCount 2 → null", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: new Date("2026-06-01"), relanceCount: 2 })).toBeNull();
  });

  // --- contact d'abord messagé avant PROD_DATE (17/07/2026) : Cerithe pas encore en ligne au 1er
  // message, la relance l'annonce comme une vraie nouveauté → variante "after_17_07" ---
  it("cas 12 : flux 1a, 1er contact avant PROD_DATE, relanceCount 0 → 1a_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 0 })).toBe("1a_relance_after_17_07");
  });

  it("cas 13 : flux 2, 1er contact avant PROD_DATE, relanceCount 0 → 2_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-06-01"), relanceCount: 0 })).toBe("2_relance_after_17_07");
  });

  it("cas 14 : flux 3, 1er contact la veille de PROD_DATE, relanceCount 0 → 3_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "3", contactedAt: new Date("2026-07-16"), relanceCount: 0 })).toBe("3_relance_after_17_07");
  });

  it("cas 15 : flux 4, 1er contact avant PROD_DATE, relanceCount 0 → 4_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "4", contactedAt: new Date("2026-06-15"), relanceCount: 0 })).toBe("4_relance_after_17_07");
  });

  // --- contact d'abord messagé à partir de PROD_DATE (17/07/2026) : Cerithe déjà en ligne et déjà
  // accessible depuis le 1er message, pas la peine de le réintroduire → variante générique
  // "before_17_07" ---
  it("cas 16 : flux 1a, 1er contact pile PROD_DATE, relanceCount 0 → 1a_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-07-17"), relanceCount: 0 })).toBe("1a_relance_before_17_07");
  });

  it("cas 17 : flux 2, 1er contact après PROD_DATE, relanceCount 0 → 2_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-08-01"), relanceCount: 0 })).toBe("2_relance_before_17_07");
  });

  it("cas 18 : flux 3, 1er contact après PROD_DATE, relanceCount 0 → 3_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "3", contactedAt: new Date("2026-09-15"), relanceCount: 0 })).toBe("3_relance_before_17_07");
  });

  it("cas 19 : flux 4, 1er contact après PROD_DATE, relanceCount 0 → 4_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "4", contactedAt: new Date("2026-12-01"), relanceCount: 0 })).toBe("4_relance_before_17_07");
  });

  it("cas 19b : flux 1a, 1er contact le 20/07 (cas réel Eva Malbeau, Groupe SII), relanceCount 0 → 1a_relance_before_17_07, jamais la variante qui réintroduit Cerithe", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-07-20"), relanceCount: 0 })).toBe("1a_relance_before_17_07");
  });

  // --- relance finale (après la pause estivale, cf. cas 26-29 pour la pause elle-même) ---
  it("cas 20 : flux 1a, relanceCount 1, après la pause → 1a_relance_final", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 1 }, new Date("2026-09-10"))).toBe("1a_relance_final");
  });

  it("cas 21 : flux 2, relanceCount 1, après la pause → 2_relance_final", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-08-01"), relanceCount: 1 }, new Date("2026-09-10"))).toBe("2_relance_final");
  });

  it("cas 22 : flux 3, relanceCount 1, après la pause → 3_relance_final", () => {
    expect(selectTemplate({ flux: "3", contactedAt: new Date("2026-06-01"), relanceCount: 1 }, new Date("2026-09-10"))).toBe("3_relance_final");
  });

  it("cas 23 : flux 4, relanceCount 1, après la pause → 4_relance_final", () => {
    expect(selectTemplate({ flux: "4", contactedAt: new Date("2026-08-01"), relanceCount: 1 }, new Date("2026-09-10"))).toBe("4_relance_final");
  });

  // --- relanceCount >= 2 (toutes les relances envoyées, peu importe la date) ---
  it("cas 24 : flux 1a, relanceCount 2 → null", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 2 })).toBeNull();
  });

  it("cas 25 : flux 2, relanceCount 3 → null", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-08-01"), relanceCount: 3 })).toBeNull();
  });

  // --- pause estivale sur le message de clôture (relanceCount 1, avant le 6 septembre) ---
  it("cas 26 : flux 1b, relanceCount 1, avant la pause (date du jour par défaut) → null", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: new Date("2026-06-01"), relanceCount: 1 })).toBeNull();
  });

  it("cas 27 : flux 1a, relanceCount 1, la veille du 6 septembre → null", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 1 }, new Date("2026-09-05"))).toBeNull();
  });

  it("cas 28 : flux 1a, relanceCount 1, pile le 6 septembre → 1a_relance_final", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 1 }, new Date("2026-09-06"))).toBe("1a_relance_final");
  });

  it("cas 29 : flux 3, relanceCount 1, contact devenu éligible pendant l'été → null tant que le 6/09 n'est pas atteint", () => {
    expect(selectTemplate({ flux: "3", contactedAt: new Date("2026-08-20"), relanceCount: 1 }, new Date("2026-08-25"))).toBeNull();
  });
});
