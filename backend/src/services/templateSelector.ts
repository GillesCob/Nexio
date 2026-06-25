import { FLUX_CONFIG } from "../data/fluxConfig";

export interface TemplateSelectorInput {
  flux: string | null;
  contactedAt: Date | null;
  relanceCount: number;
}

export function selectTemplate(contact: TemplateSelectorInput): string | null {
  const { flux, contactedAt, relanceCount } = contact;

  if (flux === null) return null;

  if (contactedAt === null) return `${flux}_first_contact`;

  if (flux === "1b") {
    if (relanceCount === 0) return "1b_relance";
    if (relanceCount === 1) return "1b_relance_final";
    return null;
  }

  if (relanceCount === 0) {
    return contactedAt < FLUX_CONFIG.PROD_DATE
      ? `${flux}_relance_before_17_07`
      : `${flux}_relance_after_17_07`;
  }

  if (relanceCount === 1) return `${flux}_relance_final`;

  return null;
}
