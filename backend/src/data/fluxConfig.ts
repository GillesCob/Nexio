export const FLUX_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.7, // en dessous → modale de classification ambiguë
  PROD_DATE: new Date("2026-07-17T00:00:00Z"), // date pivot pour les relances
  // Message de clôture (dernière relance) mis en pause jusqu'au retour de congés estivaux —
  // même date que la réouverture programmée des contacts fermés "Pas pour le moment" (24/07).
  SUMMER_PAUSE_UNTIL: new Date("2026-09-06T00:00:00Z"),
};
