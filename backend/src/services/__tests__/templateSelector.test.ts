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

  it("cas 10 : flux 1b, relanceCount 1 → 1b_relance_final", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: new Date("2026-06-01"), relanceCount: 1 })).toBe("1b_relance_final");
  });

  it("cas 11 : flux 1b, relanceCount 2 → null", () => {
    expect(selectTemplate({ flux: "1b", contactedAt: new Date("2026-06-01"), relanceCount: 2 })).toBeNull();
  });

  // --- relance before PROD_DATE (avant 17/07/2026) ---
  it("cas 12 : flux 1a, avant PROD_DATE, relanceCount 0 → 1a_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 0 })).toBe("1a_relance_before_17_07");
  });

  it("cas 13 : flux 2, avant PROD_DATE, relanceCount 0 → 2_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-06-01"), relanceCount: 0 })).toBe("2_relance_before_17_07");
  });

  it("cas 14 : flux 3, veille de PROD_DATE, relanceCount 0 → 3_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "3", contactedAt: new Date("2026-07-16"), relanceCount: 0 })).toBe("3_relance_before_17_07");
  });

  it("cas 15 : flux 4, avant PROD_DATE, relanceCount 0 → 4_relance_before_17_07", () => {
    expect(selectTemplate({ flux: "4", contactedAt: new Date("2026-06-15"), relanceCount: 0 })).toBe("4_relance_before_17_07");
  });

  // --- relance after PROD_DATE (à partir du 17/07/2026) ---
  it("cas 16 : flux 1a, pile PROD_DATE, relanceCount 0 → 1a_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-07-17"), relanceCount: 0 })).toBe("1a_relance_after_17_07");
  });

  it("cas 17 : flux 2, après PROD_DATE, relanceCount 0 → 2_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-08-01"), relanceCount: 0 })).toBe("2_relance_after_17_07");
  });

  it("cas 18 : flux 3, après PROD_DATE, relanceCount 0 → 3_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "3", contactedAt: new Date("2026-09-15"), relanceCount: 0 })).toBe("3_relance_after_17_07");
  });

  it("cas 19 : flux 4, après PROD_DATE, relanceCount 0 → 4_relance_after_17_07", () => {
    expect(selectTemplate({ flux: "4", contactedAt: new Date("2026-12-01"), relanceCount: 0 })).toBe("4_relance_after_17_07");
  });

  // --- relance finale ---
  it("cas 20 : flux 1a, relanceCount 1 → 1a_relance_final", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 1 })).toBe("1a_relance_final");
  });

  it("cas 21 : flux 2, relanceCount 1 → 2_relance_final", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-08-01"), relanceCount: 1 })).toBe("2_relance_final");
  });

  it("cas 22 : flux 3, relanceCount 1 → 3_relance_final", () => {
    expect(selectTemplate({ flux: "3", contactedAt: new Date("2026-06-01"), relanceCount: 1 })).toBe("3_relance_final");
  });

  it("cas 23 : flux 4, relanceCount 1 → 4_relance_final", () => {
    expect(selectTemplate({ flux: "4", contactedAt: new Date("2026-08-01"), relanceCount: 1 })).toBe("4_relance_final");
  });

  // --- relanceCount >= 2 (toutes les relances envoyées) ---
  it("cas 24 : flux 1a, relanceCount 2 → null", () => {
    expect(selectTemplate({ flux: "1a", contactedAt: new Date("2026-06-01"), relanceCount: 2 })).toBeNull();
  });

  it("cas 25 : flux 2, relanceCount 3 → null", () => {
    expect(selectTemplate({ flux: "2", contactedAt: new Date("2026-08-01"), relanceCount: 3 })).toBeNull();
  });
});
