export const FLUX_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.7, // en dessous → modale de classification ambiguë
  PROD_DATE: new Date("2026-07-17T00:00:00Z"), // date pivot pour les relances
  // Message de clôture (dernière relance) : pause estivale levée par anticipation le 01/09
  // (décision explicite de Gilles), pour débloquer la génération sur les contacts flux 2 déjà
  // arrivés à cette étape, sans attendre le retour de congés initialement prévu au 06/09.
  SUMMER_PAUSE_UNTIL: new Date("2026-08-01T00:00:00Z"),
};
