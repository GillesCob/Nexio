import { FLUX_CONFIG } from "../data/fluxConfig";

export interface TemplateSelectorInput {
  flux: string | null;
  contactedAt: Date | null;
  relanceCount: number;
}

export function selectTemplate(contact: TemplateSelectorInput, now: Date = new Date()): string | null {
  const { flux, contactedAt, relanceCount } = contact;

  if (flux === null) return null;

  if (contactedAt === null) return `${flux}_first_contact`;

  if (relanceCount >= 2) return null;

  if (relanceCount === 1) {
    // Dernier message ("clôture") en pause jusqu'au retour de congés, même pour un contact qui
    // atteint cette étape entre-temps : le silence de l'été ne doit pas se lire comme un
    // désintérêt qui justifierait de clore la relation.
    return now < FLUX_CONFIG.SUMMER_PAUSE_UNTIL ? null : `${flux}_relance_final`;
  }

  if (flux === "1b") return "1b_relance";

  // Un contact d'abord messagé AVANT le lancement (17/07) reçoit la relance "after" : Cerithe y
  // est annoncé comme une nouveauté légitime, puisque le 1er message ne pouvait pas le montrer en
  // ligne. Un contact d'abord messagé APRÈS le lancement reçoit la relance "before" (générique,
  // sans réintroduire Cerithe) : le portfolio déjà en ligne était déjà accessible dès le 1er
  // message, pas la peine de le présenter comme une nouvelle annonce. Sens corrigé le 01/08 après
  // qu'un faux rappel ("c'est le projet dont je vous parlais") a été envoyé à Eva Malbeau (Groupe
  // SII), contactée le 20/07 sans que Cerithe soit nommé dans le 1er message.
  return contactedAt < FLUX_CONFIG.PROD_DATE
    ? `${flux}_relance_after_17_07`
    : `${flux}_relance_before_17_07`;
}
