import { Company, Contact, ContactStatus } from "@prisma/client";
import { AppError } from "../middlewares/errorMiddleware";
import { prisma } from "../lib/prisma";
import { classifyContactFlux } from "./fluxClassifier";

type ICreateContactOutcome = "created" | "enriched" | "unchanged" | "ambiguous";

interface ICreateContactResult {
  // null uniquement pour "ambiguous" : rien n'est créé ni modifié tant que ce n'est pas
  // résolu à la main, jamais de choix arbitraire entre plusieurs contacts candidats.
  contact: Contact | null;
  outcome: ICreateContactOutcome;
  // true tant que le contact n'est pas lié à une Company enrichie (sector/description) :
  // c'est ce signal, pas `outcome`, qui dit s'il faut encore aller chercher les infos entreprise.
  needsCompanyInfo: boolean;
}

function isFilled(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

// Deux contacts identiques peuvent avoir des chaînes différentes (emoji décoratifs autour du
// nom, ex. "👨🏻‍💻 Thibaud Chauvière 👨🏻‍💻" vs "Thibaud Chauvière") : on neutralise ce bruit
// avant de comparer, sans quoi un rapprochement par nom exact peut manquer le bon contact.
function normalizeName(name: string): string {
  return name
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[️‍]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Ne matche jamais au hasard : `linkedinUrl` (exact) est la seule clé pleinement fiable.
// À défaut, le nom normalisé sert de repli (utile pour les vieux imports sans URL), mais si
// plusieurs contacts partagent ce nom normalisé, on refuse de deviner lequel est le bon.
async function findContactMatch(
  userId: string,
  data: ICreateContactData
): Promise<{ match: (Contact & { companyRef: Company | null }) | null; ambiguous: boolean }> {
  if (data.linkedinUrl) {
    const byUrl = await prisma.contact.findFirst({
      where: { userId, linkedinUrl: data.linkedinUrl },
      include: { companyRef: true },
    });
    if (byUrl) return { match: byUrl, ambiguous: false };
  }

  const normalized = normalizeName(data.name);
  const sameUser = await prisma.contact.findMany({ where: { userId }, select: { id: true, name: true } });
  const candidateIds = sameUser.filter((c) => normalizeName(c.name) === normalized).map((c) => c.id);

  if (candidateIds.length === 0) return { match: null, ambiguous: false };
  if (candidateIds.length > 1) return { match: null, ambiguous: true };

  const match = await prisma.contact.findUnique({
    where: { id: candidateIds[0] },
    include: { companyRef: true },
  });
  return { match, ambiguous: false };
}

// Tente de lier le contact à une Company déjà enrichie (même nom, insensible à la casse,
// ou id explicite fourni) : évite de redemander les infos entreprise si un autre contact
// de la même boîte a déjà été traité. Ne fait rien si aucune Company enrichie ne matche.
async function tryAutoLinkCompany(
  contact: Contact,
  explicitCompanyId?: string
): Promise<{ contact: Contact; companyRef: Company | null }> {
  const company = explicitCompanyId
    ? await prisma.company.findUnique({ where: { id: explicitCompanyId } })
    : contact.company
      ? await prisma.company.findFirst({
          where: { name: { equals: contact.company, mode: "insensitive" } },
        })
      : null;

  if (!company?.sector) {
    return { contact, companyRef: company ?? null };
  }

  try {
    const classification = await classifyContactFlux({
      jobTitle: contact.jobTitle,
      companyName: company.name,
      companyDescription: company.description,
      companySector: company.sector,
    });

    const updated = await prisma.contact.update({
      where: { id: contact.id },
      data: {
        companyId: company.id,
        ...(classification.flux !== "unknown"
          ? { flux: classification.flux, fluxConfidence: classification.confidence }
          : {}),
      },
    });
    return { contact: updated, companyRef: company };
  } catch (err) {
    console.error("[contactService] auto-link company failed, contact left without link:", err);
    return { contact, companyRef: company };
  }
}

interface ICreateContactData {
  name: string;
  company?: string;
  linkedinUrl?: string;
  jobTitle?: string;
  location?: string;
  status?: ContactStatus;
  notes?: string;
  jobOfferId?: string;
  companyId?: string;
  contactedAt?: string;
}

interface IUpdateContactData {
  name?: string;
  company?: string;
  linkedinUrl?: string;
  jobTitle?: string;
  location?: string;
  status?: ContactStatus;
  notes?: string;
  jobOfferId?: string;
  companyId?: string;
  flux?: "1a" | "1b" | "2" | "3" | "4";
  closeReason?: "not_interested" | "not_now";
  remindAt?: string;
}

async function assertOwnership(userId: string, contactId: string) {
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact || contact.userId !== userId) {
    throw new AppError(404, "Contact not found");
  }
  return contact;
}

export async function createContact(
  userId: string,
  data: ICreateContactData
): Promise<ICreateContactResult> {
  const { match: existing, ambiguous } = await findContactMatch(userId, data);

  if (ambiguous) {
    return { contact: null, outcome: "ambiguous", needsCompanyInfo: false };
  }

  let contact: Contact;
  let companyRef: Company | null;
  let outcome: ICreateContactOutcome;

  if (existing) {
    const enrichData: Partial<ICreateContactData> = {};
    if (!isFilled(existing.company) && data.company) enrichData.company = data.company;
    if (!isFilled(existing.jobTitle) && data.jobTitle) enrichData.jobTitle = data.jobTitle;
    if (!isFilled(existing.location) && data.location) enrichData.location = data.location;
    if (!isFilled(existing.linkedinUrl) && data.linkedinUrl) enrichData.linkedinUrl = data.linkedinUrl;

    const hasUpdate = Object.keys(enrichData).length > 0;
    contact = hasUpdate
      ? await prisma.contact.update({ where: { id: existing.id }, data: enrichData })
      : existing;
    companyRef = existing.companyRef;
    outcome = hasUpdate ? "enriched" : "unchanged";
  } else {
    const { contactedAt, ...rest } = data;
    const createData = contactedAt
      ? { ...rest, userId, status: "contacted" as ContactStatus, contactedAt: new Date(contactedAt) }
      : { ...rest, userId };
    contact = await prisma.contact.create({ data: createData });
    companyRef = null;
    outcome = "created";
  }

  if (!companyRef?.description) {
    const linked = await tryAutoLinkCompany(contact, data.companyId);
    contact = linked.contact;
    companyRef = linked.companyRef;
  }

  return {
    contact,
    outcome,
    needsCompanyInfo: !isFilled(companyRef?.description ?? null),
  };
}

export async function getContacts(userId: string) {
  return prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { companyRef: true },
  });
}

export async function getContactById(userId: string, contactId: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { companyRef: true },
  });
  if (!contact || contact.userId !== userId) {
    throw new AppError(404, "Contact not found");
  }
  return contact;
}

export async function updateContact(userId: string, contactId: string, data: IUpdateContactData) {
  const { companyId, company, ...rest } = data;
  const shouldPreserveUpdatedAt = Object.keys(rest).length === 0;
  await assertOwnership(userId, contactId);
  const current = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { updatedAt: true, contactedAt: true },
  });

  if (shouldPreserveUpdatedAt) {
    return prisma.contact.update({
      where: { id: contactId },
      data: { companyId, company, updatedAt: current?.updatedAt },
    });
  }

  const becomingContacted = data.status === "contacted" && !current?.contactedAt;
  // Un flux choisi à la main est une décision humaine, pas une estimation IA : confiance maximale,
  // remplace toujours une éventuelle classification automatique précédente.
  const manualFlux = data.flux ? { fluxConfidence: 1 } : {};
  const { remindAt: remindAtInput, ...dataWithoutRemindAt } = data;
  const remindAtDate = remindAtInput ? { remindAt: new Date(remindAtInput) } : {};
  // Sortir de "closed" (reprise manuelle) efface les métadonnées de fermeture : sans ça, un
  // remindAt périmé pourrait rouvrir le contact une seconde fois plus tard pour rien.
  const clearCloseMeta =
    data.status && data.status !== "closed" ? { closeReason: null, remindAt: null } : {};

  return prisma.contact.update({
    where: { id: contactId },
    data: {
      ...dataWithoutRemindAt,
      ...manualFlux,
      ...remindAtDate,
      ...clearCloseMeta,
      ...(becomingContacted ? { contactedAt: new Date() } : {}),
    },
  });
}

export async function deleteContact(userId: string, contactId: string) {
  await assertOwnership(userId, contactId);
  await prisma.contact.delete({ where: { id: contactId } });
}

export async function touchContact(userId: string, contactId: string) {
  await assertOwnership(userId, contactId);
  return prisma.contact.update({
    where: { id: contactId },
    data: { updatedAt: new Date() },
  });
}
